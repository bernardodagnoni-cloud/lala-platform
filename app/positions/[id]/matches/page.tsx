"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Match = {
  candidateId: string;
  name: string;
  score: number;
  matchReason: string;
  gaps: string;
  linkedin_url: string | null;
};

type Position = {
  id: string;
  title: string;
  opportunity_type: string;
  location: string | null;
};

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 8 ? "bg-green-100 text-green-800" :
    score >= 6 ? "bg-yellow-100 text-yellow-800" :
    "bg-orange-100 text-orange-800";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {score}/10
    </span>
  );
}

export default function MatchesPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [position, setPosition] = useState<Position | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPageData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data: posData } = await supabase
        .from("positions")
        .select("id, title, opportunity_type, location")
        .eq("id", id)
        .single();

      if (posData) setPosition(posData as Position);

      // Load existing matches from the database
      const { data: existingMatches } = await supabase
        .from("matches")
        .select(`
          score,
          match_reason,
          gaps,
          lalider_profile_id,
          profiles!lalider_profile_id (
            full_name,
            linkedin_url
          )
        `)
        .eq("position_id", id)
        .order("score", { ascending: false });

      if (existingMatches && existingMatches.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped = existingMatches.map((m: any) => ({
          candidateId: m.lalider_profile_id,
          name: m.profiles?.full_name ?? "Unknown",
          score: m.score,
          matchReason: m.match_reason,
          gaps: m.gaps ?? "",
          linkedin_url: m.profiles?.linkedin_url ?? null,
        }));
        setMatches(mapped);
        setFetched(true);
      }
    }
    loadPageData();
  }, [id, router]);

  async function runMatching() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positionId: id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Matching failed");
      setMatches(json.matches ?? []);
      setFetched(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-xl text-blue-700">LALA Platform</span>
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">← Dashboard</Button>
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto p-6 space-y-6">
        {position && (
          <div>
            <h1 className="text-2xl font-bold">{position.title}</h1>
            <p className="text-gray-500 mt-1">
              {position.opportunity_type}
              {position.location ? ` · ${position.location}` : ""}
            </p>
          </div>
        )}

        {!fetched && (
          <Card>
            <CardContent className="py-10 flex flex-col items-center gap-4">
              <p className="text-gray-500 text-center max-w-sm">
                Click below to let Claude analyze all LaLider profiles and find the best matches for this position.
              </p>
              <Button onClick={runMatching} disabled={loading} size="lg">
                {loading ? "Analyzing candidates…" : "Find AI matches"}
              </Button>
              {error && <p className="text-red-600 text-sm">{error}</p>}
            </CardContent>
          </Card>
        )}

        {fetched && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {matches.length > 0
                  ? `${matches.length} matched candidate${matches.length > 1 ? "s" : ""}`
                  : "No strong matches found"}
              </h2>
              <Button variant="outline" size="sm" onClick={runMatching} disabled={loading}>
                {loading ? "Re-running…" : "Re-run matching"}
              </Button>
            </div>

            {matches.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-gray-400">
                  No LaLideres with a strong fit were found. Try broadening the position requirements.
                </CardContent>
              </Card>
            )}

            {matches.map((match, i) => (
              <Card key={match.candidateId}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">#{i + 1} — {match.name}</CardTitle>
                      <CardDescription>Match score</CardDescription>
                    </div>
                    <ScoreBadge score={match.score} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Why they fit</p>
                    <p className="text-sm text-gray-600">{match.matchReason}</p>
                  </div>
                  {match.gaps && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Potential gaps</p>
                        <p className="text-sm text-gray-500">{match.gaps}</p>
                      </div>
                    </>
                  )}
                  {match.linkedin_url && (
                    <>
                      <Separator />
                      <a
                        href={match.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline font-medium"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        View LinkedIn profile
                      </a>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
