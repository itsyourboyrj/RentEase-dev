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
    Occupied: "bg-indigo-500 text-white shadow-indigo-100",
    Booked: "bg-amber-400 text-amber-950 shadow-amber-100",
    Vacant: "bg-emerald-500 text-white shadow-emerald-100",
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
          "glass-card relative rounded-[32px] p-6 transition-all duration-500 hover:scale-[1.02] group cursor-pointer border-white/50",
          isOccupied ? "bg-white/60 shadow-xl" : "bg-slate-50/30 border-dashed"
        )}
      >
        <div className="flex justify-between items-center mb-6">
          <div className={cn(
            "h-12 w-12 rounded-2xl flex items-center justify-center text-lg font-black shadow-inner border",
            isOccupied ? "bg-primary/10 text-primary border-primary/10" : "bg-slate-100 text-slate-400 border-slate-200"
          )}>
            {(flat.flat_code ?? '').replace(/\D/g, '') || flat.flat_code?.[0] ?? ''}
          </div>

          {/* ACTIONS WRAPPER (Stops the card from opening when clicking icons) */}
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <EditStatusModal flat={flat} />
            <DeleteButton table="flats" id={flat.id} label={`Flat ${flat.flat_code}`} />
          </div>
        </div>

        <div className="space-y-1 mb-6">
          <h3 className="text-xl font-black tracking-tighter">{flat.flat_code}</h3>
          <Badge className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border-none", statusConfig[flat.status || 'Vacant'])}>
            {flat.status || 'Vacant'}
          </Badge>
        </div>

        {tenant ? (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/40 border border-white/60">
            <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-white shadow-sm">
              {tenant.profile_url ? <img src={tenant.profile_url} className="object-cover h-full w-full" alt={tenant.name} /> : <div className="h-full w-full bg-primary flex items-center justify-center text-[10px] text-white font-black">{tenant.name[0]}</div>}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">{tenant.name}</p>
              <p className="text-[10px] text-slate-400 font-medium italic">Active Resident</p>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-[10px] uppercase font-black text-slate-300 tracking-tighter italic">Ready for Onboarding</p>
          </div>
        )}
      </div>

      {/* RE-DESIGNED AESTHETIC VIEW MODAL */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-none bg-slate-50/80 backdrop-blur-2xl rounded-[40px] shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>{flat.flat_code} — {flat.buildings?.name ?? 'Unknown building'}</DialogTitle>
          </DialogHeader>

          {/* HERO HEADER */}
          <div className={cn(
            "h-48 p-8 flex items-end relative overflow-hidden",
            flat.status === 'Occupied' ? "bg-gradient-to-br from-indigo-600 to-purple-700" :
            flat.status === 'Booked' ? "bg-gradient-to-br from-amber-400 to-orange-500" :
            "bg-gradient-to-br from-emerald-500 to-teal-600"
          )}>
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="z-10 flex items-center gap-6 text-white">
              <div className="h-20 w-20 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl font-black shadow-2xl">
                {flat.flat_code}
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tighter">{flat.buildings?.name ?? 'Unknown building'}</h2>
                <p className="opacity-80 font-bold uppercase text-[10px] tracking-[0.2em]">Building Unit Details</p>
              </div>
            </div>
          </div>

          <ScrollArea className="max-h-[60vh] p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* SECTION: FLAT DETAILS */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Unit Configuration</h4>
                <div className="grid grid-cols-2 gap-4">
                  <InfoTile icon={IndianRupee} label="Monthly Rent" value={`₹${flat.rent_amount}`} />
                  <InfoTile icon={Building2} label="Floor No" value={flat.floor || "G"} />
                </div>
              </div>

              {/* SECTION: RESIDENT PROFILE (If Occupied) */}
              {tenant ? (
                <div className="space-y-6 md:col-span-2">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-slate-200" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Resident Profile</h4>
                    <div className="h-px flex-1 bg-slate-200" />
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
                    <p className="text-[10px] font-black uppercase text-slate-400">Attached Documents</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {tenant.documents?.length > 0 ? (
                        tenant.documents.map((doc: any) => (
                          <a key={doc.id} href={doc.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200 hover:border-primary transition-colors group">
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
                <div className="md:col-span-2 py-10 flex flex-col items-center justify-center text-center bg-white/40 rounded-[32px] border border-dashed border-slate-300">
                  <Zap className="h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">This Unit is Available</p>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-8 bg-white/50 border-t border-white flex justify-end">
            <Button onClick={() => setIsViewOpen(false)} className="rounded-2xl px-8 font-black">CLOSE</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function InfoTile({ icon: Icon, label, value }: any) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="h-3 w-3" />
        <p className="text-[9px] font-black uppercase tracking-widest">{label}</p>
      </div>
      <p className="text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}
