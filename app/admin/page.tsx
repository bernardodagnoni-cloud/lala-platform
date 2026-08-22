import { createAdminClient } from "@/lib/supabase/admin";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  const admin = createAdminClient();

  const [
    { data: profiles },
    { data: positions },
    { data: matches },
    { data: diversity },
  ] = await Promise.all([
    admin.from("profiles").select("id, full_name, role, phone, location, bio, education, work_experience, skills, skills_other, opportunity_type, desired_role, open_to_relocate, work_arrangements, life_stage, open_to_opportunities, linkedin_url, company_name, company_description, website, approved, created_at").order("created_at", { ascending: false }),
    admin
      .from("positions")
      .select("id, title, opportunity_type, location, affirmative_action, is_active, created_at, company_profile_id, profiles!company_profile_id(company_name)")
      .order("created_at", { ascending: false }),
    admin
      .from("matches")
      .select("id, score, created_at, position_id, lalider_profile_id, positions(title), profiles!lalider_profile_id(full_name)")
      .order("created_at", { ascending: false }),
    admin.from("profile_diversity").select("*"),
  ]);

  const diversityByProfileId = new Map((diversity ?? []).map((d) => [d.profile_id, d]));
  const profilesWithDiversity = (profiles ?? []).map((p) => ({ ...p, diversity: diversityByProfileId.get(p.id) ?? null }));

  const stats = {
    lalideres: profiles?.filter((p) => p.role === "laLider").length ?? 0,
    companies: profiles?.filter((p) => p.role === "company").length ?? 0,
    positions: positions?.length ?? 0,
    matches: matches?.length ?? 0,
  };

  return (
    <AdminDashboard
      stats={stats}
      profiles={profilesWithDiversity}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      positions={positions as any ?? []}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      matches={matches as any ?? []}
    />
  );
}
