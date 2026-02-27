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
      <DialogContent className="p-0 overflow-hidden border-none bg-white/90 backdrop-blur-xl max-w-sm">
        <DialogHeader className="sr-only">
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white text-center">
          <IndianRupee className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <h2 className="text-2xl font-black italic">Collection</h2>
          <p className="text-emerald-50 opacity-80 text-sm">Recording payment for {bill.tenants?.name}</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-xs uppercase font-bold text-muted-foreground">Amount Received</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">₹</span>
              <Input
                type="number"
                value={amount}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setAmount(Number.isFinite(val) ? val : 0);
                }}
                className="h-14 pl-8 text-2xl font-black bg-muted/30 border-none focus-visible:ring-emerald-500"
              />
            </div>
          </div>

          <div className={`p-4 rounded-2xl flex items-center gap-3 ${balance <= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
            {balance <= 0
              ? <CheckCircle2 className="h-5 w-5 shrink-0" />
              : <AlertCircle className="h-5 w-5 shrink-0" />
            }
            <div className="text-sm font-bold">
              {balance <= 0
                ? "Full Payment Received"
                : `Partial Payment (Pending: ₹${balance.toLocaleString('en-IN')})`
              }
            </div>
          </div>

          <Button
            onClick={handlePayment}
            disabled={loading || amount <= 0}
            className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-200 text-lg font-bold rounded-2xl"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Confirm & Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
