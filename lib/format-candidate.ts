import type { WorkExperienceEntry } from "@/types/database";

export function formatWorkExperience(entries: WorkExperienceEntry[] | null | undefined): string {
  if (!entries || entries.length === 0) return "Not specified";
  return entries
    .map((entry) => {
      const range = `${entry.startDate || "?"} – ${entry.current ? "present" : entry.endDate || "?"}`;
      const header = [entry.title, entry.company].filter(Boolean).join(" at ");
      return [header, range, entry.description].filter(Boolean).join(" | ");
    })
    .join("; ");
}

export function formatSkills(skills: string[] | null | undefined, skillsOther: string | null | undefined): string {
  const all = [...(skills ?? []), ...(skillsOther ? [skillsOther] : [])];
  return all.length > 0 ? all.join(", ") : "Not specified";
}

export function formatList(values: string[] | null | undefined): string {
  return values && values.length > 0 ? values.join(", ") : "Not specified";
}
