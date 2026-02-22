"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogOut } from "lucide-react";
import { checkoutTenant } from "@/app/tenants/actions";
import { toast } from "sonner";

export function CheckoutModal({ tenant }: { tenant: any }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [finalReading, setFinalReading] = useState(0);

  async function handleCheckout() {
    if (!Number.isFinite(finalReading) || finalReading <= 0) {
      toast.error("Please enter a valid final meter reading greater than zero.");
      return;
    }
    setLoading(true);
    try {
      await checkoutTenant(tenant.id, tenant.flat_id, finalReading);
      toast.success("Tenant checked out. Flat is now Vacant.");
      setOpen(false);
      window.location.reload();
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="shadow-lg">
          <LogOut className="mr-2 h-4 w-4" /> Check Out
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Final Settlement</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm font-medium">
            Are you sure? This will mark the tenant as inactive and make the flat vacant for new residents.
          </div>

          <div className="space-y-2">
            <Label>Final Meter Reading</Label>
            <Input
              type="number"
              placeholder="Enter last reading"
              onChange={(e) => setFinalReading(Number(e.target.value))}
            />
          </div>

          <div className="p-4 bg-muted rounded-lg text-sm">
            <p>Security Deposit to Refund: <strong>₹{tenant.security_deposit ?? 0}</strong></p>
          </div>

          <Button
            onClick={handleCheckout}
            className="w-full"
            variant="destructive"
            disabled={loading}
          >
            {loading ? "Processing..." : "Confirm Check-Out"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
