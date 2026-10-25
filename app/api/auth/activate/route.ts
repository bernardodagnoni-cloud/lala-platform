import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syntheticEmail } from "@/app/api/auth/signup-lalider/route";
import { describeError } from "@/lib/describe-error";

export async function POST(request: NextRequest) {
  const { lala_id, password } = await request.json();

  if (!lala_id?.trim()) return NextResponse.json({ error_code: "missing_lala_id" }, { status: 400 });
  if (!password || password.length < 8) return NextResponse.json({ error_code: "invalid_password" }, { status: 400 });

  const admin = createAdminClient();

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
      .eq("lala_id", lala_id.trim())
      .maybeSingle();

    if (error) {
      console.error(`[auth/activate] profile lookup failed for LALA ID "${lala_id.trim()}": ${describeError(error)}`);
      return NextResponse.json({ error_code: "server_error" }, { status: 503 });
    }
    profile = data;
  } catch (e) {
    console.error(`[auth/activate] profile lookup threw for LALA ID "${lala_id.trim()}": ${describeError(e)}`);
    return NextResponse.json({ error_code: "server_error" }, { status: 503 });
  }

  if (!profile) {
    return NextResponse.json({ error_code: "account_not_found" }, { status: 404 });
  }

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

  return NextResponse.json({ email: syntheticEmail(lala_id.trim()) });
}
