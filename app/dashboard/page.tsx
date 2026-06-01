import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/auth/signup");

  const isCompany = profile.role === "company";

  let positions = null;
  if (isCompany) {
    const { data } = await supabase
      .from("positions")
      .select("*")
      .eq("company_profile_id", profile.id)
      .order("created_at", { ascending: false });
    positions = data;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-xl text-blue-700">LALA Platform</span>
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
              : "Your profile is visible to companies looking for talent like you."}
          </p>
        </div>

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
                          <CardDescription>{pos.opportunity_type} {pos.location ? `· ${pos.location}` : ""}</CardDescription>
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
                  <Link href="/positions/new" className="text-blue-600 hover:underline">Post your first one.</Link>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {!isCompany && (
          <Card>
            <CardHeader>
              <CardTitle>Your profile</CardTitle>
              <CardDescription>This is what companies see when they search for candidates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {profile.location && <div><span className="font-medium">Location:</span> {profile.location}</div>}
              {profile.education && <div><span className="font-medium">Education:</span> {profile.education}</div>}
              {profile.experience && <div><span className="font-medium">Experience:</span> {profile.experience}</div>}
              {profile.skills && <div><span className="font-medium">Skills:</span> {profile.skills}</div>}
              {profile.opportunity_type && <div><span className="font-medium">Looking for:</span> {profile.opportunity_type}</div>}
              {profile.bio && <div><span className="font-medium">About:</span> {profile.bio}</div>}
            </CardContent>
            <CardFooter>
              <Link href="/profile/edit">
                <Button variant="outline" size="sm">Update profile</Button>
              </Link>
            </CardFooter>
          </Card>
        )}
      </main>
    </div>
  );
}
