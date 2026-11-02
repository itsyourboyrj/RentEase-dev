"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coins, Loader2, Sparkles } from "lucide-react";
import { addAdvancePayment } from "@/app/billing/advance-actions";
import { toast } from "sonner";

export function AdvanceModal({ tenants }: { tenants: any[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const res = await addAdvancePayment(formData);
      if (res.success) {
        toast.success("Advance Payment Recorded! This will be deducted from their next bill.");
        setOpen(false);
      } else {
        toast.error("Failed to record advance payment");
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl font-medium h-11 border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white shadow-none">
          <Coins className="mr-2 h-4 w-4" /> Advance Pay
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl max-w-sm rounded-3xl">
        <div className="bg-primary/[0.06] p-6 text-foreground text-center border-b border-border/70">
          <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 text-primary">
             <Coins className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight">Record advance payment</h2>
          <p className="text-sm text-muted-foreground">Add credit for a resident</p>
        </div>

        <form action={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium ml-1">Select resident</Label>
            <Select name="tenantId" required>
              <SelectTrigger className="h-11 rounded-xl bg-background font-medium">
                <SelectValue placeholder="Choose Tenant" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {tenants.map(t => (
                  <SelectItem key={t.id} value={String(t.id)} className="rounded-lg">
                    {t.name} ({t.flats?.flat_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium ml-1">Amount (₹)</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-muted-foreground">₹</span>
              <Input
                name="amount"
                type="number"
                placeholder="5000"
                required
                min="1"
                step="1"
                className="h-12 pl-8 text-xl font-semibold bg-background rounded-xl focus-visible:ring-primary shadow-none"
              />
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-xl border border-amber-200/70 dark:border-amber-900/50">
             <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-200">
               Note: This amount will be stored in the resident's wallet and automatically applied to reduce their next monthly bill.
             </p>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl shadow-sm shadow-primary/15 font-medium">
            {loading ? <Loader2 className="animate-spin mr-2" /> : "Record payment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
