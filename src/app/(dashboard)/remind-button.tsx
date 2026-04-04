"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Bill {
  tenants?: { name?: string; phone?: string } | null;
  billing_month?: string | null;
  remaining_balance?: number | null;
  total_amount?: number | null;
}

export function RemindButton({ bill, ownerUpiId }: { bill: Bill; ownerUpiId?: string | null }) {
  const phone = (bill.tenants?.phone ?? '').replace(/\D/g, '');

  const handleRemind = () => {
    if (!phone) {
      toast.error("Tenant phone number is missing or invalid");
      return;
    }

    const tenantName = bill.tenants?.name ?? "Tenant";
    const month = bill.billing_month ?? "this month";
    const amount = Number(bill.remaining_balance ?? bill.total_amount ?? 0);

    let upiLine: string;
    if (ownerUpiId) {
      upiLine =
        `Please pay to: *${ownerUpiId}*\n` +
        `कृपया इस पर भुगतान करें: *${ownerUpiId}*`;
    } else {
      upiLine = `Please contact the owner for payment details.\nकृपया भुगतान विवरण के लिए मालिक से संपर्क करें।`;
    }

    const msg =
      `*Payment Reminder / भुगतान अनुस्मारक*\n\n` +
      `Hi ${tenantName}, your total due for ${month} is *₹${amount}*.\n` +
      `नमस्ते ${tenantName}, ${month} के लिए आपका कुल बकाया *₹${amount}* है।\n\n` +
      upiLine;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="rounded-xl font-bold text-primary hover:bg-primary/10"
      onClick={handleRemind}
      disabled={!phone}
    >
      Remind
    </Button>
  );
}
