"use client";

import { useState } from "react";
import { login, signup, requestPasswordReset, sendOTP, verifyOTP } from "@/app/auth/actions";
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
import { Building2, ArrowRight, Loader2, CheckCircle2, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

type View = "login" | "signup" | "forgot" | "otp-request" | "otp-verify";

export default function LoginPage() {
  const [view, setView] = useState<View>("login");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      if (view === "login") {
        const result = await login(formData);
        if (result?.error) {
          toast.error("Wrong password or username. Please enter correct details.");
          setLoading(false);
        } else {
          window.location.href = "/";
        }
      } else if (view === "signup") {
        const res = await signup(formData);
        if (res?.success) {
          setShowSuccess(true);
        } else {
          toast.error(res?.error || "Error signing up");
        }
      } else if (view === "forgot") {
        const res = await requestPasswordReset(formData);
        if (res?.success) {
          toast.success("Reset link sent to your email!");
          setView("login");
        } else {
          toast.error(res?.error);
        }
      } else if (view === "otp-request") {
        const res = await sendOTP(formData);
        if (res?.success) {
          setOtpEmail(formData.get("email") as string);
          setView("otp-verify");
          toast.success("6-digit code sent to your email!");
        } else {
          toast.error(res?.error);
        }
      } else if (view === "otp-verify") {
        const token = formData.get("token") as string;
        const res = await verifyOTP(otpEmail, token);
        if (res?.error) toast.error(res.error);
      }
    } catch (err: any) {
      if (err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
      toast.error(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const titles: Record<View, string> = {
    login: "Sign In",
    signup: "Get Started",
    forgot: "Recovery",
    "otp-request": "Passwordless",
    "otp-verify": "Verify Code",
  };

  return (
    <div className="min-h-dvh w-full flex items-center justify-center bg-[#f7f8fb] dark:bg-slate-950 relative font-sans pb-14">
      {/* SUCCESS POPUP */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md border-none bg-background p-8 text-center flex flex-col items-center">
          <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-10 w-10 text-primary animate-in zoom-in duration-300" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">Welcome to RentEase</DialogTitle>
            <DialogDescription className="text-base pt-2">
              Your account has been created. Check your email to confirm your address.
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

      {/* BACKGROUND DECORATION */}
      <div className="z-10 w-full max-w-[960px] grid lg:grid-cols-2 bg-white/75 dark:bg-slate-900/85 backdrop-blur-2xl border border-white/80 dark:border-white/10 rounded-3xl shadow-[0_24px_70px_-35px_rgba(15,23,42,0.4)] overflow-hidden mx-4">

        {/* LEFT SIDE: BRANDING */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#19365f] via-[#2459a8] to-[#397bd2] text-white relative overflow-hidden">
          <div className="z-10 flex items-center gap-2 text-xl font-semibold tracking-tight">
            <div className="bg-white/15 border border-white/20 p-1.5 rounded-xl">
              <Building2 className="h-6 w-6" />
            </div>
            RentEase
          </div>
          <div className="z-10 space-y-6">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-white/75">
              <Sparkles className="h-4 w-4" /> A clearer way to manage rentals
            </div>
            <h2 className="text-4xl font-semibold leading-[1.08] tracking-tight">
              Your properties, <br /> in better <br /> <span className="text-blue-100">balance.</span>
            </h2>
          </div>
          <div className="z-10 text-sm text-white/60">RentEase · Rental management</div>
        </div>

        {/* RIGHT SIDE: FORM */}
        <div className="p-7 sm:p-9 lg:p-12 flex flex-col justify-center bg-white/45 dark:bg-slate-900/45">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 mb-2">
              {titles[view]}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              {view === "login" && "Enter details to access your dashboard"}
              {view === "signup" && "Create your landlord account"}
              {view === "forgot" && "We'll send a reset link to your email"}
              {view === "otp-request" && "We'll email you a 6-digit code"}
              {view === "otp-verify" && `Code sent to ${otpEmail}`}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {view === "signup" && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium ml-1">Full name</Label>
                <Input name="fullName" placeholder="Sunita Devi" className="h-11 rounded-xl bg-white/80 dark:bg-slate-950 border-slate-200 dark:border-white/10 shadow-none" required />
              </div>
            )}

            {view !== "otp-verify" && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium ml-1">Email address</Label>
                <Input name="email" type="email" placeholder="name@example.com" className="h-11 rounded-xl bg-white/80 dark:bg-slate-950 border-slate-200 dark:border-white/10 shadow-none" required />
              </div>
            )}

            {(view === "login" || view === "signup") && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <Label className="text-sm font-medium">Password</Label>
                  {view === "login" && (
                    <button type="button" onClick={() => setView("forgot")} className="text-sm font-medium text-primary hover:underline underline-offset-4">
                      Forgot password?
                    </button>
                  )}
                </div>
                <Input name="password" type="password" placeholder="••••••••" className="h-11 rounded-xl bg-white/80 dark:bg-slate-950 border-slate-200 dark:border-white/10 shadow-none" required />
              </div>
            )}

            {view === "login" && (
              <div className="flex items-center space-x-2 px-1">
                <input
                  type="checkbox"
                  id="remember"
                  name="rememberMe"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  defaultChecked
                />
                <label htmlFor="remember" className="text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                  Keep me logged in
                </label>
              </div>
            )}

            {view === "otp-verify" && (
              <div className="space-y-1.5 text-center">
                <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Enter 6-Digit Code
                </Label>
                <Input
                  name="token"
                  placeholder="000000"
                  className="h-14 text-center text-2xl font-semibold tracking-[0.4em] rounded-xl bg-white/80 dark:bg-slate-950 border-slate-200 dark:border-white/10 shadow-none"
                  maxLength={6}
                  inputMode="numeric"
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-medium shadow-md shadow-primary/15 mt-4"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                <>
                  {view === "login" && "Sign In"}
                  {view === "signup" && "Create Account"}
                  {view === "forgot" && "Send Reset Link"}
                  {view === "otp-request" && "Send Code"}
                  {view === "otp-verify" && "Verify & Enter"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          {/* Alternates */}
          <div className="mt-8 space-y-4">
            {(view === "login" || view === "otp-request") && (
              <div className="grid grid-cols-2 gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className={`h-11 border-none rounded-xl font-medium ${view === "otp-request" ? "bg-primary text-white shadow-sm" : "bg-muted/70"}`}
                  onClick={() => setView("otp-request")}
                >
                  <Mail className="mr-2 h-4 w-4" /> Email OTP
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={`h-11 border-none rounded-xl font-medium ${view === "login" ? "bg-primary text-white shadow-sm" : "bg-muted/70"}`}
                  onClick={() => setView("login")}
                >
                  <ShieldCheck className="mr-2 h-4 w-4" /> Password
                </Button>
              </div>
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  if (view === "otp-verify") { setView("otp-request"); return; }
                  if (view === "forgot") { setView("login"); return; }
                  setView(view === "signup" ? "login" : "signup");
                }}
                className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
              >
                {view === "signup" && "Already a user? Sign in"}
                {view === "login" && "Don't have an account? Join us"}
                {view === "forgot" && "Remembered? Go back"}
                {view === "otp-request" && "Don't have an account? Join us"}
                {view === "otp-verify" && "Wrong email? Go back"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
