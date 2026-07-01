"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function ActivatePage() {
  const router = useRouter();
  const [lalaId, setLalaId] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleActivate(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match. / As senhas não coincidem. / Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
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
          <CardTitle className="text-2xl">
            Activate your account
          </CardTitle>
          <CardDescription className="space-y-1">
            <span className="block">Enter your LALA ID and choose a password to get started.</span>
            <span className="block text-gray-400">Digite seu ID LALA e escolha uma senha para começar.</span>
            <span className="block text-gray-400">Ingresa tu ID LALA y elige una contraseña para empezar.</span>
          </CardDescription>
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
              <Label htmlFor="password">Password / Senha / Contraseña</Label>
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
              <Label htmlFor="confirm">Confirm password / Confirmar senha / Confirmar contraseña</Label>
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
              {loading ? "Activating…" : "Activate account / Ativar conta / Activar cuenta"}
            </Button>
            <p className="text-sm text-gray-500 text-center">
              Already have a password?{" "}
              <Link href="/auth/login" className="text-blue-600 hover:underline">Sign in</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
