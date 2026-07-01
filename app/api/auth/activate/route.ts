import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syntheticEmail } from "@/app/api/auth/signup-lalider/route";

export async function POST(request: NextRequest) {
  const { lala_id, password } = await request.json();

  if (!lala_id?.trim()) return NextResponse.json({ error: "LALA ID is required." }, { status: 400 });
  if (!password || password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("user_id")
    .eq("lala_id", lala_id.trim())
    .single();

  if (!profile) {
    return NextResponse.json({ error: "No account found for this LALA ID." }, { status: 404 });
  }

  const { error } = await admin.auth.admin.updateUserById(profile.user_id, { password });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ email: syntheticEmail(lala_id.trim()) });
}
