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

export default function ActivatePage() {
  const router = useRouter();
  const t = useT();
  const [lalaId, setLalaId] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleActivate(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError(t.auth.activate.errorPasswordMismatch);
      return;
    }
    if (password.length < 8) {
      setError(t.auth.signup.errorPassword);
      return;
    }
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lala_id: lalaId.trim(), password }),
    });

    const json = await res.json();
    if (!res.ok) { setError(json.error); setLoading(false); return; }

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: json.email, password });
    if (signInError) { setError(signInError.message); setLoading(false); return; }

    router.push("/profile/edit");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{t.auth.activate.title}</CardTitle>
          <CardDescription>{t.auth.activate.description}</CardDescription>
        </CardHeader>
        <form onSubmit={handleActivate}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 text-sm rounded-md px-3 py-2">{error}</div>
            )}
            <div className="space-y-1">
              <Label htmlFor="lalaId">LALA ID</Label>
              <Input
                id="lalaId"
                value={lalaId}
                onChange={(e) => setLalaId(e.target.value)}
                placeholder="e.g. BR16019"
                required
                autoComplete="username"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">{t.auth.activate.password}</Label>
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
              <Label htmlFor="confirm">{t.auth.activate.confirmPassword}</Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t.auth.activate.submitting : t.auth.activate.submit}
            </Button>
            <p className="text-sm text-gray-500 text-center">
              {t.auth.activate.alreadyHavePassword}{" "}
              <Link href="/auth/login" className="text-blue-600 hover:underline">{t.auth.activate.signIn}</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
