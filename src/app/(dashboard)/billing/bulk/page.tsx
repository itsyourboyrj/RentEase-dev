"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, Send, Calendar, CheckCircle2 } from "lucide-react";
import { bulkCreateBills } from "@/app/billing/actions";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

function getLocalDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function BulkBillingPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [readings, setReadings] = useState<Record<string, number>>({});
  const [globalReadingDate, setGlobalReadingDate] = useState(getLocalDateString());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadTenants() {
      try {
        const currentMonth = getLocalDateString().slice(0, 7);

        const { data, error } = await supabase
          .from("tenants")
          .select("*, flats(*, buildings(*)), bills(current_reading, created_at, billing_month)")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Failed to load tenants:", error);
          toast.error("Failed to load tenants");
          return;
        }

        const formatted = (data ?? []).map(t => {
          const sorted = (t.bills || []).sort((a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          const hasBillThisMonth = (t.bills || []).some((b: any) => b.billing_month === currentMonth);
          return {
            ...t,
            hasBillThisMonth,
            last_reading: sorted[0]?.current_reading ?? (t as any).initial_meter_reading ?? 0,
          };
        });
        setTenants(formatted);
      } catch (err) {
        console.error("Failed to load tenants:", err);
        toast.error("Failed to load tenants");
      } finally {
        setLoading(false);
      }
    }
    loadTenants();
  }, []);

  const handleReadingChange = (id: string, val: string) => {
    const parsed = parseFloat(val);
    setReadings(prev => ({ ...prev, [id]: Number.isFinite(parsed) ? parsed : 0 }));
  };

  const readyCount = tenants.filter(t => !t.hasBillThisMonth && readings[t.id] != null && readings[t.id] > t.last_reading).length;

  const handleBulkGenerate = async () => {
    const billsToCreate = tenants
      .filter(t => !t.hasBillThisMonth && readings[t.id] && readings[t.id] > t.last_reading)
      .map(t => {
        const units = readings[t.id] - t.last_reading;
        const elecAmount = units * (t.flats?.buildings?.electricity_rate || 0);
        return {
          tenant_id: t.id,
          billing_month: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; })(),
          previous_reading: t.last_reading,
          current_reading: readings[t.id],
          current_reading_date: globalReadingDate || getLocalDateString(),
          electricity_amount: elecAmount,
          rent_amount: t.flats?.rent_amount || 0,
          total_amount: elecAmount + (t.flats?.rent_amount || 0),
          status: "Due",
          is_paid: false,
        };
      });

    if (billsToCreate.length === 0) {
      toast.error("No valid readings entered. Current reading must be greater than previous.");
      return;
    }

    setSubmitting(true);
    try {
      await bulkCreateBills(billsToCreate);
      toast.success(`${billsToCreate.length} invoices generated!`);
      window.location.href = "/billing";
    } catch (err: any) {
      toast.error(err.message || "Generation failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="p-10 flex justify-center">
      <Loader2 className="animate-spin text-primary" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 relative">

      {/* STICKY HEADER SECTION */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl pb-4 pt-2 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/70 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-xl" asChild>
            <Link href="/billing"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Fast billing</h1>
            <p className="text-sm text-muted-foreground">Generate monthly invoices</p>
          </div>
        </div>

        <Button
          onClick={handleBulkGenerate}
          disabled={submitting || readyCount === 0}
          className="rounded-xl shadow-sm shadow-primary/15 h-11 px-5 font-medium"
        >
          {submitting ? (
            <Loader2 className="animate-spin mr-2 h-5 w-5" />
          ) : (
            <Send className="mr-2 h-5 w-5" />
          )}
          {submitting ? "Generating…" : `Generate ${readyCount} invoices`}
        </Button>
      </div>

      {/* READING DATE SELECTOR */}
      <Card className="rounded-2xl p-5 mb-6 bg-primary/[0.04] border-primary/10 shadow-none">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <Label className="font-medium">Reading date</Label>
          </div>
          <Input
            type="date"
            value={globalReadingDate}
            onChange={(e) => setGlobalReadingDate(e.target.value)}
            className="w-full md:w-48 rounded-xl bg-background h-10"
          />
          <p className="text-sm text-muted-foreground">This date will appear on all generated invoices.</p>
        </div>
      </Card>

      {/* GRID OF TENANT CARDS */}
      <div className="grid gap-4">
        {tenants.length === 0 ? (
          <div className="surface-card py-16 text-center rounded-2xl border-dashed">
            <p className="text-muted-foreground">No active tenants found to bill.</p>
          </div>
        ) : (
          tenants.map((t) => (
            <Card
              key={t.id}
              className={cn(
                "rounded-2xl border border-border/80 shadow-sm transition-[box-shadow,transform] duration-200 ease-out overflow-hidden",
                t.hasBillThisMonth ? "bg-muted/50" : "bg-card hover:shadow-md"
              )}
            >
              <CardContent className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">

                {/* Left side: Property & Resident Info */}
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center text-lg font-semibold border",
                    t.hasBillThisMonth ? "bg-muted text-muted-foreground border-border" : "bg-primary/10 text-primary border-primary/10"
                  )}>
                    {t.flats?.flat_code?.replace(/\D/g, '') || t.flats?.flat_code?.[0]}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">{t.name}</h3>
                    <p className="text-xs text-muted-foreground">{t.flats?.buildings?.name}</p>
                  </div>
                </div>

                {/* Right side: Input logic */}
                <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-xl border border-border/70">
                  <div className="px-3 border-r border-border text-center">
                    <p className="text-[10px] font-medium text-muted-foreground">Last reading</p>
                    <p className="text-base font-semibold">{t.last_reading}</p>
                  </div>

                  <div className="px-4">
                    {t.hasBillThisMonth ? (
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-medium text-sm">
                        <CheckCircle2 className="h-4 w-4" /> Invoice ready
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <p className="text-[10px] font-medium text-muted-foreground mb-1">New reading</p>
                        <Input
                          type="number"
                          placeholder="0.00"
                          onChange={(e) => handleReadingChange(t.id, e.target.value)}
                          className="h-10 w-32 bg-background text-base font-medium rounded-xl focus-visible:ring-primary shadow-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
