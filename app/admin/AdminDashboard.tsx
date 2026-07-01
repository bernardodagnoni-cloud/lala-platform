"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Profile = {
  id: string;
  full_name: string;
  role: string;
  location: string | null;
  created_at: string;
};

type Position = {
  id: string;
  title: string;
  opportunity_type: string;
  location: string | null;
  is_active: boolean;
  created_at: string;
  profiles: { company_name: string | null } | null;
};

type Match = {
  id: string;
  score: number;
  created_at: string;
  positions: { title: string } | null;
  profiles: { full_name: string } | null;
};

type Stats = { lalideres: number; companies: number; positions: number; matches: number };

type Tab = "users" | "positions" | "matches";

export default function AdminDashboard({
  stats,
  profiles: initialProfiles,
  positions: initialPositions,
  matches,
}: {
  stats: Stats;
  profiles: Profile[];
  positions: Position[];
  matches: Match[];
}) {
  const [tab, setTab] = useState<Tab>("users");
  const [profiles, setProfiles] = useState(initialProfiles);
  const [positions, setPositions] = useState(initialPositions);
  const [toggling, setToggling] = useState<string | null>(null);
  const [matching, setMatching] = useState<string | null>(null);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function togglePosition(id: string, current: boolean) {
    setToggling(id);
    const res = await fetch(`/api/admin/positions/${id}/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    if (res.ok) {
      setPositions((prev) => prev.map((p) => p.id === id ? { ...p, is_active: !current } : p));
    }
    setToggling(null);
  }

  async function deleteProfile(id: string, name: string) {
    if (!confirm(`Delete profile for "${name}"? This will also remove their positions, matches, and login access. This cannot be undone.`)) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/profiles/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProfiles((prev) => prev.filter((p) => p.id !== id));
    }
    setDeleting(null);
  }

  async function triggerMatch(positionId: string) {
    setMatching(positionId);
    setMatchError(null);
    const res = await fetch("/api/admin/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ positionId }),
    });
    const json = await res.json();
    if (!res.ok) setMatchError(json.error ?? "Matching failed");
    setMatching(null);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-800">← Dashboard</Link>
          <span className="text-gray-300">|</span>
          <span className="font-bold text-blue-900">Admin Portal</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "LaLideres", value: stats.lalideres },
            { label: "Companies", value: stats.companies },
            { label: "Positions", value: stats.positions },
            { label: "AI Matches", value: stats.matches },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-900">{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-6">
            {(["users", "positions", "matches"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                  tab === t
                    ? "border-blue-900 text-blue-900"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Users tab */}
        {tab === "users" && (
          <Card>
            <CardHeader>
              <CardTitle>All Users ({profiles.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left text-gray-500">
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Location</th>
                      <th className="px-4 py-3 font-medium">Joined</th>
                      <th className="px-4 py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((p) => (
                      <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{p.full_name}</td>
                        <td className="px-4 py-3">
                          <Badge variant={p.role === "company" ? "default" : "secondary"}>
                            {p.role === "laLider" ? "LaLider" : "Company"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{p.location ?? "—"}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(p.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={deleting === p.id}
                            onClick={() => deleteProfile(p.id, p.full_name)}
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                          >
                            {deleting === p.id ? "Deleting…" : "Delete"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {profiles.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No users yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Positions tab */}
        {tab === "positions" && (
          <Card>
            <CardHeader>
              <CardTitle>All Positions ({positions.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {matchError && (
                <div className="mx-4 mt-4 bg-red-50 text-red-700 text-sm rounded-md px-3 py-2">{matchError}</div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left text-gray-500">
                      <th className="px-4 py-3 font-medium">Title</th>
                      <th className="px-4 py-3 font-medium">Company</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((pos) => (
                      <tr key={pos.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{pos.title}</td>
                        <td className="px-4 py-3 text-gray-500">{pos.profiles?.company_name ?? "—"}</td>
                        <td className="px-4 py-3 text-gray-500">{pos.opportunity_type}</td>
                        <td className="px-4 py-3">
                          <Badge variant={pos.is_active ? "default" : "secondary"}>
                            {pos.is_active ? "Active" : "Closed"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={toggling === pos.id}
                              onClick={() => togglePosition(pos.id, pos.is_active)}
                            >
                              {toggling === pos.id ? "…" : pos.is_active ? "Deactivate" : "Activate"}
                            </Button>
                            <Button
                              size="sm"
                              disabled={matching === pos.id}
                              onClick={() => triggerMatch(pos.id)}
                            >
                              {matching === pos.id ? "Running…" : "Run AI match"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {positions.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No positions yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Matches tab */}
        {tab === "matches" && (
          <Card>
            <CardHeader>
              <CardTitle>All Matches ({matches.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left text-gray-500">
                      <th className="px-4 py-3 font-medium">Position</th>
                      <th className="px-4 py-3 font-medium">Candidate</th>
                      <th className="px-4 py-3 font-medium">Score</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((m) => (
                      <tr key={m.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{m.positions?.title ?? "—"}</td>
                        <td className="px-4 py-3 text-gray-500">{m.profiles?.full_name ?? "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            m.score >= 8 ? "bg-green-100 text-green-800" :
                            m.score >= 6 ? "bg-yellow-100 text-yellow-800" :
                            "bg-orange-100 text-orange-800"
                          }`}>
                            {m.score}/10
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(m.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {matches.length === 0 && (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No matches yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
