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
    .select("id, full_name, location, bio, education, experience, skills, opportunity_type")
    .eq("role", "laLider");

  const candidates = lalideres as Pick<ProfileRow, "id" | "full_name" | "location" | "bio" | "education" | "experience" | "skills" | "opportunity_type">[] | null;

  if (!candidates || candidates.length === 0) {
    return NextResponse.json({ matches: [] });
  }

  const positionContext = `
Position: ${pos.title}
Type: ${pos.opportunity_type}
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
Location: ${l.location ?? "Not specified"}
Education: ${l.education ?? "Not specified"}
Experience: ${l.experience ?? "Not specified"}
Skills: ${l.skills ?? "Not specified"}
Opportunity type sought: ${l.opportunity_type ?? "Not specified"}
About: ${l.bio ?? "Not specified"}
`.trim())
    .join("\n\n---\n\n");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: `You are a talent matching assistant for LALA, an NGO that empowers Latin American leaders (LaLideres).
Your job is to rank LaLider candidates for a given position and explain each match.
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

  const text = response.content[0].type === "text" ? response.content[0].text : "[]";

  let matches: unknown[];
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    matches = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch {
    matches = [];
  }

  return NextResponse.json({ matches });
}
