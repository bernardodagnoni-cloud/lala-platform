import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syntheticEmail } from "@/lib/synthetic-email";
import { describeError } from "@/lib/describe-error";

export async function POST(request: NextRequest) {
  const { lala_id, password } = await request.json();

  if (!lala_id?.trim()) return NextResponse.json({ error_code: "missing_lala_id" }, { status: 400 });
  if (!password || password.length < 8) return NextResponse.json({ error_code: "invalid_password" }, { status: 400 });

  const admin = createAdminClient();
  const id = lala_id.trim();
  const email = syntheticEmail(id);

  // `.maybeSingle()` (not `.single()`) returns `data: null, error: null` when no row
  // matches, and only populates `error` for real failures (connection/DNS issues,
  // multiple matching rows, etc). That lets us tell "no such LALA ID" apart from
  // "couldn't reach the database" below — `.single()` conflated the two, so a
  // connection failure was silently reported to the user as "account not found".
  let profile: { user_id: string } | null;
  try {
    const { data, error } = await admin
      .from("profiles")
      .select("user_id")
      .eq("lala_id", id)
      .maybeSingle();

    if (error) {
      console.error(`[auth/activate] profile lookup failed for LALA ID "${id}": ${describeError(error)}`);
      return NextResponse.json({ error_code: "server_error" }, { status: 503 });
    }
    profile = data;
  } catch (e) {
    console.error(`[auth/activate] profile lookup threw for LALA ID "${id}": ${describeError(e)}`);
    return NextResponse.json({ error_code: "server_error" }, { status: 503 });
  }

  // This LALA ID is already on the roster — standard activation: set the
  // password on the pre-seeded account.
  if (profile) {
    try {
      const { error } = await admin.auth.admin.updateUserById(profile.user_id, { password });
      if (error) {
        console.error(`[auth/activate] updateUserById failed: ${describeError(error)}`);
        return NextResponse.json({ error_code: "server_error" }, { status: 500 });
      }
    } catch (e) {
      console.error(`[auth/activate] updateUserById threw: ${describeError(e)}`);
      return NextResponse.json({ error_code: "server_error" }, { status: 503 });
    }

    return NextResponse.json({ email });
  }

  // No existing record for this LALA ID — create one. Name and contact email
  // aren't collected here; `/profile/edit` already requires both before a
  // LaLíder profile is considered complete, so we defer to that single place
  // rather than asking twice. full_name is passed as an empty string (not
  // omitted — the column is NOT NULL and the `on_auth_user_created` DB
  // trigger below inserts straight from this metadata, so a missing
  // full_name makes the trigger's own insert fail, which fails createUser
  // itself) so that profile/edit's existing "full name is required" check
  // still forces it to be filled in.
  let userId: string;
  try {
    const { data, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "laLider", lala_id: id, full_name: "" },
    });

    if (createError) {
      console.error(`[auth/activate] createUser failed: ${describeError(createError)}`);
      if (createError.message.includes("already")) {
        return NextResponse.json({ error_code: "lala_id_taken" }, { status: 409 });
      }
      return NextResponse.json({ error_code: "server_error" }, { status: 503 });
    }

    userId = data.user.id;
  } catch (e) {
    console.error(`[auth/activate] createUser threw: ${describeError(e)}`);
    return NextResponse.json({ error_code: "server_error" }, { status: 503 });
  }

  // A DB trigger (on_auth_user_created) already inserted a bare profiles row
  // from the metadata above — upsert (not insert) so this fills in the rest
  // without colliding with that row on the user_id unique constraint.
  const { error: insertError } = await admin.from("profiles").upsert({
    user_id: userId,
    role: "laLider",
    full_name: "",
    lala_id: id,
    contact_email: null,
  }, { onConflict: "user_id" });

  if (insertError) {
    console.error(`[auth/activate] profile upsert failed for new user ${userId}: ${describeError(insertError)}`);
    return NextResponse.json({ error_code: "server_error" }, { status: 503 });
  }

  return NextResponse.json({ email });
}
