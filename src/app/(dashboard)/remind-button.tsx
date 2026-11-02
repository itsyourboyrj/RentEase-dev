"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Bill {
  tenants?: { name?: string; phone?: string } | null;
  billing_month?: string | null;
  remaining_balance?: number | null;
  paid_amount?: number | null;
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
    const remainingBalance = Number(bill.remaining_balance);
    const amount = remainingBalance > 0
      ? remainingBalance
      : Math.max(0, Number(bill.total_amount ?? 0) - Number(bill.paid_amount ?? 0));
    const formattedAmount = amount.toLocaleString("en-IN");

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
      `Hi, this is a reminder for ${tenantName}: your payment of *₹${formattedAmount}* for ${month} is pending.\n` +
      `नमस्ते ${tenantName}, यह एक रिमाइंडर है कि ${month} के लिए आपका *₹${formattedAmount}* का भुगतान बाकी है।\n\n` +
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
