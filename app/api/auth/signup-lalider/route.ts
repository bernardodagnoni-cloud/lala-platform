import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export function syntheticEmail(lalaId: string) {
  return `${lalaId.toLowerCase().replace(/[^a-z0-9._-]/g, "-")}@lalaplatform.internal`;
}

export async function POST(request: NextRequest) {
  const { lala_id, full_name, password, contact_email } = await request.json();

  if (!lala_id?.trim()) return NextResponse.json({ error: "LALA ID is required." }, { status: 400 });
  if (!full_name?.trim()) return NextResponse.json({ error: "Full name is required." }, { status: 400 });
  if (!password || password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

  const admin = createAdminClient();
  const email = syntheticEmail(lala_id.trim());

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("lala_id", lala_id.trim())
    .single();

  if (existingProfile) {
    return NextResponse.json({ error: "This LALA ID is already registered." }, { status: 409 });
  }

  const { data, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: full_name.trim(), role: "laLider", lala_id: lala_id.trim() },
  });

  if (createError) {
    if (createError.message.includes("already")) {
      return NextResponse.json({ error: "This LALA ID is already registered." }, { status: 409 });
    }
    return NextResponse.json({ error: createError.message }, { status: 500 });
  }

  await admin.from("profiles").insert({
    user_id: data.user.id,
    role: "laLider",
    full_name: full_name.trim(),
    lala_id: lala_id.trim(),
    contact_email: contact_email?.trim() || null,
  });

  return NextResponse.json({ email });
}
