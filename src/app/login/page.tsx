"use client";

import { useState } from "react";
import { login, signup, requestPasswordReset } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Building2, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [view, setView] = useState<"login" | "signup" | "forgot">("login");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    if (view === "signup") {
      const res = await signup(formData);
      if (res?.success) {
        setShowSuccess(true);
      } else {
        toast.error(res?.error || "Error signing up");
      }
    } else if (view === "login") {
      try {
        await login(formData);
      } catch (err: any) {
        toast.error("Invalid credentials");
      }
    } else if (view === "forgot") {
      const res = await requestPasswordReset(formData);
      if (res?.success) {
        toast.success("Reset link sent to your email!");
        setView("login");
      } else {
        toast.error(res?.error);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background font-sans">
      {/* SUCCESS POPUP */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md border-none bg-background p-8 text-center flex flex-col items-center">
          <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-10 w-10 text-primary animate-in zoom-in duration-300" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Welcome to the Club!</DialogTitle>
            <DialogDescription className="text-base pt-2">
              Your account has been created successfully. Your profile is ready.
            </DialogDescription>
          </DialogHeader>
          <Button
            className="w-full mt-6 h-12 text-lg font-bold"
            onClick={() => { setShowSuccess(false); setView("login"); }}
          >
            Go to Login
          </Button>
        </DialogContent>
      </Dialog>

      {/* Left Branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="z-10 flex items-center gap-2 text-2xl font-black italic">
          <Building2 className="h-8 w-8" /> RentEase
        </div>
        <div className="z-10">
          <h2 className="text-6xl font-black leading-tight mb-6">Efficiency <br /> Meets Design.</h2>
          <p className="text-lg opacity-80 max-w-md">Join hundreds of landlords managing their empire with RentEase.</p>
        </div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Right Form */}
      <div className="flex items-center justify-center p-8 relative">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-black tracking-tighter">
              {view === "signup" ? "Get Started" : view === "forgot" ? "Reset Password" : "Welcome"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {view === "signup"
                ? "Create your landlord account"
                : view === "forgot"
                ? "We'll send you a link to your email"
                : "Enter details to access your dashboard"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {view === "signup" && (
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input name="fullName" placeholder="Sunita Devi" className="h-12 bg-muted/40 border-none" required />
              </div>
            )}

            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input name="email" type="email" placeholder="name@example.com" className="h-12 bg-muted/40 border-none" required />
            </div>

            {view !== "forgot" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Password</Label>
                  {view === "login" && (
                    <button
                      type="button"
                      onClick={() => setView("forgot")}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <Input name="password" type="password" className="h-12 bg-muted/40 border-none" required />
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-lg font-bold gap-2" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : (
                <>
                  {view === "signup" ? "Create Account" : view === "forgot" ? "Send Reset Link" : "Sign In"}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setView(view === "login" ? "signup" : "login")}
              className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
            >
              {view === "signup"
                ? "Already a user? Log in"
                : view === "forgot"
                ? "Remembered? Go back"
                : "New here? Create account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
