import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type LaliderMatch = {
  score: number;
  match_reason: string;
  gaps: string | null;
  created_at: string;
  positions: {
    id: string;
    title: string;
    opportunity_type: string;
    location: string | null;
    profiles: {
      company_name: string | null;
      website: string | null;
      linkedin_url: string | null;
      location: string | null;
      company_description: string | null;
      bio: string | null;
    } | null;
  } | null;
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

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/profile/edit");

  const isCompany = profile.role === "company";

  let positions: import("@/types/database").PositionRow[] | null = null;
  let laliderMatches: LaliderMatch[] | null = null;

  if (isCompany) {
    const { data } = await supabase
      .from("positions")
      .select("*")
      .eq("company_profile_id", profile.id)
      .order("created_at", { ascending: false });
    positions = data as import("@/types/database").PositionRow[] | null;
  } else {
    // Fetch matches for this LaLider, including position and company info
    const { data } = await supabase
      .from("matches")
      .select(`
        score,
        match_reason,
        gaps,
        created_at,
        positions (
          id,
          title,
          opportunity_type,
          location,
          profiles!company_profile_id (
            company_name,
            website,
            linkedin_url,
            location,
            company_description,
            bio
          )
        )
      `)
      .eq("lalider_profile_id", profile.id)
      .order("score", { ascending: false });
    laliderMatches = data as unknown as LaliderMatch[] | null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-700">
            <Image src="/lala-logo.png" alt="LALA" width={32} height={32} className="rounded-sm" />
            LALA Platform
          </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{profile.full_name}</span>
          <Link href="/profile/edit">
            <Button variant="outline" size="sm">Edit profile</Button>
          </Link>
          <form action="/api/auth/logout" method="POST">
            <Button variant="ghost" size="sm" type="submit">Sign out</Button>
          </form>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome, {isCompany ? profile.company_name || profile.full_name : profile.full_name}
          </h1>
          <p className="text-gray-500 mt-1">
            {isCompany
              ? "Manage your positions and find the best LaLideres for your team."
              : "See which companies have matched you and keep your profile up to date."}
          </p>
        </div>

        {/* Company view */}
        {isCompany && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your positions</h2>
              <Link href="/positions/new">
                <Button size="sm">+ Post position</Button>
              </Link>
            </div>

            {positions && positions.length > 0 ? (
              <div className="grid gap-4">
                {positions.map((pos) => (
                  <Card key={pos.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{pos.title}</CardTitle>
                          <CardDescription>
                            {pos.opportunity_type}{pos.location ? ` · ${pos.location}` : ""}
                          </CardDescription>
                        </div>
                        <Badge variant={pos.is_active ? "default" : "secondary"}>
                          {pos.is_active ? "Active" : "Closed"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 line-clamp-2">{pos.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/positions/${pos.id}/matches`}>
                        <Button size="sm">View AI matches</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-10 text-center text-gray-400">
                  No positions yet.{" "}
                  <Link href="/positions/new" className="text-blue-600 hover:underline">
                    Post your first one.
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* LaLider view */}
        {!isCompany && (
          <div className="space-y-6">
            {/* Profile summary */}
            <Card>
              <CardHeader>
                <CardTitle>Your profile</CardTitle>
                <CardDescription>This is what companies see when matching candidates.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {profile.location && <div><span className="font-medium">Location:</span> {profile.location}</div>}
                {profile.education && <div><span className="font-medium">Education:</span> {profile.education}</div>}
                {profile.skills && <div><span className="font-medium">Skills:</span> {profile.skills}</div>}
                {profile.opportunity_type && <div><span className="font-medium">Looking for:</span> {profile.opportunity_type}</div>}
              </CardContent>
              <CardFooter>
                <Link href="/profile/edit">
                  <Button variant="outline" size="sm">Update profile</Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Matches section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                Companies that matched you
                {laliderMatches && laliderMatches.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({laliderMatches.length} match{laliderMatches.length > 1 ? "es" : ""})
                  </span>
                )}
              </h2>

              {!laliderMatches || laliderMatches.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-gray-400">
                    No matches yet — make sure your profile is complete so companies can find you.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {laliderMatches.map((m, i) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const pos = m.positions as any;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const company = pos?.profiles as any;
                    return (
                      <Card key={i}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">{pos?.title}</CardTitle>
                              <CardDescription>
                                {company?.company_name}
                                {company?.location ? ` · ${company.location}` : ""}
                                {pos?.opportunity_type ? ` · ${pos.opportunity_type}` : ""}
                                {pos?.location ? ` · ${pos.location}` : ""}
                              </CardDescription>
                            </div>
                            <ScoreBadge score={m.score} />
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {company?.company_description && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">About the company</p>
                              <p className="text-sm text-gray-600">{company.company_description}</p>
                            </div>
                          )}
                          {company?.bio && (
                            <>
                              <Separator />
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-1">Why join their team</p>
                                <p className="text-sm text-gray-600">{company.bio}</p>
                              </div>
                            </>
                          )}
                          <Separator />
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Why you&apos;re a good fit</p>
                            <p className="text-sm text-gray-600">{m.match_reason}</p>
                          </div>
                          {m.gaps && (
                            <>
                              <Separator />
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-1">Areas to develop</p>
                                <p className="text-sm text-gray-500">{m.gaps}</p>
                              </div>
                            </>
                          )}
                          {(company?.website || company?.linkedin_url) && (
                            <>
                              <Separator />
                              <div className="flex gap-4">
                                {company?.website && (
                                  <a
                                    href={company.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline"
                                  >
                                    Visit website →
                                  </a>
                                )}
                                {company?.linkedin_url && (
                                  <a
                                    href={company.linkedin_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline"
                                  >
                                    LinkedIn →
                                  </a>
                                )}
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
