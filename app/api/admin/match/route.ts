import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import type { ProfileRow, PositionRow } from "@/types/database";

const anthropic = new Anthropic();

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { positionId } = await request.json();
  if (!positionId) return NextResponse.json({ error: "positionId required" }, { status: 400 });

  const admin = createAdminClient();

  const { data: position } = await admin.from("positions").select("*").eq("id", positionId).single();
  const pos = position as PositionRow | null;
  if (!pos) return NextResponse.json({ error: "Position not found" }, { status: 404 });

  const { data: companyProfile } = await admin
    .from("profiles")
    .select("company_name, company_description")
    .eq("id", pos.company_profile_id)
    .single();

  const { data: lalideres } = await admin
    .from("profiles")
    .select("id, full_name, location, bio, education, experience, skills, opportunity_type, linkedin_url")
    .eq("role", "laLider");

  const candidates = lalideres as Pick<ProfileRow, "id" | "full_name" | "location" | "bio" | "education" | "experience" | "skills" | "opportunity_type" | "linkedin_url">[] | null;

  if (!candidates || candidates.length === 0) {
    return NextResponse.json({ matches: [] });
  }

  const positionContext = `
Position: ${pos.title}
Type: ${pos.opportunity_type}
Location: ${pos.location ?? "Not specified"}
Company: ${companyProfile?.company_name ?? ""}
Company description: ${companyProfile?.company_description ?? ""}
Position description: ${pos.description}
Requirements: ${pos.requirements}
`.trim();

  const candidatesList = candidates
    .map((l, i) => `
Candidate ${i + 1} (ID: ${l.id})
Name: ${l.full_name}
Location: ${l.location ?? "Not specified"}
Education: ${l.education ?? "Not specified"}
Experience: ${l.experience ?? "Not specified"}
Skills: ${l.skills ?? "Not specified"}
Opportunity type sought: ${l.opportunity_type ?? "Not specified"}
About: ${l.bio ?? "Not specified"}
`.trim())
    .join("\n\n---\n\n");

  let response;
  try {
    response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: `You are a talent matching assistant for LALA, an NGO that empowers Latin American leaders (LaLideres).
Your job is to rank LaLider candidates for a given position and explain each match.
Always return a valid JSON array — no prose before or after it.`,
      messages: [{
        role: "user",
        content: `Given this position:\n\n${positionContext}\n\nRank the following candidates from best to worst fit. Return ONLY a JSON array with this exact shape:
[
  {
    "candidateId": "<uuid>",
    "name": "<name>",
    "score": <1-10>,
    "matchReason": "<2-3 sentence explanation>",
    "gaps": "<1 sentence on gaps, if any>"
  }
]
Only include candidates with a score of 4 or above. Candidates:\n\n${candidatesList}`,
      }],
    });
  } catch (aiError) {
    console.error("Anthropic API error:", aiError);
    return NextResponse.json({ error: "AI matching failed. Please try again." }, { status: 502 });
  }

  const text = response.content[0]?.type === "text" ? response.content[0].text : "[]";

  let matches: { candidateId: string; name: string; score: number; matchReason: string; gaps: string }[];
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    matches = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch {
    matches = [];
  }

  if (matches.length > 0) {
    const upsertRows = matches.map((m) => ({
      position_id: positionId,
      lalider_profile_id: m.candidateId,
      score: m.score,
      match_reason: m.matchReason,
      gaps: m.gaps ?? null,
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await admin.from("matches").upsert(upsertRows as any, { onConflict: "position_id,lalider_profile_id" });
  }

  return NextResponse.json({ matches });
}
