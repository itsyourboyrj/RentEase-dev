"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IndianRupee, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { recordPayment } from "@/app/billing/actions";
import { toast } from "sonner";

export function RecordPaymentModal({ bill }: { bill: any }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(bill.total_amount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAmount(bill.total_amount);
  }, [bill.id]);

  const balance = bill.total_amount - amount;

  async function handlePayment() {
    setLoading(true);
    try {
      await recordPayment(bill.id, amount);
      toast.success("Payment recorded!");
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.message || String(err) || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
          Record Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl max-w-sm rounded-3xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        <div className="bg-emerald-50/80 dark:bg-emerald-950/30 p-6 text-foreground text-center border-b border-border/70">
          <div className="h-11 w-11 mx-auto mb-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-200 flex items-center justify-center">
            <IndianRupee className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight">Record payment</h2>
          <p className="text-muted-foreground text-sm">For {bill.tenants?.name}</p>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Amount received</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-muted-foreground">₹</span>
              <Input
                type="number"
                value={amount}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setAmount(Number.isFinite(val) ? val : 0);
                }}
                className="h-12 pl-8 text-xl font-semibold bg-background focus-visible:ring-emerald-500"
              />
            </div>
          </div>

          <div className={`p-4 rounded-xl flex items-center gap-3 ${balance <= 0 ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200' : 'bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200'}`}>
            {balance <= 0
              ? <CheckCircle2 className="h-5 w-5 shrink-0" />
              : <AlertCircle className="h-5 w-5 shrink-0" />
            }
            <div className="text-sm font-medium">
              {balance <= 0
                ? "Full Payment Received"
                : `Partial Payment (Pending: ₹${balance.toLocaleString('en-IN')})`
              }
            </div>
          </div>

          <Button
            onClick={handlePayment}
            disabled={loading || amount <= 0}
            className="w-full h-12 bg-emerald-700 hover:bg-emerald-800 shadow-sm shadow-emerald-200/60 text-base font-medium rounded-xl"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Confirm & Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
