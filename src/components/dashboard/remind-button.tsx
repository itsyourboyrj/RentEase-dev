"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function RemindButton({ tenant, bill, owner }: { tenant: any; bill: any; owner: any }) {
  function sendReminder() {
    if (!tenant?.phone) {
      toast.error("Tenant phone number is not available.");
      return;
    }

    const phone = tenant.phone.replace(/\D/g, '').replace(/^\+/, '');
    if (!phone) {
      toast.error("Invalid phone number.");
      return;
    }

    const upiLine = owner?.upi_id
      ? `Please pay using UPI: *${owner.upi_id}* or scan the QR in the invoice sent earlier.\nकृपया UPI: *${owner.upi_id}* या पहले भेजे गए चालान में QR का उपयोग करके भुगतान करें।`
      : `Please pay as discussed. / कृपया चर्चा के अनुसार भुगतान करें।`;

    const message =
      `*Payment Reminder / भुगतान अनुस्मारक*\n\n` +
      `Hi ${tenant.name}, this is a friendly reminder that your payment of *₹${bill.total_amount}* for ${bill.billing_month} is pending.\n\n` +
      `नमस्ते ${tenant.name}, यह एक रिमाइंडर है कि ${bill.billing_month} के लिए आपका *₹${bill.total_amount}* का भुगतान अभी बाकी है।\n\n` +
      `${upiLine}\n\n` +
      `Ignore if already paid. / यदि पहले ही भुगतान कर दिया है तो अनदेखा करें।`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
  }

  return (
    <Button variant="outline" size="sm" onClick={sendReminder}>
      Remind
    </Button>
  );
}
