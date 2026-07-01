"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

function syntheticEmail(lalaId: string) {
  return `${lalaId.toLowerCase().replace(/[^a-z0-9._-]/g, "-")}@lalaplatform.internal`;
}

export default function LoginPage() {
  const router = useRouter();
  const t = useT();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const email = identifier.includes("@") ? identifier : syntheticEmail(identifier.trim());

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(identifier.includes("@") ? error.message : "Invalid LALA ID or password.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{t.auth.login.title}</CardTitle>
          <CardDescription>{t.auth.login.description}</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 text-sm rounded-md px-3 py-2">{error}</div>
            )}
            <div className="space-y-1">
              <Label htmlFor="identifier">{t.auth.login.identifier}</Label>
              <Input
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={t.auth.login.identifier}
                required
                autoComplete="username"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">{t.auth.login.password}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t.auth.login.submitting : t.auth.login.submit}
            </Button>
            <p className="text-sm text-gray-500 text-center">
              {t.auth.login.noAccount}{" "}
              <Link href="/auth/signup" className="text-blue-600 hover:underline">
                {t.auth.login.signUpLink}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
