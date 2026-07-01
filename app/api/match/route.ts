import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRow, PositionRow } from "@/types/database";

const anthropic = new Anthropic();

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { positionId } = await request.json();
  if (!positionId) return NextResponse.json({ error: "positionId required" }, { status: 400 });

  const { data: position } = await supabase
    .from("positions")
    .select("*")
    .eq("id", positionId)
    .single();

  const pos = position as PositionRow | null;
  if (!pos) return NextResponse.json({ error: "Position not found" }, { status: 404 });

  const { data: companyProfile } = await supabase
    .from("profiles")
    .select("user_id, company_name, company_description")
    .eq("id", pos.company_profile_id)
    .single();

  const company = companyProfile as Pick<ProfileRow, "user_id" | "company_name" | "company_description"> | null;
  if (company?.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: lalideres } = await supabase
    .from("profiles")
    .select("id, full_name, location, bio, education, experience, skills, opportunity_type, desired_role, open_to_relocate, life_stage, linkedin_url")
    .eq("role", "laLider")
    .neq("open_to_opportunities", false);

  const candidates = lalideres as Pick<ProfileRow, "id" | "full_name" | "location" | "bio" | "education" | "experience" | "skills" | "opportunity_type" | "desired_role" | "open_to_relocate" | "life_stage" | "linkedin_url">[] | null;

  if (!candidates || candidates.length === 0) {
    return NextResponse.json({ matches: [] });
  }

  const positionContext = `
Position: ${pos.title}
Type: ${pos.opportunity_type}
Work modality: ${pos.work_modality ?? "Not specified"}
Location: ${pos.location ?? "Not specified"}
Company: ${company?.company_name ?? ""}
Company description: ${company?.company_description ?? ""}
Position description: ${pos.description}
Requirements: ${pos.requirements}
`.trim();

  const candidatesList = candidates
    .map((l, i) => `
Candidate ${i + 1} (ID: ${l.id})
Name: ${l.full_name}
Life stage: ${l.life_stage ?? "Not specified"}
Location: ${l.location ?? "Not specified"}
Education: ${l.education ?? "Not specified"}
Experience: ${l.experience ?? "Not specified"}
Skills: ${l.skills ?? "Not specified"}
Opportunity type sought: ${l.opportunity_type ?? "Not specified"}
Desired role / area: ${l.desired_role ?? "Not specified"}
Open to relocate: ${l.open_to_relocate ?? "Not specified"}
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

Scoring guidance on work modality and relocation:
- If the position is Hybrid or In-person, relocation compatibility is a strong signal. Candidates open to international relocation or relocation within the country should score significantly higher than those not open to relocation, unless the candidate's current location already matches the position's location. Unwillingness to relocate for a Hybrid or In-person role should reduce the score by 2-3 points.
- If the position is Remote, relocation openness is irrelevant — do not factor it in.
- Skills, experience, and role fit remain the primary criteria; relocation is a meaningful modifier.
- The candidate's stated desired role and area of interest is a soft signal only — treat it as a minor preference, not a hard requirement. A strong skills and experience match should outweigh a mismatch in desired role.

Scoring guidance on life stage:
- Use life stage to assess fit between the candidate's current situation and the position's seniority and expectations.
- High school or University/College students are best suited for internships, part-time roles, or entry-level fellowships. Matching them to senior full-time roles should reduce the score by 2-3 points.
- MBA or Graduate studies candidates are strong fits for consulting, strategy, management, or roles that require advanced academic preparation.
- Working professionals are best suited for full-time roles and leadership positions. They may be overqualified for internships, which should reduce the score by 1-2 points unless the position explicitly targets experienced candidates.
- If life stage is not specified, do not penalize the candidate — rely on their experience and education instead.

Always return a valid JSON array — no prose before or after it.`,
    messages: [
      {
        role: "user",
        content: `Given this position:\n\n${positionContext}\n\nRank the following candidates from best to worst fit. Return ONLY a JSON array with this exact shape:
[
  {
    "candidateId": "<uuid>",
    "name": "<name>",
    "score": <1-10>,
    "matchReason": "<2-3 sentence explanation of why this candidate fits>",
    "gaps": "<1 sentence on what they might be missing, if anything>"
  }
]

Only include candidates with a score of 4 or above. Candidates:\n\n${candidatesList}`,
      },
    ],
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

  // Save match results to database (upsert so re-runs overwrite)
  if (matches.length > 0) {
    const upsertRows = matches.map((m) => ({
      position_id: positionId,
      lalider_profile_id: m.candidateId,
      score: m.score,
      match_reason: m.matchReason,
      gaps: m.gaps ?? null,
    }));

    await supabase
      .from("matches")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .upsert(upsertRows as any, { onConflict: "position_id,lalider_profile_id" });
  }

  // Attach linkedin_url to each match for display
  const enriched = matches.map((m) => ({
    ...m,
    linkedin_url: candidates.find((c) => c.id === m.candidateId)?.linkedin_url ?? null,
  }));

  return NextResponse.json({ matches: enriched });
}
