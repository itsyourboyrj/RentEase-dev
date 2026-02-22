"use client";

import { updatePasswordAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, KeyRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);

  async function handleReset(formData: FormData) {
    setLoading(true);
    const res = await updatePasswordAction(formData);
    if (res?.error) {
      toast.error(res.error);
      setLoading(false);
    }
    // If successful, the action redirects automatically
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
          <form action={handleReset} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Set New Password</Label>
              <Input
                name="password"
                type="password"
                required
                className="h-14 bg-muted/40 border-none text-lg focus-visible:ring-primary"
                placeholder="••••••••"
              />
            </div>
            <Button className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Update & Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
