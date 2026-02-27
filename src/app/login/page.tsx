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
import { Building2, ArrowRight, Loader2, CheckCircle2, Shield, KeyRound, Sparkles } from "lucide-react";
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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] relative overflow-hidden font-sans">
      {/* SUCCESS POPUP */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md border-none bg-background p-8 text-center flex flex-col items-center">
          <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-10 w-10 text-primary animate-in zoom-in duration-300" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Welcome to the Club!</DialogTitle>
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
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-400/10 rounded-full blur-[120px] animate-pulse delay-700" />

      <div className="z-10 w-full max-w-[1000px] grid lg:grid-cols-2 bg-white/40 backdrop-blur-2xl border border-white/40 rounded-[40px] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] overflow-hidden mx-4">

        {/* LEFT SIDE: BRANDING */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="z-10 flex items-center gap-2 text-2xl font-black italic tracking-tighter">
            <div className="bg-white text-primary p-1.5 rounded-xl shadow-lg shadow-black/10">
              <Building2 className="h-6 w-6" />
            </div>
            RentEase
          </div>
          <div className="z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="h-3 w-3" /> New Generation App
            </div>
            <h2 className="text-5xl font-black leading-[1.1] tracking-tighter">
              Manage your <br /> Empire with <br /> <span className="text-indigo-200 italic">Clarity.</span>
            </h2>
          </div>
          <div className="z-10 text-sm opacity-60 font-medium">© 2026 RentEase Inc. All rights reserved.</div>
          <div className="absolute bottom-[-50px] right-[-50px] w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        </div>

        {/* RIGHT SIDE: FORM */}
        <div className="p-8 lg:p-16 flex flex-col justify-center bg-white/20">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">
              {titles[view]}
            </h1>
            <p className="text-slate-500 font-medium">
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
                <Label className="text-xs font-bold uppercase ml-1">Full Name</Label>
                <Input name="fullName" placeholder="Sunita Devi" className="h-12 rounded-2xl bg-white border-slate-200 shadow-sm" required />
              </div>
            )}

            {view !== "otp-verify" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase ml-1">Email Address</Label>
                <Input name="email" type="email" placeholder="name@example.com" className="h-12 rounded-2xl bg-white border-slate-200 shadow-sm" required />
              </div>
            )}

            {(view === "login" || view === "signup") && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <Label className="text-xs font-bold uppercase">Password</Label>
                  {view === "login" && (
                    <button type="button" onClick={() => setView("forgot")} className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">
                      Forgot?
                    </button>
                  )}
                </div>
                <Input name="password" type="password" placeholder="••••••••" className="h-12 rounded-2xl bg-white border-slate-200 shadow-sm" required />
              </div>
            )}

            {view === "otp-verify" && (
              <div className="space-y-1.5 text-center">
                <Label className="text-xs uppercase font-bold tracking-widest text-slate-500">
                  Enter 6-Digit Code
                </Label>
                <Input
                  name="token"
                  placeholder="000000"
                  className="h-16 text-center text-3xl font-black tracking-[0.5em] rounded-2xl bg-white border-slate-200 shadow-sm"
                  maxLength={6}
                  inputMode="numeric"
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
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
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white/60 px-3 text-slate-400 font-bold rounded-full">Or</span>
                  </div>
                </div>
                {view === "login" ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 rounded-2xl border-slate-200 bg-white/60 hover:bg-white"
                    onClick={() => setView("otp-request")}
                  >
                    <Shield className="mr-2 h-4 w-4" /> Use Email OTP Instead
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 rounded-2xl border-slate-200 bg-white/60 hover:bg-white"
                    onClick={() => setView("login")}
                  >
                    <KeyRound className="mr-2 h-4 w-4" /> Use Password Instead
                  </Button>
                )}
              </>
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  if (view === "otp-verify") { setView("otp-request"); return; }
                  if (view === "forgot") { setView("login"); return; }
                  setView(view === "signup" ? "login" : "signup");
                }}
                className="text-sm font-bold text-slate-400 hover:text-primary transition-colors"
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
