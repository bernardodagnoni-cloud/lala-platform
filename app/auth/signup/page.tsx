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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole | "">(initialRole);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!role) { setError(t.auth.signup.errorSelectRole); return; }
    if (fullName.trim().length < 2) { setError(t.auth.signup.errorFullName); return; }
    if (password.length < 8) { setError(t.auth.signup.errorPassword); return; }
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // If email confirmation is disabled, Supabase returns a session immediately
    if (data.session) {
      router.push("/profile/edit");
    } else {
      router.push("/auth/check-email");
    }
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{t.auth.signup.title}</CardTitle>
          <CardDescription>{t.auth.signup.description}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 text-sm rounded-md px-3 py-2">
                {error}
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="fullName">{t.auth.signup.fullName}</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">{t.auth.signup.email}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">{t.auth.signup.password}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-1">
              <Label>{t.auth.signup.roleLabel}</Label>
              <Select value={role} onValueChange={(v: string | null) => setRole((v ?? "") as UserRole)} required>
                <SelectTrigger>
                  <SelectValue placeholder={t.auth.signup.roleLabel} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="laLider">{t.auth.signup.roleLalider}</SelectItem>
                  <SelectItem value="company">{t.auth.signup.roleCompany}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading || !role}>
              {loading ? t.auth.signup.submitting : t.auth.signup.submit}
            </Button>
            <p className="text-sm text-gray-500 text-center">
              {t.auth.signup.haveAccount}{" "}
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                {t.auth.signup.signInLink}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
