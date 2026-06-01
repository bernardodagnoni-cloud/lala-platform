"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProfileRow, UserRole } from "@/types/database";

type Profile = ProfileRow;

const OPPORTUNITY_TYPES = [
  "Full-time employment",
  "Part-time employment",
  "Internship",
  "Freelance / consulting",
  "Scholarships / fellowships",
];

export default function EditProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setProfile(data);
        setRole(data.role as UserRole);
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  function update(field: keyof Profile, value: string) {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(profile as any)
      .eq("user_id", user.id);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    router.push("/dashboard");
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Complete your profile</CardTitle>
            <CardDescription>
              {role === "laLider"
                ? "Tell us about yourself so companies can find you."
                : "Tell us about your company and the talent you're looking for."}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSave}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 text-sm rounded-md px-3 py-2">{error}</div>
              )}

              <div className="space-y-1">
                <Label htmlFor="full_name">Full name</Label>
                <Input
                  id="full_name"
                  value={profile.full_name ?? ""}
                  onChange={(e) => update("full_name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="location">Location (city, country)</Label>
                <Input
                  id="location"
                  value={profile.location ?? ""}
                  onChange={(e) => update("location", e.target.value)}
                />
              </div>

              {role === "laLider" && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="education">Education</Label>
                    <Textarea
                      id="education"
                      placeholder="University, degree, graduation year…"
                      value={profile.education ?? ""}
                      onChange={(e) => update("education", e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="experience">Work experience</Label>
                    <Textarea
                      id="experience"
                      placeholder="Previous roles, internships, projects…"
                      value={profile.experience ?? ""}
                      onChange={(e) => update("experience", e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="skills">Skills</Label>
                    <Input
                      id="skills"
                      placeholder="e.g. Python, project management, public speaking"
                      value={profile.skills ?? ""}
                      onChange={(e) => update("skills", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Type of opportunity sought</Label>
                    <Select
                      value={profile.opportunity_type ?? ""}
                      onValueChange={(v: string | null) => update("opportunity_type", v ?? "")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select opportunity type" />
                      </SelectTrigger>
                      <SelectContent>
                        {OPPORTUNITY_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="bio">About you</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell companies a bit about yourself, your goals, and what makes you unique…"
                      value={profile.bio ?? ""}
                      onChange={(e) => update("bio", e.target.value)}
                      rows={4}
                    />
                  </div>
                </>
              )}

              {role === "company" && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="company_name">Company name</Label>
                    <Input
                      id="company_name"
                      value={profile.company_name ?? ""}
                      onChange={(e) => update("company_name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://"
                      value={profile.website ?? ""}
                      onChange={(e) => update("website", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="company_description">About your company</Label>
                    <Textarea
                      id="company_description"
                      placeholder="What does your company do? What's your mission?"
                      value={profile.company_description ?? ""}
                      onChange={(e) => update("company_description", e.target.value)}
                      rows={4}
                    />
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Saving…" : "Save profile"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
