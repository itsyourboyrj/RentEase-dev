"use client";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building2, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

export function BulkBillingPicker({ buildings }: { buildings: any[] }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-2xl font-bold h-11 border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 shadow-sm transition-all active:scale-95">
          <Zap className="mr-2 h-4 w-4 fill-amber-400" /> Fast Billing
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[32px] border-none glass-card p-0 overflow-hidden max-w-sm">
        <div className="bg-amber-400 p-6 text-amber-950">
           <DialogTitle className="text-2xl font-black italic tracking-tighter">Fast Mode</DialogTitle>
           <DialogDescription className="text-xs font-bold opacity-70 uppercase tracking-widest text-amber-950">Select Building to generate</DialogDescription>
        </div>
        <div className="p-6 space-y-3">
          {buildings.map((b) => (
            <Button key={b.id} asChild variant="ghost" className="w-full justify-between h-14 rounded-2xl bg-slate-50 hover:bg-amber-50 hover:text-amber-700 group transition-all mb-2">
              <Link href={`/billing/bulk?buildingId=${b.id}`}>
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-slate-400 group-hover:text-amber-500" />
                  <span className="font-bold">{b.name}</span>
                </div>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </Link>
            </Button>
          ))}
          <Button asChild variant="outline" className="w-full h-12 rounded-2xl border-dashed font-bold">
            <Link href="/billing/bulk">Bill All Buildings</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
