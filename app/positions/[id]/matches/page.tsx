"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Match = {
  candidateId: string;
  name: string;
  score: number;
  matchReason: string;
  gaps: string;
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
    async function loadPosition() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data } = await supabase
        .from("positions")
        .select("id, title, opportunity_type, location")
        .eq("id", id)
        .single();

      if (data) setPosition(data);
    }
    loadPosition();
  }, [id]);

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
              <p className="text-gray-500 text-center">
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
                {matches.length > 0 ? `${matches.length} matched candidate${matches.length > 1 ? "s" : ""}` : "No strong matches found"}
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
                      <CardTitle className="text-base">
                        #{i + 1} — {match.name}
                      </CardTitle>
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
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
