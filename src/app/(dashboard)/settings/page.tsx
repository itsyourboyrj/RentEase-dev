"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/components/language-provider";
import { createClient } from "@/lib/supabase/client";
import { updateOwnerSettings, removeOwnerFile, updatePassword } from "@/app/settings/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, Camera, Sun, Lock, QrCode, Loader2, X } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useLanguage();
  const supabase = createClient();

  const [owner, setOwner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // Instant preview states
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);

  // Deferred removals — applied on save, not immediately
  const [pendingRemovals, setPendingRemovals] = useState<Set<'profile' | 'qr'>>(new Set());

  // Track blob URLs for cleanup
  const profileBlobRef = useRef<string | null>(null);
  const qrBlobRef = useRef<string | null>(null);

  useEffect(() => {
    async function getOwner() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase.from("owners").select("*").eq("id", user.id).single();
          setOwner(data);
          if (data?.profile_url) setProfilePreview(data.profile_url);
          if (data?.upi_qr_url) setQrPreview(data.upi_qr_url);
          if (data?.preferred_lang) setLang(data.preferred_lang);
        }
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }
    getOwner();

    return () => {
      // Revoke any blob URLs on unmount to free memory
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

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

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

        </div>
      </div>
    </div>
  );
}
