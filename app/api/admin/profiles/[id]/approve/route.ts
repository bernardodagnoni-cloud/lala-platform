import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import { sendCompanyApprovalEmail } from "@/lib/email";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("user_id, company_name, role")
    .eq("id", id)
    .single();

  if (!profile || profile.role !== "company") {
    return NextResponse.json({ error: "Company profile not found" }, { status: 404 });
  }

  const { error } = await admin
    .from("profiles")
    .update({ approved: true })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  try {
    const { data: authUser } = await admin.auth.admin.getUserById(profile.user_id);
    if (authUser.user?.email) {
      await sendCompanyApprovalEmail({
        toEmail: authUser.user.email,
        companyName: profile.company_name ?? "your company",
      });
    }
  } catch (e) {
    console.error("Failed to send approval email:", e);
  }

  return NextResponse.json({ ok: true });
}
