"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User, MapPin, Briefcase,
  Users2, Heart, FileText, Smartphone,
  Zap, IndianRupee, ShieldCheck, Building2
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EditStatusModal } from "@/components/flats/edit-status-modal";
import { DeleteButton } from "@/components/shared/delete-button";
import { cn } from "@/lib/utils";

export function FlatCard({ flat, tenant }: { flat: any; tenant: any }) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const isOccupied = flat.status === 'Occupied';

  const statusConfig: any = {
    Occupied: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-200",
    Booked: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200",
    Vacant: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200",
  };

  return (
    <>
      {/* THE CARD DIV (Clickable but stops bubbling for buttons) */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsViewOpen(true)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsViewOpen(true); } }}
        className={cn(
          "glass-card relative rounded-2xl p-5 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isOccupied ? "" : "border-dashed bg-white/40 dark:bg-slate-900/50"
        )}
      >
        <div className="flex justify-between items-center mb-6">
          <div className={cn(
            "h-11 w-11 rounded-xl flex items-center justify-center text-base font-semibold border",
            isOccupied ? "bg-primary/10 text-primary border-primary/10" : "bg-muted text-muted-foreground border-border"
          )}>
            {(flat.flat_code ?? '').replace(/\D/g, '') || (flat.flat_code?.[0] ?? '')}
          </div>

          {/* ACTIONS WRAPPER (Stops the card from opening when clicking icons) */}
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <EditStatusModal flat={flat} />
            <DeleteButton table="flats" id={flat.id} label={`Flat ${flat.flat_code}`} />
          </div>
        </div>

        <div className="space-y-1 mb-6">
          <h3 className="text-lg font-semibold tracking-tight">{flat.flat_code}</h3>
          <Badge className={cn("text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 border-none", statusConfig[flat.status || 'Vacant'])}>
            {flat.status || 'Vacant'}
          </Badge>
        </div>

        {tenant ? (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/65 dark:bg-slate-950/45 border border-border/70">
            <div className="h-9 w-9 rounded-full overflow-hidden border border-border">
              {tenant.profile_url ? <img src={tenant.profile_url} className="object-cover h-full w-full" alt={tenant.name} /> : <div className="h-full w-full bg-primary flex items-center justify-center text-[10px] text-white font-black">{tenant.name[0]}</div>}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">{tenant.name}</p>
              <p className="text-xs text-muted-foreground">Active resident</p>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-xs text-muted-foreground">Ready for a new resident</p>
          </div>
        )}
      </div>

      {/* RE-DESIGNED AESTHETIC VIEW MODAL */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>{flat.flat_code} — {flat.buildings?.name ?? 'Unknown building'}</DialogTitle>
          </DialogHeader>

          {/* HERO HEADER */}
          <div className="flex items-center gap-4 border-b border-border bg-primary/[0.04] p-6">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/10 flex items-center justify-center text-xl font-semibold text-primary">
                {flat.flat_code}
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight">{flat.buildings?.name ?? 'Unknown building'}</h2>
              <p className="text-sm text-muted-foreground">Unit details · {flat.status || 'Vacant'}</p>
            </div>
          </div>

          <ScrollArea className="max-h-[60vh] p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* SECTION: FLAT DETAILS */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Unit details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <InfoTile icon={IndianRupee} label="Monthly Rent" value={`₹${flat.rent_amount}`} />
                  <InfoTile icon={Building2} label="Floor No" value={flat.floor || "G"} />
                </div>
              </div>

              {/* SECTION: RESIDENT PROFILE (If Occupied) */}
              {tenant ? (
                <div className="space-y-6 md:col-span-2">
                  <div className="flex items-center gap-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Resident profile</h4>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                    <InfoTile icon={User} label="Full Name" value={tenant.name} />
                    <InfoTile icon={Smartphone} label="Primary Phone" value={tenant.phone} />
                    <InfoTile icon={ShieldCheck} label="Aadhar No" value={tenant.aadhar_number || "Not Provided"} />
                    <InfoTile icon={Briefcase} label="Employment" value={tenant.employment_status || "N/A"} />
                    <InfoTile icon={Heart} label="Marital Status" value={tenant.marital_status || "N/A"} />
                    <InfoTile icon={Users2} label="Occupants" value={`${tenant.occupancy_count} Person(s)`} />
                    <div className="col-span-full">
                      <InfoTile icon={MapPin} label="Permanent Address" value={tenant.address || "No address on file"} />
                    </div>
                  </div>

                  {/* DOCUMENTS SUB-SECTION */}
                  <div className="space-y-3 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Attached documents</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {tenant.documents?.length > 0 ? (
                        tenant.documents.map((doc: any) => (
                          <a key={doc.id} href={doc.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary transition-colors group">
                            <FileText className="h-5 w-5 text-primary" />
                            <span className="text-xs font-bold truncate group-hover:text-primary">{doc.name}</span>
                          </a>
                        ))
                      ) : (
                        <p className="text-xs italic text-slate-400">No KYC documents uploaded.</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="md:col-span-2 py-10 flex flex-col items-center justify-center text-center bg-muted/40 rounded-2xl border border-dashed border-border">
                  <Zap className="h-7 w-7 text-muted-foreground/60 mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">This unit is available</p>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-5 bg-background border-t border-border flex justify-end">
            <Button onClick={() => setIsViewOpen(false)} className="rounded-xl px-6 font-medium">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function InfoTile({ icon: Icon, label, value }: any) {
  return (
    <div className="space-y-1.5 rounded-xl border border-border/70 bg-card/60 p-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3 w-3" />
        <p className="text-[10px] font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
