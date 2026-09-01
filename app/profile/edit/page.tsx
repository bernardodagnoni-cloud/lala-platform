"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GoldStar, BlueSparkle } from "@/components/brand-icons";
import type { ProfileRow, ProfileDiversityRow, UserRole, WorkExperienceEntry } from "@/types/database";

type Profile = ProfileRow;

const STANDARD_LIFE_STAGES = new Set([
  "High school", "University / College", "MBA", "Graduate studies (Master's / PhD)", "Working professional", "Gap Year",
  "Ensino médio", "Universidade / Faculdade", "Pós-graduação (Mestrado / Doutorado)", "Profissional em atividade", "Ano sabático (Gap Year)",
  "Secundaria", "Universidad / Carrera", "Posgrado (Maestría / Doctorado)", "Profesional en actividad",
]);
const OTHER_LIFE_STAGE_LABELS = new Set(["Other", "Outro", "Otro"]);

function emptyWorkExperience(): WorkExperienceEntry {
  return { title: "", company: "", startDate: "", endDate: null, current: false, description: "" };
}

function toggleValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function EditProfilePage() {
  const router = useRouter();
  const t = useT();
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationCountry, setLocationCountry] = useState("");
  const [locationRegion, setLocationRegion] = useState("");
  const [locationCity, setLocationCity] = useState("");
  const [eduUniversity, setEduUniversity] = useState("");
  const [eduDegree, setEduDegree] = useState("");
  const [eduYear, setEduYear] = useState("");
  const [openToRelocate, setOpenToRelocate] = useState("");
  const [workArrangements, setWorkArrangements] = useState<string[]>([]);
  const [lifeStage, setLifeStage] = useState("");
  const [lifeStageOther, setLifeStageOther] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [openToOpportunities, setOpenToOpportunities] = useState(true);
  const [availabilitySaving, setAvailabilitySaving] = useState(false);
  const [workExperience, setWorkExperience] = useState<WorkExperienceEntry[]>([emptyWorkExperience()]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillsOther, setSkillsOther] = useState("");
  const [opportunityTypes, setOpportunityTypes] = useState<string[]>([]);
  const [diversityGender, setDiversityGender] = useState("");
  const [diversityGenderIdentity, setDiversityGenderIdentity] = useState("");
  const [diversitySexualOrientation, setDiversitySexualOrientation] = useState("");
  const [diversityRace, setDiversityRace] = useState("");

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
        if (data.role === "laLider" && data.education) {
          const eduParts = data.education.split(" | ");
          setEduUniversity(eduParts[0]?.trim() ?? "");
          setEduDegree(eduParts[1]?.trim() ?? "");
          setEduYear(eduParts[2]?.trim() ?? "");
        }
        if (data.role === "laLider" && data.open_to_relocate) {
          setOpenToRelocate(data.open_to_relocate);
        }
        if (data.role === "laLider" && data.life_stage) {
          if (STANDARD_LIFE_STAGES.has(data.life_stage)) {
            setLifeStage(data.life_stage);
          } else {
            const otherLabel = t.profileEdit.lifeStageOptions[t.profileEdit.lifeStageOptions.length - 1];
            setLifeStage(otherLabel);
            if (!OTHER_LIFE_STAGE_LABELS.has(data.life_stage)) {
              setLifeStageOther(data.life_stage);
            }
          }
        }
        if (data.role === "laLider") {
          setOpenToOpportunities(data.open_to_opportunities ?? true);
          setContactEmail(data.contact_email ?? "");
          setPhone(data.phone ?? "");
          setWorkArrangements(data.work_arrangements ?? []);
          setSelectedSkills(data.skills ?? []);
          setSkillsOther(data.skills_other ?? "");
          setOpportunityTypes(data.opportunity_type ?? []);
          if (data.work_experience && data.work_experience.length > 0) {
            setWorkExperience(data.work_experience);
          }
        }
        if (data.role === "laLider" && data.location) {
          const parts = data.location.split(", ").map((s: string) => s.trim());
          if (parts.length >= 3) {
            setLocationCity(parts[0]);
            setLocationRegion(parts[1]);
            setLocationCountry(parts[2]);
          } else if (parts.length === 2) {
            setLocationCity(parts[0]);
            setLocationCountry(parts[1]);
          } else {
            setLocationCity(parts[0] ?? "");
          }
        }
        if (data.role === "laLider") {
          const { data: diversity } = await supabase
            .from("profile_diversity")
            .select("*")
            .eq("profile_id", data.id)
            .maybeSingle();
          const div = diversity as ProfileDiversityRow | null;
          if (div) {
            setDiversityGender(div.gender ?? "");
            setDiversityGenderIdentity(div.gender_identity ?? "");
            setDiversitySexualOrientation(div.sexual_orientation ?? "");
            setDiversityRace(div.race_color ?? "");
          }
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  function update(field: keyof Profile, value: string) {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }

  function updateWorkExperience(index: number, patch: Partial<WorkExperienceEntry>) {
    setWorkExperience((prev) => prev.map((entry, i) => i === index ? { ...entry, ...patch } : entry));
  }

  function addWorkExperience() {
    setWorkExperience((prev) => [...prev, emptyWorkExperience()]);
  }

  function removeWorkExperience(index: number) {
    setWorkExperience((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile.full_name?.trim()) { setError(t.profileEdit.errorFullName); return; }
    const combinedEducation = [eduUniversity, eduDegree, eduYear].filter(Boolean).join(" | ") || null;
    const cleanedWorkExperience = workExperience.filter((entry) => entry.title.trim() || entry.company.trim());
    if (role === "laLider") {
      if (!contactEmail.trim()) { setError(t.profileEdit.errorEmail); return; }
      if (!combinedEducation && cleanedWorkExperience.length === 0) {
        setError(t.profileEdit.errorEducationOrExperience); return;
      }
      if (opportunityTypes.length === 0) { setError(t.profileEdit.errorOpportunityType); return; }
    }
    if (role === "company" && !profile.company_name?.trim()) {
      setError(t.profileEdit.errorCompanyName); return;
    }
    if (role === "laLider" && !profile.linkedin_url?.trim() && !profile.cv_url?.trim()) {
      setError(t.profileEdit.errorLinkedinOrCv); return;
    }
    if (profile.linkedin_url && !profile.linkedin_url.startsWith("https://")) {
      setError(t.profileEdit.errorLinkedinUrl); return;
    }
    if (profile.cv_url && !profile.cv_url.startsWith("https://")) {
      setError(t.profileEdit.errorLinkedinUrl.replace("LinkedIn", "CV")); return;
    }
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: savedProfile, error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        phone: role === "laLider" ? phone.trim() || null : undefined,
        location: role === "laLider"
          ? [locationCity, locationRegion, locationCountry].filter(Boolean).join(", ") || null
          : profile.location,
        bio: profile.bio,
        education: role === "laLider" ? combinedEducation : profile.education,
        experience: profile.experience,
        work_experience: role === "laLider" ? cleanedWorkExperience : undefined,
        opportunity_type: role === "laLider" ? opportunityTypes : profile.opportunity_type,
        desired_role: profile.desired_role,
        open_to_relocate: role === "laLider" ? openToRelocate || null : undefined,
        work_arrangements: role === "laLider" ? (workArrangements.length ? workArrangements : null) : undefined,
        life_stage: role === "laLider" ? (OTHER_LIFE_STAGE_LABELS.has(lifeStage) ? lifeStageOther.trim() || null : lifeStage || null) : undefined,
        contact_email: role === "laLider" ? contactEmail.trim() || null : undefined,
        volunteer_experience: role === "laLider" ? profile.volunteer_experience ?? null : undefined,
        skills: role === "laLider" ? (selectedSkills.length ? selectedSkills : null) : undefined,
        skills_other: role === "laLider" ? skillsOther.trim() || null : undefined,
        company_name: profile.company_name,
        company_description: profile.company_description,
        website: profile.website,
        linkedin_url: profile.linkedin_url,
        cv_url: role === "laLider" ? profile.cv_url ?? null : undefined,
      })
      .eq("user_id", user.id)
      .select("id")
      .single();

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    if (role === "laLider" && savedProfile) {
      await supabase.from("profile_diversity").upsert({
        profile_id: savedProfile.id,
        gender: diversityGender || null,
        gender_identity: diversityGenderIdentity || null,
        sexual_orientation: diversitySexualOrientation || null,
        race_color: diversityRace || null,
      }, { onConflict: "profile_id" });
    }

    if (role === "company") {
      await fetch("/api/company/notify", { method: "POST" });
    }

    router.push("/dashboard");
  }

  async function toggleAvailability(value: boolean) {
    setAvailabilitySaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ open_to_opportunities: value }).eq("user_id", user.id);
      setOpenToOpportunities(value);
    }
    setAvailabilitySaving(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-blue-950 px-6 py-4 flex items-center justify-between relative overflow-hidden">
        <GoldStar className="absolute -top-5 right-36 w-20 h-20 opacity-[0.08] rotate-12 pointer-events-none select-none" />
        <BlueSparkle className="absolute -bottom-5 right-4 w-16 h-16 opacity-[0.22] pointer-events-none select-none" />
        <Link href="/" className="flex items-center gap-2 font-brand text-xl text-white">
          <Image src="/lala-logo.png" alt="LALA" width={32} height={32} className="rounded-sm" />
          {t.common.lalaPlatform}
        </Link>
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="text-white hover:bg-blue-900">← Dashboard</Button>
        </Link>
      </nav>
      <div className="h-1 w-full" style={{background: "linear-gradient(to right, #1e3a8a, #3C35DE, #FFC200)"}} />
      <div className="p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {role === "laLider" && (
          <div className={`rounded-xl ring-1 p-4 flex items-start justify-between gap-4 ${openToOpportunities ? "bg-green-50 ring-green-200" : "bg-gray-100 ring-gray-200"}`}>
            <div>
              <p className={`font-semibold text-sm ${openToOpportunities ? "text-green-800" : "text-gray-600"}`}>
                {openToOpportunities ? t.profileEdit.availabilityOpen : t.profileEdit.availabilityClosed}
              </p>
              <p className={`text-xs mt-0.5 ${openToOpportunities ? "text-green-600" : "text-gray-400"}`}>
                {openToOpportunities ? t.profileEdit.availabilityOpenDesc : t.profileEdit.availabilityClosedDesc}
              </p>
            </div>
            <button
              type="button"
              disabled={availabilitySaving}
              onClick={() => toggleAvailability(!openToOpportunities)}
              className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${openToOpportunities ? "bg-green-500" : "bg-gray-300"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${openToOpportunities ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        )}
        <Card>
          <CardHeader>
            <CardTitle>{role === "company" ? t.profileEdit.titleCompany : t.profileEdit.titleLalider}</CardTitle>
            <CardDescription>
              {role === "laLider"
                ? t.profileEdit.descriptionLalider
                : t.profileEdit.descriptionCompany}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSave}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 text-sm rounded-md px-3 py-2">{error}</div>
              )}

              <div className="space-y-1">
                <Label htmlFor="full_name">{t.profileEdit.fullName}</Label>
                <Input
                  id="full_name"
                  value={profile.full_name ?? ""}
                  onChange={(e) => update("full_name", e.target.value)}
                  required
                />
              </div>

              {role === "laLider" && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="contact_email">{t.auth.signup.contactEmail}</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      placeholder={t.auth.signup.contactEmailPlaceholder}
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                    <p className="text-xs text-gray-400">{t.auth.signup.contactEmailHint}</p>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="phone">{t.profileEdit.mobileNumber}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder={t.profileEdit.mobileNumberPlaceholder}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="location_country">{t.profileEdit.country}</Label>
                    <Input
                      id="location_country"
                      placeholder={t.profileEdit.countryPlaceholder}
                      value={locationCountry}
                      onChange={(e) => setLocationCountry(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="location_region">{t.profileEdit.stateProvince}</Label>
                    <Input
                      id="location_region"
                      placeholder={t.profileEdit.stateProvincePlaceholder}
                      value={locationRegion}
                      onChange={(e) => setLocationRegion(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="location_city">{t.profileEdit.city}</Label>
                    <Input
                      id="location_city"
                      placeholder={t.profileEdit.cityPlaceholder}
                      value={locationCity}
                      onChange={(e) => setLocationCity(e.target.value)}
                    />
                  </div>
                  {profile.lala_id && (
                    <div className="space-y-1">
                      <Label>LALA ID</Label>
                      <div className="rounded-lg border border-input bg-muted px-3 py-2 text-sm text-muted-foreground font-mono">{profile.lala_id}</div>
                    </div>
                  )}

                  <div className="rounded-xl ring-1 ring-blue-100 bg-blue-50/50 p-4 space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-blue-900">{t.diversity.sectionTitle}</h3>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{t.diversity.intro}</p>
                    </div>
                    <div className="space-y-1">
                      <Label>{t.diversity.genderLabel}</Label>
                      <Select value={diversityGender} onValueChange={(v: string | null) => setDiversityGender(v ?? "")}>
                        <SelectTrigger><SelectValue placeholder={t.diversity.selectPlaceholder} /></SelectTrigger>
                        <SelectContent>
                          {t.diversity.genderOptions.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>{t.diversity.genderIdentityLabel}</Label>
                      <Select value={diversityGenderIdentity} onValueChange={(v: string | null) => setDiversityGenderIdentity(v ?? "")}>
                        <SelectTrigger><SelectValue placeholder={t.diversity.selectPlaceholder} /></SelectTrigger>
                        <SelectContent>
                          {t.diversity.genderIdentityOptions.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>{t.diversity.sexualOrientationLabel}</Label>
                      <Select value={diversitySexualOrientation} onValueChange={(v: string | null) => setDiversitySexualOrientation(v ?? "")}>
                        <SelectTrigger><SelectValue placeholder={t.diversity.selectPlaceholder} /></SelectTrigger>
                        <SelectContent>
                          {t.diversity.sexualOrientationOptions.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>{t.diversity.raceLabel}</Label>
                      <Select value={diversityRace} onValueChange={(v: string | null) => setDiversityRace(v ?? "")}>
                        <SelectTrigger><SelectValue placeholder={t.diversity.selectPlaceholder} /></SelectTrigger>
                        <SelectContent>
                          {t.diversity.raceOptions.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>{t.profileEdit.lifeStageLabel}</Label>
                    <Select
                      value={lifeStage}
                      onValueChange={(v: string | null) => setLifeStage(v ?? "")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t.profileEdit.lifeStagePlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {t.profileEdit.lifeStageOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {OTHER_LIFE_STAGE_LABELS.has(lifeStage) && (
                    <div className="space-y-1">
                      <Input
                        id="life_stage_other"
                        placeholder={t.profileEdit.lifeStageOtherPlaceholder}
                        value={lifeStageOther}
                        onChange={(e) => setLifeStageOther(e.target.value)}
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <Label htmlFor="edu_university">{t.profileEdit.university}</Label>
                    <Input
                      id="edu_university"
                      placeholder={t.profileEdit.universityPlaceholder}
                      value={eduUniversity}
                      onChange={(e) => setEduUniversity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="edu_degree">{t.profileEdit.degree}</Label>
                    <Input
                      id="edu_degree"
                      placeholder={t.profileEdit.degreePlaceholder}
                      value={eduDegree}
                      onChange={(e) => setEduDegree(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="edu_year">{t.profileEdit.graduationYear}</Label>
                    <Input
                      id="edu_year"
                      placeholder={t.profileEdit.graduationYearPlaceholder}
                      value={eduYear}
                      onChange={(e) => setEduYear(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="bio">{t.profileEdit.bio}</Label>
                    <Textarea
                      id="bio"
                      placeholder={t.profileEdit.bioPlaceholder}
                      value={profile.bio ?? ""}
                      onChange={(e) => update("bio", e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label>{t.profileEdit.experienceSectionTitle}</Label>
                      <p className="text-xs text-gray-400">{t.profileEdit.experienceNote}</p>
                    </div>
                    {workExperience.map((entry, index) => (
                      <div key={index} className="rounded-lg border border-input p-3 space-y-3">
                        <div className="space-y-1">
                          <Label htmlFor={`we_title_${index}`}>{t.profileEdit.workExperienceJobTitle}</Label>
                          <Input
                            id={`we_title_${index}`}
                            placeholder={t.profileEdit.workExperienceJobTitlePlaceholder}
                            value={entry.title}
                            onChange={(e) => updateWorkExperience(index, { title: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`we_company_${index}`}>{t.profileEdit.workExperienceCompany}</Label>
                          <Input
                            id={`we_company_${index}`}
                            placeholder={t.profileEdit.workExperienceCompanyPlaceholder}
                            value={entry.company}
                            onChange={(e) => updateWorkExperience(index, { company: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor={`we_start_${index}`}>{t.profileEdit.workExperienceStartDate}</Label>
                            <Input
                              id={`we_start_${index}`}
                              type="month"
                              value={entry.startDate}
                              onChange={(e) => updateWorkExperience(index, { startDate: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`we_end_${index}`}>{t.profileEdit.workExperienceEndDate}</Label>
                            <Input
                              id={`we_end_${index}`}
                              type="month"
                              disabled={entry.current}
                              value={entry.endDate ?? ""}
                              onChange={(e) => updateWorkExperience(index, { endDate: e.target.value })}
                            />
                          </div>
                        </div>
                        <label className="flex items-center gap-2 text-sm text-gray-600">
                          <Checkbox
                            checked={entry.current}
                            onCheckedChange={(checked: boolean) => updateWorkExperience(index, { current: checked, endDate: checked ? null : entry.endDate })}
                          />
                          {t.profileEdit.workExperienceCurrent}
                        </label>
                        <div className="space-y-1">
                          <Label htmlFor={`we_desc_${index}`}>{t.profileEdit.workExperienceDescription}</Label>
                          <Textarea
                            id={`we_desc_${index}`}
                            placeholder={t.profileEdit.workExperienceDescriptionPlaceholder}
                            value={entry.description}
                            onChange={(e) => updateWorkExperience(index, { description: e.target.value })}
                            rows={3}
                          />
                        </div>
                        {workExperience.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeWorkExperience(index)}
                            className="text-xs text-red-600 hover:underline"
                          >
                            {t.profileEdit.removeJob}
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addWorkExperience}
                      className="text-sm text-blue-600 hover:underline font-medium"
                    >
                      {t.profileEdit.addAnotherJob}
                    </button>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="volunteer_experience">{t.profileEdit.volunteerExperience}</Label>
                    <Textarea
                      id="volunteer_experience"
                      placeholder={t.profileEdit.volunteerExperiencePlaceholder}
                      value={profile.volunteer_experience ?? ""}
                      onChange={(e) => update("volunteer_experience", e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label>{t.profileEdit.skills}</Label>
                      <p className="text-xs text-gray-400">{t.profileEdit.skillsHint}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {t.profileEdit.skillsOptions.map((skill) => (
                        <label key={skill} className="flex items-center gap-2 text-sm text-gray-700">
                          <Checkbox
                            checked={selectedSkills.includes(skill)}
                            onCheckedChange={() => setSelectedSkills((prev) => toggleValue(prev, skill))}
                          />
                          {skill}
                        </label>
                      ))}
                    </div>
                    <div className="space-y-1 pt-1">
                      <Label htmlFor="skills_other">{t.profileEdit.skillsOther}</Label>
                      <Input
                        id="skills_other"
                        placeholder={t.profileEdit.skillsOtherPlaceholder}
                        value={skillsOther}
                        onChange={(e) => setSkillsOther(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label>{t.profileEdit.opportunityTypeLabel}</Label>
                      <p className="text-xs text-gray-400">{t.profileEdit.opportunityTypeHint}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {t.profileEdit.opportunityTypes.map((type) => (
                        <label key={type} className="flex items-center gap-2 text-sm text-gray-700">
                          <Checkbox
                            checked={opportunityTypes.includes(type)}
                            onCheckedChange={() => setOpportunityTypes((prev) => toggleValue(prev, type))}
                          />
                          {type}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="desired_role">{t.profileEdit.desiredRole}</Label>
                    <Input
                      id="desired_role"
                      placeholder={t.profileEdit.desiredRolePlaceholder}
                      value={profile.desired_role ?? ""}
                      onChange={(e) => update("desired_role", e.target.value)}
                    />
                    <p className="text-xs text-gray-400">{t.profileEdit.desiredRoleNote}</p>
                  </div>
                  <div className="space-y-1">
                    <Label>{t.profileEdit.openToRelocate}</Label>
                    <Select
                      value={openToRelocate}
                      onValueChange={(v: string | null) => setOpenToRelocate(v ?? "")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t.profileEdit.openToRelocatePlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {t.profileEdit.openToRelocateOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label>{t.profileEdit.workArrangementsLabel}</Label>
                      <p className="text-xs text-gray-400">{t.profileEdit.workArrangementsHint}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {t.profileEdit.workArrangementsOptions.map((opt) => (
                        <label key={opt} className="flex items-center gap-2 text-sm text-gray-700">
                          <Checkbox
                            checked={workArrangements.includes(opt)}
                            onCheckedChange={() => setWorkArrangements((prev) => toggleValue(prev, opt))}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="linkedin_url">{t.profileEdit.linkedinProfile}</Label>
                    <Input
                      id="linkedin_url"
                      type="url"
                      placeholder={t.profileEdit.linkedinProfilePlaceholder}
                      value={profile.linkedin_url ?? ""}
                      onChange={(e) => update("linkedin_url", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="cv_url">{t.profileEdit.cvUrl}</Label>
                    <Input
                      id="cv_url"
                      type="url"
                      placeholder={t.profileEdit.cvUrlPlaceholder}
                      value={profile.cv_url ?? ""}
                      onChange={(e) => update("cv_url", e.target.value)}
                    />
                    <p className="text-xs text-gray-400">{t.profileEdit.cvUrlHint}</p>
                  </div>
                  <p className="text-xs text-amber-600">{t.profileEdit.errorLinkedinOrCv}</p>
                </>
              )}

              {role === "company" && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="company_name">{t.profileEdit.companyName}</Label>
                    <Input
                      id="company_name"
                      value={profile.company_name ?? ""}
                      onChange={(e) => update("company_name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="location">{t.profileEdit.headquarters}</Label>
                    <Input
                      id="location"
                      placeholder={t.profileEdit.headquartersPlaceholder}
                      value={profile.location ?? ""}
                      onChange={(e) => update("location", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="website">{t.profileEdit.website}</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://"
                      value={profile.website ?? ""}
                      onChange={(e) => update("website", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="linkedin_url">{t.profileEdit.linkedinCompany}</Label>
                    <Input
                      id="linkedin_url"
                      type="url"
                      placeholder={t.profileEdit.linkedinCompanyPlaceholder}
                      value={profile.linkedin_url ?? ""}
                      onChange={(e) => update("linkedin_url", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="company_description">{t.profileEdit.whatCompanyDoes}</Label>
                    <Textarea
                      id="company_description"
                      placeholder={t.profileEdit.whatCompanyPlaceholder}
                      value={profile.company_description ?? ""}
                      onChange={(e) => update("company_description", e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="bio">{t.profileEdit.whyJoin}</Label>
                    <Textarea
                      id="bio"
                      placeholder={t.profileEdit.whyJoinPlaceholder}
                      value={profile.bio ?? ""}
                      onChange={(e) => update("bio", e.target.value)}
                      rows={3}
                    />
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? t.profileEdit.saving : t.profileEdit.save}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
      </div>
    </div>
  );
}
