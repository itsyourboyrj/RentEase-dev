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
import { Building2, ArrowRight, Loader2, CheckCircle2, Shield } from "lucide-react";
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
        await login(formData);
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
    login: "Welcome",
    signup: "Get Started",
    forgot: "Reset Password",
    "otp-request": "Passwordless",
    "otp-verify": "Verify Code",
  };

  const subtitles: Record<View, string> = {
    login: "Enter details to access your dashboard",
    signup: "Create your landlord account",
    forgot: "We'll send you a link to your email",
    "otp-request": "We'll email you a 6-digit code",
    "otp-verify": `Code sent to ${otpEmail}`,
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
            <h1 className="text-4xl font-black tracking-tighter">{titles[view]}</h1>
            <p className="text-muted-foreground mt-2">{subtitles[view]}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {view === "signup" && (
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input name="fullName" placeholder="Sunita Devi" className="h-12 bg-muted/40 border-none" required />
              </div>
            )}

            {view !== "otp-verify" && (
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input name="email" type="email" placeholder="name@example.com" className="h-12 bg-muted/40 border-none" required />
              </div>
            )}

            {(view === "login" || view === "signup") && (
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

            {view === "otp-verify" && (
              <div className="space-y-2 text-center">
                <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
                  Enter 6-Digit Code
                </Label>
                <Input
                  name="token"
                  placeholder="000000"
                  className="h-16 text-center text-3xl font-black tracking-[0.5em] bg-muted/40 border-none"
                  maxLength={6}
                  inputMode="numeric"
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-lg font-bold gap-2" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : (
                <>
                  {view === "login" && "Sign In"}
                  {view === "signup" && "Create Account"}
                  {view === "forgot" && "Send Reset Link"}
                  {view === "otp-request" && "Send Code"}
                  {view === "otp-verify" && "Verify & Enter"}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          {/* Divider + alternates */}
          <div className="space-y-4">
            {(view === "login" || view === "otp-request") && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-muted" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>
                {view === "login" ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-none bg-muted/20 hover:bg-muted/40"
                    onClick={() => setView("otp-request")}
                  >
                    <Shield className="mr-2 h-4 w-4" /> Use Email OTP Instead
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-none bg-muted/20 hover:bg-muted/40"
                    onClick={() => setView("login")}
                  >
                    Use Password Instead
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
                className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
              >
                {view === "signup" && "Already a user? Log in"}
                {view === "login" && "New here? Create account"}
                {view === "forgot" && "Remembered? Go back"}
                {view === "otp-request" && "New here? Create account"}
                {view === "otp-verify" && "Wrong email? Go back"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
