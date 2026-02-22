"use client";

import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Phone, User, MapPin, Briefcase,
  Users2, Heart, FileText, Smartphone, DoorOpen
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function FlatCard({ flat, tenant }: { flat: any; tenant: any }) {
  const isOccupied = !!tenant;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className={`
          relative cursor-pointer group overflow-hidden rounded-2xl border p-5 transition-all
          ${isOccupied
            ? "bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-white/20 backdrop-blur-md shadow-xl"
            : "bg-muted/30 border-dashed border-muted-foreground/20"}
          hover:scale-[1.02] active:scale-[0.98]
        `}>
          {/* Background decorative blur */}
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl group-hover:bg-primary/20 transition-colors" />

          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-black tracking-tighter text-primary">
                {flat.flat_code}
              </h3>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                {flat.buildings.name}
              </p>
            </div>
            <Badge variant={isOccupied ? "default" : "outline"} className="text-[10px]">
              {isOccupied ? "OCCUPIED" : "VACANT"}
            </Badge>
          </div>

          {isOccupied ? (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-purple-400 flex items-center justify-center text-white font-bold shadow-lg overflow-hidden border-2 border-white/20">
                {tenant.profile_url ? (
                  <img src={tenant.profile_url} className="h-full w-full object-cover" alt={tenant.name} />
                ) : (
                  tenant.name[0]
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{tenant.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Smartphone className="h-3 w-3" /> {tenant.phone}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-muted-foreground/40">
              <p className="text-xs font-medium italic">Available for Rent</p>
            </div>
          )}
        </div>
      </DialogTrigger>

      {/* Detailed modal */}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none bg-white/90 backdrop-blur-xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{flat.flat_code} — {flat.buildings.name}</DialogTitle>
        </DialogHeader>

        <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex items-end shrink-0">
          <div className="flex items-center gap-4 text-white">
            <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-bold border border-white/30">
              {flat.flat_code}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{flat.buildings.name}</h2>
              <p className="text-white/80 text-sm">Monthly Rent: ₹{flat.rent_amount}</p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-6">
          {isOccupied ? (
            <div className="space-y-8">
              <section>
                <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-4">Tenant Profile</h4>
                <div className="grid grid-cols-2 gap-6">
                  <DetailItem icon={User} label="Full Name" value={tenant.name} />
                  <DetailItem icon={Phone} label="Contact" value={tenant.phone} />
                  <DetailItem icon={Briefcase} label="Employment" value={tenant.employment_status || "Not Specified"} />
                  <DetailItem icon={Users2} label="Occupants" value={`${tenant.occupancy_count ?? 1} Person(s)`} />
                  <DetailItem icon={MapPin} label="Permanent Address" value={tenant.address || "N/A"} />
                  <DetailItem icon={Heart} label="Marital Status" value={tenant.marital_status || "N/A"} />
                </div>
              </section>

              <section>
                <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-4">Verified Documents</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tenant.documents?.length > 0 ? (
                    tenant.documents.map((doc: any) => (
                      <a
                        key={doc.id}
                        href={doc.file_url}
                        target="_blank"
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border hover:bg-muted transition-colors"
                      >
                        <FileText className="h-5 w-5 text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate">{doc.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">Click to view</p>
                        </div>
                      </a>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No documents attached.</p>
                  )}
                </div>
              </section>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <DoorOpen className="h-12 w-12 text-muted-foreground/20 mb-4" />
              <p className="font-bold">This flat is currently vacant.</p>
              <p className="text-sm text-muted-foreground">Go to the Tenants tab to onboard someone new.</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function DetailItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 p-2 rounded-lg bg-primary/5 text-primary shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
