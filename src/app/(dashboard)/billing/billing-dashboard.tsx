"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BillingTable } from "./billing-table";
import { AdvanceModal } from "./advance-modal";
import { BulkBillingPicker } from "./bulk-picker";
import { NewBillModal } from "./new-bill-modal";
import { CollectionReportButton } from "./collection-report-button";

export function BillingDashboard({
  bills: initialBills,
  owner,
  tenants,
  buildings,
}: {
  bills: any[];
  owner: any;
  tenants: any[];
  buildings: any[];
}) {
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [search, setSearch] = useState("");

  const availableMonths = useMemo(() => {
    const months = initialBills.map((b: any) => b.billing_month as string);
    return Array.from(new Set(months)).sort().reverse();
  }, [initialBills]);

  // If current month has no bills, default to the latest available month
  const effectiveMonth = availableMonths.includes(selectedMonth)
    ? selectedMonth
    : availableMonths[0] ?? selectedMonth;

  const filteredBills = useMemo(() => {
    return initialBills.filter((b: any) => {
      const matchesMonth = b.billing_month === effectiveMonth;
      const matchesSearch = (b.tenants?.name ?? "")
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchesMonth && matchesSearch;
    });
  }, [initialBills, effectiveMonth, search]);

  const monthlyBills = useMemo(
    () => initialBills.filter((bill: any) => bill.billing_month === effectiveMonth),
    [initialBills, effectiveMonth]
  );

  const stats = useMemo(() => {
    const goal = filteredBills.reduce(
      (acc: number, b: any) => acc + Number(b.total_amount ?? 0),
      0
    );
    const collected = filteredBills.reduce(
      (acc: number, b: any) => acc + Number(b.paid_amount ?? 0),
      0
    );
    const remaining = Math.max(0, goal - collected);
    return { goal, collected, remaining };
  }, [filteredBills]);

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Billing</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-slate-500 font-medium">Viewing data for:</p>
            <select
              value={effectiveMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-primary/10 text-primary font-bold rounded-lg px-2 py-1 text-sm outline-none border-none cursor-pointer"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <CollectionReportButton bills={monthlyBills} billingMonth={effectiveMonth} />
          <AdvanceModal tenants={tenants} />
          <BulkBillingPicker buildings={buildings} />
          <NewBillModal tenants={tenants} owner={owner} />
        </div>
      </div>

      {/* SUMMARY CARDS (Month-Specific) */}
      {filteredBills.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-card border-none p-6 bg-primary/5 rounded-[32px]">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Monthly Goal
            </p>
            <p className="text-2xl font-black text-slate-700">
              ₹{stats.goal.toLocaleString("en-IN")}
            </p>
          </Card>
          <Card className="glass-card border-none p-6 bg-emerald-50 rounded-[32px]">
            <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">
              Collected
            </p>
            <p className="text-2xl font-black text-emerald-700">
              ₹{stats.collected.toLocaleString("en-IN")}
            </p>
          </Card>
          <Card className="glass-card border-none p-6 bg-red-50 rounded-[32px]">
            <p className="text-[10px] font-black uppercase text-red-600 tracking-widest">
              Remaining
            </p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-black text-red-700">
                ₹{stats.remaining.toLocaleString("en-IN")}
              </p>
              {stats.remaining === 0 && (
                <Badge className="bg-emerald-500">FULLY COLLECTED</Badge>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* SEARCH + TABLE */}
      {initialBills.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          No invoices yet. Use Fast Billing or create a single bill.
        </div>
      ) : (
        <div className="glass-card rounded-[32px] overflow-hidden p-6">
          <Input
            placeholder="Search tenant name..."
            className="mb-4 h-12 rounded-2xl border-none bg-slate-50 shadow-inner"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <BillingTable
            bills={filteredBills}
            owner={owner}
            buildings={buildings}
          />
        </div>
      )}
    </div>
  );
}
