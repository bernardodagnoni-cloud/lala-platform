"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
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
  // LaLíder sign-in is handled entirely by /auth/activate now (it looks the
  // LALA ID up and transparently creates a new record if one doesn't exist
  // yet, instead of asking the user to pick between two screens). Anything
  // that still links here with ?role=laLider gets bounced there.
  const initialRole = (searchParams.get("role") as UserRole) || "";
  const [role, setRole] = useState<UserRole | "">(initialRole === "company" ? "company" : "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialRole === "laLider") router.replace("/auth/activate");
  }, [initialRole, router]);

  // Company fields
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyFullName, setCompanyFullName] = useState("");
  const [companyPassword, setCompanyPassword] = useState("");
  const [companyConfirmPassword, setCompanyConfirmPassword] = useState("");

  async function handleCompanySignup(e: React.FormEvent) {
    e.preventDefault();
    if (companyFullName.trim().length < 2) { setError(t.auth.signup.errorFullName); return; }
    if (companyPassword.length < 8) { setError(t.auth.signup.errorPassword); return; }
    if (companyPassword !== companyConfirmPassword) { setError(t.auth.activate.errorPasswordMismatch); return; }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: companyEmail,
      password: companyPassword,
      options: { data: { full_name: companyFullName.trim(), role: "company" } },
    });

    if (signUpError) { setError(t.auth.signup.errorGeneric); setLoading(false); return; }

    if (data.session) {
      router.push("/profile/edit");
    } else {
      router.push("/auth/check-email");
    }
    router.refresh();
  }

  if (initialRole === "laLider") return null;

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
              onClick={() => router.push("/auth/activate")}
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
              <p className="text-sm text-gray-400 mt-0.5">We&apos;re hiring LALideres</p>
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
          <CardDescription>{t.auth.signup.roleCompany}</CardDescription>
        </CardHeader>

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
              <PasswordInput id="companyPassword" value={companyPassword} onChange={(e) => setCompanyPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="companyConfirmPassword">{t.auth.activate.confirmPassword}</Label>
              <PasswordInput id="companyConfirmPassword" value={companyConfirmPassword} onChange={(e) => setCompanyConfirmPassword(e.target.value)} required autoComplete="new-password" />
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
      </Card>
    </div>
  );
}
