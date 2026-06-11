import { createAdminClient } from "@/lib/supabase/admin";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  const admin = createAdminClient();

  const [
    { data: profiles },
    { data: positions },
    { data: matches },
  ] = await Promise.all([
    admin.from("profiles").select("id, full_name, role, location, created_at").order("created_at", { ascending: false }),
    admin
      .from("positions")
      .select("id, title, opportunity_type, location, is_active, created_at, company_profile_id, profiles!company_profile_id(company_name)")
      .order("created_at", { ascending: false }),
    admin
      .from("matches")
      .select("id, score, created_at, position_id, lalider_profile_id, positions(title), profiles!lalider_profile_id(full_name)")
      .order("created_at", { ascending: false }),
  ]);

  const stats = {
    lalideres: profiles?.filter((p) => p.role === "laLider").length ?? 0,
    companies: profiles?.filter((p) => p.role === "company").length ?? 0,
    positions: positions?.length ?? 0,
    matches: matches?.length ?? 0,
  };

  return (
    <AdminDashboard
      stats={stats}
      profiles={profiles ?? []}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      positions={positions as any ?? []}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      matches={matches as any ?? []}
    />
  );
}
