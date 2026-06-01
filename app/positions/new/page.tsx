"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const OPPORTUNITY_TYPES = [
  "Full-time employment",
  "Part-time employment",
  "Internship",
  "Freelance / consulting",
  "Scholarships / fellowships",
];

export default function NewPositionPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [location, setLocation] = useState("");
  const [opportunityType, setOpportunityType] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) { setError("Company profile not found."); setSaving(false); return; }

    const { error } = await supabase.from("positions").insert({
      company_profile_id: profile.id,
      title,
      description,
      requirements,
      location: location || null,
      opportunity_type: opportunityType,
      is_active: true,
    });

    if (error) { setError(error.message); setSaving(false); return; }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Post a new position</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 text-sm rounded-md px-3 py-2">{error}</div>
              )}
              <div className="space-y-1">
                <Label htmlFor="title">Position title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label>Opportunity type</Label>
                <Select onValueChange={(v: string | null) => setOpportunityType(v ?? "")} required>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {OPPORTUNITY_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="location">Location (optional)</Label>
                <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, country or Remote" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="description">Position description</Label>
                <Textarea
                  id="description"
                  placeholder="What will this person do? What's the team like?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="requirements">Requirements & ideal candidate</Label>
                <Textarea
                  id="requirements"
                  placeholder="Skills, experience, education, and any other expectations…"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  rows={5}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={saving || !opportunityType} className="w-full">
                {saving ? "Posting…" : "Post position"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
