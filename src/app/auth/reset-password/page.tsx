"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, KeyRound, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const hash = window.location.hash;

    if (hash && hash.includes("access_token")) {
      // Implicit flow: Supabase put the token in the URL hash fragment
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token") ?? "";

      if (accessToken) {
        supabase.auth
          .setSession({ access_token: accessToken, refresh_token: refreshToken })
          .then(({ error }) => {
            if (error) {
              toast.error("Session expired. Please request a new reset link.");
              router.push("/login");
            } else {
              setSessionReady(true);
            }
          });
      } else {
        router.push("/login");
      }
    } else {
      // PKCE flow: session was already set by /auth/callback
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          setSessionReady(true);
        } else {
          toast.error("Session expired. Please request a new reset link.");
          router.push("/login");
        }
      });
    }
  }, [router]);

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success("Password updated! Redirecting...");
      router.push("/");
    }
  }

  if (!sessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md border-none shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] p-4">
        <CardHeader className="text-center">
          <div className="h-16 w-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3">
            <KeyRound className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tighter">New Password</CardTitle>
          <CardDescription className="text-base">
            Create a secure password to regain access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Set New Password
              </Label>
              <Input
                name="password"
                type="password"
                required
                minLength={6}
                className="h-14 bg-muted/40 border-none text-lg focus-visible:ring-primary"
                placeholder="••••••••"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" /> Update & Login
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
