import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendCompanyRegistrationNotification } from "@/lib/email";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, role, company_name, company_description, website, linkedin_url, full_name, registration_notified")
    .eq("user_id", user.id)
    .single();

  if (!profile || profile.role !== "company" || !profile.company_name) {
    return NextResponse.json({ ok: true });
  }

  if (profile.registration_notified) {
    return NextResponse.json({ ok: true });
  }

  try {
    await sendCompanyRegistrationNotification({
      companyName: profile.company_name,
      contactName: profile.full_name,
      companyDescription: profile.company_description,
      website: profile.website,
      linkedinUrl: profile.linkedin_url,
    });

    await admin
      .from("profiles")
      .update({ registration_notified: true })
      .eq("id", profile.id);
  } catch (e) {
    console.error("Failed to send company registration notification:", e);
  }

  return NextResponse.json({ ok: true });
}
