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
          <h1 className="text-3xl font-semibold tracking-tight">Billing</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-muted-foreground">Viewing data for</p>
            <select
              value={effectiveMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white/75 dark:bg-slate-900/70 text-foreground font-medium rounded-lg px-3 py-1.5 text-sm outline-none border border-border cursor-pointer focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap">
          <CollectionReportButton bills={monthlyBills} billingMonth={effectiveMonth} />
          <AdvanceModal tenants={tenants} />
          <BulkBillingPicker buildings={buildings} />
          <NewBillModal tenants={tenants} owner={owner} />
        </div>
      </div>

      {/* SUMMARY CARDS (Month-Specific) */}
      {filteredBills.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-card rounded-2xl p-5 bg-primary/[0.04]">
            <p className="text-xs font-medium uppercase text-muted-foreground tracking-wide">
              Monthly Goal
            </p>
            <p className="text-2xl font-semibold tracking-tight text-foreground">
              ₹{stats.goal.toLocaleString("en-IN")}
            </p>
          </Card>
          <Card className="glass-card rounded-2xl p-5 bg-emerald-50/70 dark:bg-emerald-950/20">
            <p className="text-xs font-medium uppercase text-emerald-700 dark:text-emerald-300 tracking-wide">
              Collected
            </p>
            <p className="text-2xl font-semibold tracking-tight text-emerald-800 dark:text-emerald-200">
              ₹{stats.collected.toLocaleString("en-IN")}
            </p>
          </Card>
          <Card className="glass-card rounded-2xl p-5 bg-rose-50/70 dark:bg-rose-950/20">
            <p className="text-xs font-medium uppercase text-rose-700 dark:text-rose-300 tracking-wide">
              Remaining
            </p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-semibold tracking-tight text-rose-800 dark:text-rose-200">
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
        <div className="glass-card rounded-2xl overflow-hidden p-4 sm:p-5">
          <Input
            placeholder="Search tenant name..."
            className="mb-4 h-11 rounded-xl bg-background/80 shadow-none"
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
