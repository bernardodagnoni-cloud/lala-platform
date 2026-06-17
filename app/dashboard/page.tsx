import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getServerT } from "@/lib/i18n/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LanguageSwitcher } from "@/components/language-switcher";
import { GoldStar, BlueSparkle } from "@/components/brand-icons";

type LaliderMatch = {
  score: number;
  match_reason: string;
  gaps: string | null;
  created_at: string;
  positions: {
    id: string;
    title: string;
    opportunity_type: string;
    work_modality: string | null;
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

  const { t } = await getServerT();

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
          work_modality,
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
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-blue-950 px-6 py-4 flex items-center justify-between relative overflow-hidden">
        <GoldStar className="absolute -top-5 right-40 w-20 h-20 opacity-[0.08] rotate-12 pointer-events-none select-none" />
        <BlueSparkle className="absolute -bottom-5 right-6 w-16 h-16 opacity-[0.22] pointer-events-none select-none" />
        <Link href="/" className="flex items-center gap-2 font-brand text-xl text-white">
            <Image src="/lala-logo.png" alt="LALA" width={32} height={32} className="rounded-sm" />
            {t.common.lalaPlatform}
          </Link>
        <div className="flex items-center gap-4">
          <LanguageSwitcher className="text-white" />
          <span className="text-sm text-blue-200">{profile.full_name}</span>
          <form action="/api/auth/logout" method="POST">
            <Button variant="ghost" size="sm" type="submit" className="text-white hover:bg-blue-900">{t.common.signOut}</Button>
          </form>
        </div>
      </nav>

      <div className="bg-blue-900 h-1 w-full" style={{background: "linear-gradient(to right, #1e3a8a, #3C35DE, #FFC200)"}} />
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">
            Welcome, {isCompany ? profile.company_name || profile.full_name : profile.full_name}
          </h1>
          <p className="text-gray-500 mt-1">
            {isCompany
              ? t.dashboard.welcomeSubtitleCompany
              : t.dashboard.welcomeSubtitleLalider}
          </p>
        </div>

        {/* Company view */}
        {isCompany && (
          <div className="space-y-8">

            {/* Company profile section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-blue-900">{t.dashboard.companyProfile.sectionTitle}</h2>
                <Link href="/profile/edit">
                  <Button size="sm" className="bg-blue-700 hover:bg-blue-800 text-white">{t.common.editProfile}</Button>
                </Link>
              </div>
              <Card>
                <CardContent className="pt-6 space-y-3 text-sm">
                  {profile.company_name && (
                    <div><span className="font-medium">{t.dashboard.companyProfile.company}:</span> {profile.company_name}</div>
                  )}
                  {profile.location && (
                    <div><span className="font-medium">{t.dashboard.companyProfile.headquarters}:</span> {profile.location}</div>
                  )}
                  {profile.website && (
                    <div>
                      <span className="font-medium">{t.dashboard.companyProfile.website}:</span>{" "}
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{profile.website}</a>
                    </div>
                  )}
                  {profile.linkedin_url && (
                    <div>
                      <span className="font-medium">{t.dashboard.companyProfile.linkedin}:</span>{" "}
                      <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{profile.linkedin_url}</a>
                    </div>
                  )}
                  {profile.company_description && (
                    <div><span className="font-medium">{t.dashboard.companyProfile.whatWeDo}:</span> {profile.company_description}</div>
                  )}
                  {profile.bio && (
                    <div><span className="font-medium">{t.dashboard.companyProfile.whyJoinUs}:</span> {profile.bio}</div>
                  )}
                  {!profile.company_name && !profile.company_description && (
                    <p className="text-gray-400 py-4 text-center">
                      {t.dashboard.companyProfile.noProfile}{" "}
                      <Link href="/profile/edit" className="text-blue-600 hover:underline">{t.dashboard.companyProfile.completeProfile}</Link>
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Positions section */}
            <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-blue-900">{t.dashboard.positions.sectionTitle}</h2>
              <Link href="/positions/new">
                <Button size="sm" className="bg-blue-700 hover:bg-blue-800 text-white">{t.dashboard.positions.postButton}</Button>
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
                            {pos.opportunity_type}{pos.work_modality ? ` · ${pos.work_modality}` : ""}{pos.location ? ` · ${pos.location}` : ""}
                          </CardDescription>
                        </div>
                        <Badge variant={pos.is_active ? "default" : "secondary"}>
                          {pos.is_active ? t.dashboard.positions.active : t.dashboard.positions.closed}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 line-clamp-2">{pos.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/positions/${pos.id}/matches`}>
                        <Button size="sm">{t.dashboard.positions.viewMatches}</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-10 text-center text-gray-400">
                  {t.dashboard.positions.empty}{" "}
                  <Link href="/positions/new" className="text-blue-600 hover:underline">
                    {t.dashboard.positions.postFirst}
                  </Link>
                </CardContent>
              </Card>
            )}
            </div>
          </div>
        )}

        {/* LaLider view */}
        {!isCompany && (
          <div className="space-y-6">
            {/* Profile section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-blue-900">{t.dashboard.laliderProfile.sectionTitle}</h2>
                <Link href="/profile/edit">
                  <Button size="sm" className="bg-blue-700 hover:bg-blue-800 text-white">{t.common.editProfile}</Button>
                </Link>
              </div>
              <Card>
                <CardContent className="pt-6 space-y-2 text-sm">
                  {profile.location && <div><span className="font-medium">{t.dashboard.laliderProfile.location}:</span> {profile.location}</div>}
                  {profile.education && <div><span className="font-medium">{t.dashboard.laliderProfile.education}:</span> {profile.education}</div>}
                  {profile.experience && <div><span className="font-medium">{t.dashboard.laliderProfile.experience}:</span> {profile.experience}</div>}
                  {profile.skills && <div><span className="font-medium">{t.dashboard.laliderProfile.skills}:</span> {profile.skills}</div>}
                  {profile.opportunity_type && <div><span className="font-medium">{t.dashboard.laliderProfile.lookingFor}:</span> {profile.opportunity_type}</div>}
                  {profile.desired_role && <div><span className="font-medium">{t.dashboard.laliderProfile.desiredRole}:</span> {profile.desired_role}</div>}
                  {profile.open_to_relocate && <div><span className="font-medium">{t.dashboard.laliderProfile.openToRelocate}:</span> {profile.open_to_relocate}</div>}
                  {profile.bio && <div><span className="font-medium">{t.dashboard.laliderProfile.about}:</span> {profile.bio}</div>}
                  {profile.linkedin_url && (
                    <div>
                      <span className="font-medium">{t.dashboard.laliderProfile.linkedin}:</span>{" "}
                      <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{profile.linkedin_url}</a>
                    </div>
                  )}
                  {!profile.education && !profile.experience && !profile.skills && (
                    <p className="text-gray-400 py-4 text-center">
                      {t.dashboard.laliderProfile.incompletePrefix}{" "}
                      <Link href="/profile/edit" className="text-blue-600 hover:underline">{t.dashboard.laliderProfile.fillIn}</Link>{" "}
                      {t.dashboard.laliderProfile.incompleteSuffix}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Matches section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-blue-900">
                {t.dashboard.matches.sectionTitle}
                {laliderMatches && laliderMatches.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({laliderMatches.length} match{laliderMatches.length > 1 ? "es" : ""})
                  </span>
                )}
              </h2>

              {!laliderMatches || laliderMatches.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-gray-400">
                    {t.dashboard.matches.noMatches}
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
                                {pos?.work_modality ? ` · ${pos.work_modality}` : ""}
                                {pos?.location ? ` · ${pos.location}` : ""}
                              </CardDescription>
                            </div>
                            <ScoreBadge score={m.score} />
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {company?.company_description && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">{t.dashboard.matches.aboutCompany}</p>
                              <p className="text-sm text-gray-600">{company.company_description}</p>
                            </div>
                          )}
                          {company?.bio && (
                            <>
                              <Separator />
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-1">{t.dashboard.matches.whyJoin}</p>
                                <p className="text-sm text-gray-600">{company.bio}</p>
                              </div>
                            </>
                          )}
                          <Separator />
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">{t.dashboard.matches.goodFit}</p>
                            <p className="text-sm text-gray-600">{m.match_reason}</p>
                          </div>
                          {m.gaps && (
                            <>
                              <Separator />
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-1">{t.dashboard.matches.areasToDevelop}</p>
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
                                    {t.dashboard.matches.visitWebsite}
                                  </a>
                                )}
                                {company?.linkedin_url && (
                                  <a
                                    href={company.linkedin_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline"
                                  >
                                    {t.dashboard.matches.linkedinLink}
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
