"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Phone, User, MapPin, FileText, Upload, Loader2, ArrowLeft, Trash2, Camera, X } from "lucide-react";
import { uploadDocument, updateProfilePicture, removeProfilePicture, deleteDocument } from "@/app/documents/actions";
import { toast } from "sonner";
import Link from "next/link";
import { CheckoutModal } from "./checkout-modal";

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
    const { data: t } = await supabase.from("tenants").select("*, flats(*, buildings(*))").eq("id", id).single();
    const { data: d } = await supabase.from("documents").select("*").eq("tenant_id", id);
    setTenant(t);
    setDocs(d || []);
    setLoading(false);
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
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleProfileUpdate(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return;
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    try {
      await updateProfilePicture(tenant.id, formData);
      toast.success("Profile picture updated!");
      fetchData();
    } catch (err) {
      toast.error("Update failed");
    }
  }

  async function handleDeleteDoc(docId: string, url: string) {
    if (!confirm("Delete this document?")) return;
    try {
      await deleteDocument(docId, url);
      toast.success("Document removed");
      fetchData();
    } catch (err) {
      toast.error("Delete failed");
    }
  }

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;
  if (!tenant) return <div className="p-10 text-muted-foreground">Tenant not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 p-4">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/tenants"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Tenants</Link>
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="h-24 w-24 rounded-2xl bg-primary text-white flex items-center justify-center text-3xl font-bold shadow-xl overflow-hidden border-4 border-background">
              {tenant.profile_url ? (
                <img src={tenant.profile_url} className="h-full w-full object-cover" alt={tenant.name} />
              ) : (
                tenant.name[0]
              )}
            </div>

            <label className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-lg shadow-lg cursor-pointer hover:scale-110 transition-transform">
              <Camera className="h-4 w-4" />
              <input type="file" className="hidden" onChange={handleProfileUpdate} accept="image/*" />
            </label>

            {tenant.profile_url && (
              <button
                onClick={() => removeProfilePicture(tenant.id).then(() => fetchData())}
                className="absolute -top-2 -right-2 p-1 bg-destructive text-white rounded-full shadow-lg"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-black">{tenant.name}</h1>
            <Badge variant={tenant.is_active ? "default" : "secondary"}>
              {tenant.is_active ? "Active" : "Checked Out"}
            </Badge>
          </div>
        </div>

        {tenant.is_active && <CheckoutModal tenant={tenant} />}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 shadow-lg border-none">
          <CardHeader><CardTitle className="text-lg">Personal Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-6 text-sm">
            <Detail label="Phone" value={tenant.phone} icon={Phone} />
            <Detail label="Permanent Address" value={tenant.address || "N/A"} icon={MapPin} />
            <Detail label="Emergency Contact" value={tenant.emergency_contact || "N/A"} icon={User} />
            <Detail label="Join Date" value={new Date(tenant.join_date).toLocaleDateString()} icon={FileText} />
          </CardContent>
        </Card>

        <Card className="shadow-lg border-none bg-primary/5">
          <CardHeader><CardTitle className="text-lg">Room Info</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between"><span>Building:</span><strong>{tenant.flats.buildings.name}</strong></div>
            <div className="flex justify-between"><span>Flat No:</span><strong>{tenant.flats.flat_code}</strong></div>
            <div className="flex justify-between"><span>Rent:</span><strong className="text-primary text-xl">₹{tenant.flats.rent_amount}</strong></div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-none">
        <CardHeader>
          <CardTitle className="text-lg">Identity Documents (Aadhaar/Agreement)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleFileUpload} className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-xl border-2 border-dashed">
            <input type="hidden" name="tenant_id" value={tenant.id} />
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold">Document Name</Label>
              <Input name="name" placeholder="e.g. Aadhaar Front" className="h-8" required />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold">File</Label>
              <Input name="file" type="file" className="h-8" required />
            </div>
            <Button type="submit" size="sm" className="self-end">
              <Upload className="h-4 w-4 mr-2" /> Upload
            </Button>
          </form>

          {docs.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {docs.map(doc => (
                <div key={doc.id} className="relative group p-4 border rounded-xl hover:bg-muted transition-colors text-center">
                  <button
                    onClick={() => handleDeleteDoc(doc.id, doc.file_url)}
                    className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <a href={doc.file_url} target="_blank">
                    <FileText className="h-8 w-8 mx-auto text-primary mb-2" />
                    <p className="text-xs font-bold truncate">{doc.name}</p>
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No documents uploaded yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Detail({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
        <Icon className="h-3 w-3" /> {label}
      </p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
