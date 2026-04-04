"use client";

import { Button } from "@/components/ui/button";

export function SendReportButton({ bills, owner, totalBilled, totalCollected, totalOutstanding }: {
  bills: any[];
  owner: any;
  totalBilled: number;
  totalCollected: number;
  totalOutstanding: number;
}) {
  const sendReport = () => {
    const phone = (owner?.phone ?? '').replace(/\D/g, '');
    if (!phone) {
      console.warn('Owner phone is missing or invalid');
      return;
    }

    const date = new Date().toLocaleDateString();
    const summary = bills.map(b =>
      `${b.tenants?.name ?? 'Unknown'} (${b.tenants?.flats?.flat_code ?? '-'}): ₹${b.remaining_balance ?? b.total_amount} [${b.status ?? (b.is_paid ? 'Paid' : 'Due')}]`
    ).join('\n');
    const text = `*RentEase Collection Report (${date})*\n\n*Total Goal:* ₹${totalBilled}\n*Collected:* ₹${totalCollected}\n*Pending:* ₹${totalOutstanding}\n\n*Breakdown:*\n${summary}`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`);
  };

  if (!owner?.phone) return null;

  return (
    <Button onClick={sendReport} variant="ghost" size="sm" className="rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-primary">
      Send Report to Me
    </Button>
  );
}
