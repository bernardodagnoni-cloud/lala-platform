import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { describeError } from "@/lib/describe-error";

export function syntheticEmail(lalaId: string) {
  return `${lalaId.toLowerCase().replace(/[^a-z0-9._-]/g, "-")}@lalaplatform.internal`;
}

export async function POST(request: NextRequest) {
  const { lala_id, full_name, password, contact_email } = await request.json();

  if (!lala_id?.trim()) return NextResponse.json({ error_code: "missing_lala_id" }, { status: 400 });
  if (!full_name?.trim()) return NextResponse.json({ error_code: "missing_full_name" }, { status: 400 });
  if (!password || password.length < 8) return NextResponse.json({ error_code: "invalid_password" }, { status: 400 });
  if (!contact_email?.trim()) return NextResponse.json({ error_code: "missing_email" }, { status: 400 });

  const admin = createAdminClient();
  const email = syntheticEmail(lala_id.trim());

  // `.maybeSingle()` only populates `error` for real failures (connection/DNS
  // issues, multiple matching rows), not for "no row found" — see the activate
  // route for the full rationale. A lookup failure here must not be silently
  // treated as "ID is free to register".
  try {
    const { data: existingProfile, error } = await admin
      .from("profiles")
      .select("id")
      .eq("lala_id", lala_id.trim())
      .maybeSingle();

    if (error) {
      console.error(`[auth/signup-lalider] existing-profile lookup failed for LALA ID "${lala_id.trim()}": ${describeError(error)}`);
      return NextResponse.json({ error_code: "server_error" }, { status: 503 });
    }

    if (existingProfile) {
      return NextResponse.json({ error_code: "lala_id_taken" }, { status: 409 });
    }
  } catch (e) {
    console.error(`[auth/signup-lalider] existing-profile lookup threw: ${describeError(e)}`);
    return NextResponse.json({ error_code: "server_error" }, { status: 503 });
  }

  let userId: string;
  try {
    const { data, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: full_name.trim(), role: "laLider", lala_id: lala_id.trim() },
    });

    if (createError) {
      // Never forward createError.message to the client — it can be a raw
      // technical string (e.g. "fetch failed" when the DB is unreachable), not
      // something meant for end users. Log the real error server-side instead.
      console.error(`[auth/signup-lalider] createUser failed: ${describeError(createError)}`);
      if (createError.message.includes("already")) {
        return NextResponse.json({ error_code: "lala_id_taken" }, { status: 409 });
      }
      return NextResponse.json({ error_code: "server_error" }, { status: 503 });
    }

    userId = data.user.id;
  } catch (e) {
    console.error(`[auth/signup-lalider] createUser threw: ${describeError(e)}`);
    return NextResponse.json({ error_code: "server_error" }, { status: 503 });
  }

  const { error: insertError } = await admin.from("profiles").insert({
    user_id: userId,
    role: "laLider",
    full_name: full_name.trim(),
    lala_id: lala_id.trim(),
    contact_email: contact_email?.trim() || null,
  });

  if (insertError) {
    console.error(`[auth/signup-lalider] profile insert failed for new user ${userId}: ${describeError(insertError)}`);
    return NextResponse.json({ error_code: "server_error" }, { status: 503 });
  }

  return NextResponse.json({ email });
}
