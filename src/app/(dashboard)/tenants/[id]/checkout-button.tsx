"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { checkoutTenant } from "@/app/tenants/actions";
import { toast } from "sonner";

export function CheckoutButton({ tenantId, flatId }: { tenantId: string; flatId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCheckout() {
    setLoading(true);
    try {
      await checkoutTenant(tenantId, flatId, 0);
      toast.success("Tenant checked out successfully.");
      router.push("/tenants");
    } catch {
      toast.error("Check-out failed. Please try again.");
      setLoading(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Are you sure?</span>
        <Button
          size="sm"
          variant="destructive"
          disabled={loading}
          onClick={handleCheckout}
        >
          {loading ? "Checking out..." : "Yes, Check Out"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      className="text-destructive border-destructive hover:bg-destructive/10"
      onClick={() => setConfirming(true)}
    >
      Check Out Tenant
    </Button>
  );
}
