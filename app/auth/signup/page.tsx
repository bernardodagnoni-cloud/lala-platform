"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserRole } from "@/types/database";

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useT();
  const initialRole = (searchParams.get("role") as UserRole) || "";
  const [role, setRole] = useState<UserRole | "">(initialRole);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // LaLider fields
  const [lalaId, setLalaId] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // Company fields
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyFullName, setCompanyFullName] = useState("");
  const [companyPassword, setCompanyPassword] = useState("");

  async function handleLaliderSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!lalaId.trim()) { setError("Please enter your LALA ID."); return; }
    if (fullName.trim().length < 2) { setError(t.auth.signup.errorFullName); return; }
    if (password.length < 8) { setError(t.auth.signup.errorPassword); return; }
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/signup-lalider", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lala_id: lalaId.trim(), full_name: fullName.trim(), password, contact_email: contactEmail.trim() || null }),
    });

    const json = await res.json();
    if (!res.ok) { setError(json.error); setLoading(false); return; }

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: json.email, password });
    if (signInError) { setError(signInError.message); setLoading(false); return; }

    router.push("/profile/edit");
    router.refresh();
  }

  async function handleCompanySignup(e: React.FormEvent) {
    e.preventDefault();
    if (companyFullName.trim().length < 2) { setError(t.auth.signup.errorFullName); return; }
    if (companyPassword.length < 8) { setError(t.auth.signup.errorPassword); return; }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: companyEmail,
      password: companyPassword,
      options: { data: { full_name: companyFullName.trim(), role: "company" } },
    });

    if (signUpError) { setError(signUpError.message); setLoading(false); return; }

    if (data.session) {
      router.push("/profile/edit");
    } else {
      router.push("/auth/check-email");
    }
    router.refresh();
  }

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">{t.auth.signup.title}</CardTitle>
            <CardDescription>{t.auth.signup.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              onClick={() => setRole("laLider")}
              className="w-full rounded-xl border-2 border-blue-900 bg-blue-900 text-white px-4 py-4 text-left hover:bg-blue-800 transition-colors"
            >
              <p className="font-semibold">{t.auth.signup.roleLalider}</p>
              <p className="text-sm text-blue-200 mt-0.5">I have a LALA ID</p>
            </button>
            <button
              onClick={() => setRole("company")}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-4 text-left hover:border-blue-900 hover:bg-blue-50 transition-colors"
            >
              <p className="font-semibold text-gray-800">{t.auth.signup.roleCompany}</p>
              <p className="text-sm text-gray-400 mt-0.5">We're hiring LaLideres</p>
            </button>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500 text-center w-full">
              {t.auth.signup.haveAccount}{" "}
              <Link href="/auth/login" className="text-blue-600 hover:underline">{t.auth.signup.signInLink}</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <button onClick={() => { setRole(""); setError(null); }} className="text-sm text-blue-600 hover:underline text-left mb-1">← Back</button>
          <CardTitle className="text-2xl">{t.auth.signup.title}</CardTitle>
          <CardDescription>
            {role === "laLider" ? t.auth.signup.roleLalider : t.auth.signup.roleCompany}
          </CardDescription>
        </CardHeader>

        {role === "laLider" && (
          <form onSubmit={handleLaliderSignup}>
            <CardContent className="space-y-4">
              {error && <div className="bg-red-50 text-red-700 text-sm rounded-md px-3 py-2">{error}</div>}
              <div className="space-y-1">
                <Label htmlFor="lalaId">{t.auth.signup.lalaId}</Label>
                <Input id="lalaId" value={lalaId} onChange={(e) => setLalaId(e.target.value)} placeholder={t.auth.signup.lalaIdPlaceholder} required autoComplete="username" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="fullName">{t.auth.signup.fullName}</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">{t.auth.signup.password}</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="contactEmail">{t.auth.signup.contactEmail}</Label>
                <Input id="contactEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder={t.auth.signup.contactEmailPlaceholder} autoComplete="email" />
                <p className="text-xs text-gray-400">{t.auth.signup.contactEmailHint}</p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t.auth.signup.submitting : t.auth.signup.submit}
              </Button>
              <p className="text-sm text-gray-500 text-center">
                {t.auth.signup.haveAccount}{" "}
                <Link href="/auth/login" className="text-blue-600 hover:underline">{t.auth.signup.signInLink}</Link>
              </p>
            </CardFooter>
          </form>
        )}

        {role === "company" && (
          <form onSubmit={handleCompanySignup}>
            <CardContent className="space-y-4">
              {error && <div className="bg-red-50 text-red-700 text-sm rounded-md px-3 py-2">{error}</div>}
              <div className="space-y-1">
                <Label htmlFor="companyFullName">{t.auth.signup.fullName}</Label>
                <Input id="companyFullName" value={companyFullName} onChange={(e) => setCompanyFullName(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="companyEmail">{t.auth.signup.email}</Label>
                <Input id="companyEmail" type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="companyPassword">{t.auth.signup.password}</Label>
                <Input id="companyPassword" type="password" value={companyPassword} onChange={(e) => setCompanyPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t.auth.signup.submitting : t.auth.signup.submit}
              </Button>
              <p className="text-sm text-gray-500 text-center">
                {t.auth.signup.haveAccount}{" "}
                <Link href="/auth/login" className="text-blue-600 hover:underline">{t.auth.signup.signInLink}</Link>
              </p>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
