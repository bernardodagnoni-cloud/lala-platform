import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";

const XLSX_PATH =
  "/Users/bernardodagnoni/Downloads/[CAR] Dados LALA Match _ WS de Empregabilidade 2026.1.xlsx";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function syntheticEmail(lalaId) {
  return `${lalaId.toLowerCase().replace(/[^a-z0-9._-]/g, "-")}@lalaplatform.internal`;
}

function randomPassword() {
  return `${crypto.randomUUID().replace(/-/g, "")}A1!`;
}

const wb = XLSX.readFile(XLSX_PATH);
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

let created = 0, skipped = 0, errors = 0;

for (const row of rows) {
  const fullName = row["Nome completo"]?.trim();
  const lalaId = row["LALA ID"]?.toString().trim();
  const contactEmail = row["E-mail"]?.trim() || null;

  if (!lalaId || !fullName) continue;

  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("lala_id", lalaId)
    .single();

  if (existing) {
    console.log(`SKIP  ${lalaId} (${fullName}) — already exists`);
    skipped++;
    continue;
  }

  const email = syntheticEmail(lalaId);
  const { data, error: createError } = await admin.auth.admin.createUser({
    email,
    password: randomPassword(),
    email_confirm: true,
    user_metadata: { full_name: fullName, role: "laLider", lala_id: lalaId },
  });

  if (createError) {
    console.error(`ERROR ${lalaId} (${fullName}) — ${createError.message}`);
    errors++;
    continue;
  }

  const { error: profileError } = await admin.from("profiles").insert({
    user_id: data.user.id,
    role: "laLider",
    full_name: fullName,
    lala_id: lalaId,
    contact_email: contactEmail,
  });

  if (profileError) {
    console.error(`ERROR ${lalaId} — profile insert failed: ${profileError.message}`);
    await admin.auth.admin.deleteUser(data.user.id);
    errors++;
    continue;
  }

  console.log(`OK    ${lalaId} (${fullName})`);
  created++;
}

console.log(`\nDone: ${created} created, ${skipped} skipped, ${errors} errors`);
