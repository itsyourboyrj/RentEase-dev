"use client";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building2, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

export function BulkBillingPicker({ buildings }: { buildings: any[] }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl font-medium h-11 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 shadow-none">
          <Zap className="mr-2 h-4 w-4 fill-amber-400" /> Fast Billing
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl glass-card p-0 overflow-hidden max-w-sm">
        <div className="bg-amber-50/80 dark:bg-amber-950/30 p-6 text-foreground border-b border-border/70">
           <DialogTitle className="text-xl font-semibold tracking-tight">Fast billing</DialogTitle>
           <DialogDescription className="text-sm text-muted-foreground">Choose which properties to bill.</DialogDescription>
        </div>
        <div className="p-6 space-y-3">
          {buildings.map((b) => (
            <Button key={b.id} asChild variant="ghost" className="w-full justify-between h-12 rounded-xl bg-muted/60 hover:bg-amber-50 hover:text-amber-800 group mb-2">
              <Link href={`/billing/bulk?buildingId=${b.id}`}>
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-slate-400 group-hover:text-amber-500" />
                  <span className="font-medium">{b.name}</span>
                </div>
                <ArrowRight className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity duration-150" />
              </Link>
            </Button>
          ))}
          <Button asChild variant="outline" className="w-full h-11 rounded-xl border-dashed font-medium">
            <Link href="/billing/bulk">Bill All Buildings</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
