"use client";

import { Button } from "@/components/ui/button";

export function RemindButton({ tenant, bill, owner }: { tenant: any; bill: any; owner: any }) {
  function sendReminder() {
    const message =
      `*Payment Reminder / भुगतान अनुस्मारक*\n\n` +
      `Hi ${tenant.name}, this is a friendly reminder that your payment of *₹${bill.total_amount}* for ${bill.billing_month} is pending.\n\n` +
      `नमस्ते ${tenant.name}, यह एक रिमाइंडर है कि ${bill.billing_month} के लिए आपका *₹${bill.total_amount}* का भुगतान अभी बाकी है।\n\n` +
      `Please pay using UPI: *${owner?.upi_id}* or scan the QR in the invoice sent earlier.\n` +
      `कृपया UPI: *${owner?.upi_id}* या पहले भेजे गए चालान में QR का उपयोग करके भुगतान करें।\n\n` +
      `Ignore if already paid. / यदि पहले ही भुगतान कर दिया है तो अनदेखा करें।`;

    window.open(`https://wa.me/${tenant.phone}?text=${encodeURIComponent(message)}`);
  }

  return (
    <Button variant="outline" size="sm" onClick={sendReminder}>
      Remind
    </Button>
  );
}
