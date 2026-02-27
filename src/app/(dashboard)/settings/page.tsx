"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/components/language-provider";
import { useAuth } from "@/components/auth-provider";
import { updateOwnerSettings, removeOwnerFile, updatePassword } from "@/app/settings/actions";
import { authorizeEmailChange, finalizeEmailChange } from "@/app/auth/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, Camera, Sun, Lock, QrCode, Loader2, X, Mail } from "lucide-react";
import { toast } from "sonner";

function SettingsSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 p-4 animate-pulse">
      <div className="h-10 w-48 bg-slate-200 rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="h-64 bg-slate-100 rounded-[32px]" />
        <div className="md:col-span-2 space-y-6">
          <div className="h-40 bg-slate-100 rounded-[32px]" />
          <div className="h-40 bg-slate-100 rounded-[32px]" />
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useLanguage();
  const { owner, user, loading } = useAuth();

  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // Email change state
  const [isEmailChanging, setIsEmailChanging] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpToken, setOtpToken] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);

  // Instant preview states
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);

  // Deferred removals — applied on save, not immediately
  const [pendingRemovals, setPendingRemovals] = useState<Set<'profile' | 'qr'>>(new Set());

  // Track blob URLs for cleanup
  const profileBlobRef = useRef<string | null>(null);
  const qrBlobRef = useRef<string | null>(null);

  // Sync previews and language from auth context once loaded
  useEffect(() => {
    if (owner) {
      if (owner.profile_url && !profileBlobRef.current) setProfilePreview(owner.profile_url);
      if (owner.upi_qr_url && !qrBlobRef.current) setQrPreview(owner.upi_qr_url);
      if (owner.preferred_lang) setLang(owner.preferred_lang);
    }
  }, [owner]);

  useEffect(() => {
    return () => {
      if (profileBlobRef.current) URL.revokeObjectURL(profileBlobRef.current);
      if (qrBlobRef.current) URL.revokeObjectURL(qrBlobRef.current);
    };
  }, []);

  function handleImagePreview(e: React.ChangeEvent<HTMLInputElement>, type: "profile" | "qr") {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "profile") {
      if (profileBlobRef.current) URL.revokeObjectURL(profileBlobRef.current);
      const url = URL.createObjectURL(file);
      profileBlobRef.current = url;
      setProfilePreview(url);
      // Cancel any pending removal since user is uploading a new file
      setPendingRemovals(prev => { const next = new Set(prev); next.delete('profile'); return next; });
    } else {
      if (qrBlobRef.current) URL.revokeObjectURL(qrBlobRef.current);
      const url = URL.createObjectURL(file);
      qrBlobRef.current = url;
      setQrPreview(url);
      setPendingRemovals(prev => { const next = new Set(prev); next.delete('qr'); return next; });
    }
  }

  function markForRemoval(type: 'profile' | 'qr') {
    if (type === 'profile') {
      if (profileBlobRef.current) { URL.revokeObjectURL(profileBlobRef.current); profileBlobRef.current = null; }
      setProfilePreview(null);
      const input = document.querySelector<HTMLInputElement>('input[name="profileFile"]');
      if (input) input.value = '';
    } else {
      if (qrBlobRef.current) { URL.revokeObjectURL(qrBlobRef.current); qrBlobRef.current = null; }
      setQrPreview(null);
      const input = document.querySelector<HTMLInputElement>('input[name="qrFile"]');
      if (input) input.value = '';
    }
    setPendingRemovals(prev => new Set(prev).add(type));
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    formData.append("lang", lang);

    // profileFile input lives outside the <form> element — grab it manually
    const profileInput = document.querySelector<HTMLInputElement>('input[name="profileFile"]');
    if (profileInput?.files?.[0]) formData.set("profileFile", profileInput.files[0]);

    try {
      const res = await updateOwnerSettings(formData);
      if (res?.success) {
        // Apply deferred removals before showing success
        try {
          for (const type of pendingRemovals) {
            await removeOwnerFile(type);
          }
          setPendingRemovals(new Set());
        } catch (removalErr) {
          toast.error(`Failed to remove file: ${removalErr instanceof Error ? removalErr.message : String(removalErr)}`);
          setSaving(false);
          return;
        }
        toast.success("Settings saved! Refreshing...");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error(res?.error || "Failed to save settings");
        setSaving(false);
      }
    } catch {
      toast.error("An unexpected error occurred");
      setSaving(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await updatePassword(formData);
      if (res?.success) {
        toast.success("Password updated successfully");
        setPasswordDialogOpen(false);
        form.reset();
      } else {
        toast.error(res?.error || "Failed to update password");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleStartEmailChange() {
    setEmailChangeLoading(true);
    try {
      const res = await authorizeEmailChange();
      if (res?.success) {
        setOtpSent(true);
        toast.success("Verification code sent to your current email!");
      } else {
        toast.error(res?.error || "Failed to send code");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setEmailChangeLoading(false);
    }
  }

  async function handleConfirmEmailChange() {
    if (!otpToken || !newEmail) { toast.error("Please enter both the code and your new email"); return; }
    setEmailChangeLoading(true);
    try {
      const res = await finalizeEmailChange(otpToken, newEmail);
      if (res?.success) {
        toast.success("Email updated! Check your new inbox to confirm.");
        setIsEmailChanging(false);
        setOtpSent(false);
        setOtpToken("");
        setNewEmail("");
      } else {
        toast.error(res?.error || "Failed to update email");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setEmailChangeLoading(false);
    }
  }

  if (loading || !owner) return <SettingsSkeleton />;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 p-4">
      <h1 className="text-4xl font-black tracking-tight">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* LEFT: PROFILE PHOTO CARD */}
        <Card className="md:col-span-1 border-none shadow-xl bg-card overflow-hidden">
          <div className="h-2 bg-primary w-full" />
          <CardContent className="pt-8 flex flex-col items-center">
            <div className="relative group">
              <div className="h-32 w-32 rounded-3xl bg-muted flex items-center justify-center text-4xl font-bold text-primary border-4 border-background shadow-2xl overflow-hidden">
                {profilePreview
                  ? <img src={profilePreview} alt="Profile" className="h-full w-full object-cover" />
                  : (owner?.full_name?.[0] || "A")}
              </div>
              <label
                className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-xl shadow-lg cursor-pointer hover:scale-110 transition-transform border-4 border-background"
                aria-label="Upload profile photo"
              >
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  name="profileFile"
                  form="settings-form"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleImagePreview(e, "profile")}
                />
              </label>
              {profilePreview && (
                <button
                  type="button"
                  onClick={() => markForRemoval('profile')}
                  className="absolute -top-2 -right-2 p-1 bg-destructive text-white rounded-full shadow-md"
                  aria-label="Remove profile photo"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <h3 className="mt-4 font-bold text-xl">{owner?.full_name}</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black">Property Owner</p>
          </CardContent>
        </Card>

        {/* RIGHT: FORMS */}
        <div className="md:col-span-2 space-y-6">
          <form id="settings-form" onSubmit={handleSave} className="space-y-6">

            <Card className="border-none shadow-lg bg-card">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Admin Profile</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Landlord Name</Label>
                  <Input name="fullName" defaultValue={owner?.full_name} required />
                </div>
                <div className="grid gap-2">
                  <Label>Phone Number</Label>
                  <Input name="phone" defaultValue={owner?.phone} placeholder="9876543210" />
                </div>
                <div className="grid gap-2">
                  <Label>UPI ID</Label>
                  <Input name="upiId" defaultValue={owner?.upi_id} placeholder="9876543210@upi" />
                </div>
              </CardContent>
            </Card>

            {/* QR CODE UPLOAD */}
            <Card className="border-none shadow-lg bg-card">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><QrCode className="h-5 w-5 text-primary" /> Payment QR Code</CardTitle></CardHeader>
              <CardContent className="flex items-center gap-6">
                <div className="h-28 w-28 border-2 border-dashed rounded-2xl flex items-center justify-center bg-muted overflow-hidden relative group shrink-0">
                  {qrPreview
                    ? <img src={qrPreview} alt="QR Code" className="h-full w-full object-contain p-2" />
                    : <QrCode className="h-10 w-10 text-muted-foreground/20" />}
                  <label
                    className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-[10px] font-black tracking-tighter"
                    aria-label="Upload QR code"
                  >
                    UPLOAD QR
                    <input
                      type="file"
                      name="qrFile"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImagePreview(e, "qr")}
                    />
                  </label>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-bold">UPI QR Code</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">Preview shows instantly. Click "Save Settings" to upload.</p>
                  {qrPreview && (
                    <Button
                      variant="link"
                      size="sm"
                      type="button"
                      onClick={() => markForRemoval('qr')}
                      className="p-0 h-auto text-destructive text-xs"
                    >
                      Remove QR
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* APPEARANCE */}
            <Card className="border-none shadow-lg bg-card">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Sun className="h-5 w-5 text-primary" /> Appearance</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Night Mode</Label>
                  <Switch checked={theme === "dark"} onCheckedChange={(val) => setTheme(val ? "dark" : "light")} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label className="text-base">Hindi Language</Label>
                  <Switch checked={lang === "hi"} onCheckedChange={(val) => setLang(val ? "hi" : "en")} />
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full h-14 text-lg font-black shadow-xl shadow-primary/20 transition-all active:scale-95" disabled={saving}>
              {saving && <Loader2 className="animate-spin mr-2" />}
              {saving ? "SAVING..." : "SAVE SETTINGS"}
            </Button>
          </form>

          {/* SECURITY */}
          <Card className="border-none shadow-lg bg-card">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Lock className="h-5 w-5 text-primary" /> Security</CardTitle></CardHeader>
            <CardContent>
              <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full gap-2 font-bold h-12">
                    <Lock className="h-4 w-4" /> Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Change Password</DialogTitle></DialogHeader>
                  <form onSubmit={handlePasswordChange} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" name="currentPassword" type="password" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" name="newPassword" type="password" required minLength={8} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} />
                    </div>
                    <Button type="submit" className="w-full" disabled={changingPassword}>
                      {changingPassword && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                      Update Password
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* ACCOUNT SECURITY: EMAIL CHANGE */}
          <Card className="glass-card border-none shadow-lg overflow-hidden">
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-lg flex items-center gap-2"><Mail className="h-5 w-5 text-primary" /> Account Security</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">Email Address</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                {!isEmailChanging && (
                  <Button variant="outline" size="sm" className="rounded-xl font-bold" onClick={() => setIsEmailChanging(true)}>
                    Change Email
                  </Button>
                )}
              </div>

              {isEmailChanging && (
                <div className="p-4 bg-muted/30 rounded-[24px] space-y-4 border border-border/50">
                  {!otpSent ? (
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-muted-foreground">A verification code will be sent to your current email address.</p>
                      <Button size="sm" className="w-full rounded-xl font-bold" onClick={handleStartEmailChange} disabled={emailChangeLoading}>
                        {emailChangeLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                        Request Verification Code
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setIsEmailChanging(false)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Input
                        placeholder="6-digit code"
                        className="h-11 rounded-xl"
                        maxLength={6}
                        value={otpToken}
                        onChange={(e) => setOtpToken(e.target.value)}
                      />
                      <Input
                        placeholder="New Email Address"
                        type="email"
                        className="h-11 rounded-xl"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                      />
                      <Button className="w-full rounded-xl font-bold" onClick={handleConfirmEmailChange} disabled={emailChangeLoading}>
                        {emailChangeLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                        Verify &amp; Update Email
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => { setIsEmailChanging(false); setOtpSent(false); setOtpToken(""); setNewEmail(""); }}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
