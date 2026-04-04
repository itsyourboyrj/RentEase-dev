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
        <Button variant="outline" className="rounded-2xl font-bold h-11 border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
          <Coins className="mr-2 h-4 w-4" /> Advance Pay
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 overflow-hidden border-none bg-white/90 backdrop-blur-xl max-w-sm rounded-[32px]">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 text-white text-center relative">
          <Sparkles className="absolute top-4 right-4 h-5 w-5 opacity-30 animate-pulse" />
          <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-2xl">
             <Coins className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tighter italic">Advance Entry</h2>
          <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest opacity-80">Pre-payment Credit</p>
        </div>

        <form action={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Select Resident</Label>
            <Select name="tenantId" required>
              <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-none shadow-inner font-medium">
                <SelectValue placeholder="Choose Tenant" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl">
                {tenants.map(t => (
                  <SelectItem key={t.id} value={String(t.id)} className="rounded-lg">
                    {t.name} ({t.flats?.flat_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Amount (₹)</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-300">₹</span>
              <Input
                name="amount"
                type="number"
                placeholder="5000"
                required
                min="1"
                step="1"
                className="h-14 pl-8 text-2xl font-black bg-slate-50 border-none rounded-2xl focus-visible:ring-indigo-500 shadow-inner"
              />
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
             <p className="text-[10px] leading-relaxed text-amber-700 font-bold">
               Note: This amount will be stored in the resident's wallet and automatically applied to reduce their next monthly bill.
             </p>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-[1.02] active:scale-95 transition-all rounded-2xl shadow-xl shadow-indigo-200 text-lg font-black">
            {loading ? <Loader2 className="animate-spin mr-2" /> : "ADD TO WALLET"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
