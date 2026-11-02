"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Phone, User, MapPin, FileText, Upload, Loader2, ArrowLeft,
  Trash2, Camera, X, ShieldCheck, Briefcase, Users2, Zap, Heart,
  Mail, AlertCircle
} from "lucide-react";
import { uploadDocument, updateProfilePicture, removeProfilePicture, deleteDocument } from "@/app/documents/actions";
import { toast } from "sonner";
import Link from "next/link";
import { CheckoutModal } from "./checkout-modal";
import { EditTenantModal } from "./edit-tenant-modal";

export default function TenantProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <TenantProfileContent id={id} />;
}

function TenantProfileContent({ id }: { id: string }) {
  const [tenant, setTenant] = useState<any>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchData = async () => {
    try {
      const { data: t, error: tenantError } = await supabase
        .from("tenants")
        .select("*, flats(*, buildings(*))")
        .eq("id", id)
        .single();
      if (tenantError) {
        toast.error(`Failed to load tenant: ${tenantError.message}`);
        return;
      }
      const { data: d, error: docsError } = await supabase.from("documents").select("*").eq("tenant_id", id);
      if (docsError) {
        toast.error(`Failed to load documents: ${docsError.message}`);
        return;
      }
      setTenant(t);
      setDocs(d || []);
    } catch (err) {
      console.error("Unexpected error loading tenant data:", err);
      toast.error("Failed to load tenant data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  async function handleFileUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await uploadDocument(formData);
      toast.success("Document uploaded!");
      fetchData();
      (e.target as HTMLFormElement).reset();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  }

  async function handleProfileUpdate(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0] || !tenant) return;
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    try {
      await updateProfilePicture(tenant.id, formData);
      toast.success("Profile picture updated!");
      fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function handleDeleteDoc(docId: string, url: string) {
    if (!confirm("Delete this document?")) return;
    try {
      await deleteDocument(docId, url);
      toast.success("Document removed");
      fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;
  if (!tenant) return <div className="p-10 text-muted-foreground">Tenant not found.</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-xl" asChild>
          <Link href="/tenants"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <h1 className="text-3xl font-semibold tracking-tight">Resident profile</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">

        {/* LEFT COLUMN: IDENTITY CARD */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="glass-card rounded-2xl overflow-hidden shadow-sm gap-0">
            <div className="h-24 bg-gradient-to-br from-primary/15 via-primary/10 to-indigo-100/70 relative dark:to-indigo-950/50">
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                <div className="relative group">
                  <div className="h-20 w-20 rounded-full border-4 border-white shadow-md bg-slate-100 overflow-hidden">
                    {tenant.profile_url ? (
                      <img src={tenant.profile_url} className="h-full w-full object-cover" alt={tenant.name} />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-2xl font-semibold text-primary">
                        {tenant.name?.[0] ?? "?"}
                      </div>
                    )}
                  </div>

                  <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-md cursor-pointer hover:bg-primary/90 transition-colors" aria-label="Upload profile photo">
                    <Camera className="h-4 w-4" />
                    <input type="file" className="hidden" onChange={handleProfileUpdate} accept="image/*" />
                  </label>

                  {tenant.profile_url && (
                    <button
                      onClick={() =>
                        removeProfilePicture(tenant.id)
                          .then(() => fetchData())
                          .catch((err: unknown) => toast.error(err instanceof Error ? err.message : "Remove failed"))
                      }
                      className="absolute -top-2 -right-2 p-1 bg-destructive text-white rounded-full shadow-lg"
                      aria-label="Remove profile photo"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <CardContent className="pt-14 pb-6 text-center space-y-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">{tenant.name}</h2>
                <p className="text-sm text-muted-foreground">
                  Flat {tenant.flats?.flat_code}
                </p>
              </div>

              <div className="flex justify-center gap-2">
                <Badge variant={tenant.is_active ? "default" : "secondary"} className="rounded-full px-4">
                  {tenant.is_active ? "ACTIVE" : "CHECKED OUT"}
                </Badge>
              </div>

              <div className="pt-4 grid grid-cols-1 gap-3">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-700 bg-muted/70 p-3 rounded-xl">
                  <Phone className="h-4 w-4 text-primary" /> {tenant.phone}
                </div>
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-700 bg-muted/70 p-3 rounded-xl">
                  <Mail className="h-4 w-4 text-primary" /> {tenant.email || "No Email"}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FINANCIAL STATUS CARD */}
          <Card className="glass-card rounded-2xl p-5 bg-primary/[0.04]">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">Financial overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Monthly rent</span>
                <span className="text-base font-semibold text-primary">₹{tenant.flats?.rent_amount ?? "—"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Security deposit</span>
                <span className="text-base font-semibold text-foreground">₹{tenant.security_deposit ?? "—"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Building</span>
                <span className="text-sm font-medium">{tenant.flats?.buildings?.name ?? "N/A"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Join date</span>
                <span className="text-sm font-medium">{tenant.join_date ? new Date(tenant.join_date).toLocaleDateString() : "N/A"}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: KYC & DOCS */}
        <div className="lg:col-span-2 space-y-6">

          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold tracking-tight">Resident information</h3>
            <div className="flex gap-2">
              <EditTenantModal tenant={tenant} onSaved={fetchData} />
              {tenant.is_active && <CheckoutModal tenant={tenant} />}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoTile icon={ShieldCheck} label="Aadhar Number" value={maskAadhar(tenant.aadhar_number)} />
            <InfoTile icon={User} label="Gender" value={tenant.gender || "Not Specified"} />
            <InfoTile icon={Heart} label="Marital Status" value={tenant.marital_status || "Not Specified"} />
            <InfoTile icon={Briefcase} label="Employment" value={tenant.employment_status || "Not Specified"} />
            <InfoTile icon={Users2} label="Total Occupants" value={`${tenant.occupancy_count ?? 1} Person(s)`} />
            <InfoTile icon={Zap} label="Opening Meter" value={tenant.initial_meter_reading != null ? String(tenant.initial_meter_reading) : "0"} />
            <div className="md:col-span-2">
              <InfoTile icon={MapPin} label="Permanent Address" value={tenant.address || "No address on record"} />
            </div>
            <InfoTile icon={AlertCircle} label="Emergency Contact" value={tenant.emergency_contact || "N/A"} />
          </div>

          {/* DOCUMENTS SECTION */}
          <Card className="glass-card rounded-2xl p-5 sm:p-6">
            <CardHeader className="p-0 mb-6 flex flex-row justify-between items-center">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Documents
              </CardTitle>
            </CardHeader>

            <form onSubmit={handleFileUpload} className="flex flex-wrap gap-3 p-4 bg-muted/40 rounded-xl border border-dashed border-border mb-5">
              <input type="hidden" name="tenant_id" value={tenant.id} />
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold">Document Name</Label>
                <Input name="name" placeholder="e.g. Aadhaar Front" className="h-8" required />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold">File</Label>
                <Input name="file" type="file" className="h-8" required />
              </div>
              <Button type="submit" size="sm" className="self-end rounded-xl">
                <Upload className="h-4 w-4 mr-2" /> Upload
              </Button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {docs.length > 0 ? (
                docs.map((doc: any) => (
                  <div key={doc.id} className="relative group flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary transition-colors">
                    <button
                      onClick={() => handleDeleteDoc(doc.id, doc.file_url)}
                      className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Delete document"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">Open document</p>
                      </div>
                    </a>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-10 text-center border border-dashed border-border rounded-2xl bg-muted/30">
                  <p className="text-sm text-muted-foreground">No identity documents found.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}

function maskAadhar(aadhar: string | null | undefined): string {
  if (!aadhar) return "Not Provided";
  const digits = aadhar.replace(/\D/g, "");
  if (digits.length !== 12) return "Not Provided";
  return `XXXX-XXXX-${digits.slice(8)}`;
}

function InfoTile({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="p-4 rounded-2xl bg-card/80 border border-border/80 shadow-sm space-y-1.5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3 w-3" />
        <p className="text-[10px] font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
