"use client";

import { updatePasswordAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useState } from "react";

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md border-none shadow-2xl">
        <CardHeader className="text-center">
          <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-black">Set New Password</CardTitle>
          <CardDescription>Enter a strong new password for your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData) => {
              setLoading(true);
              await updatePasswordAction(formData);
              setLoading(false);
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input name="password" type="password" required className="h-12" placeholder="••••••••" />
            </div>
            <Button className="w-full h-12 font-bold" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
