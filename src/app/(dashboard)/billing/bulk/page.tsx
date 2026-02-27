"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, Send } from "lucide-react";
import { bulkCreateBills } from "@/app/billing/actions";
import { toast } from "sonner";
import Link from "next/link";

export default function BulkBillingPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [readings, setReadings] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadTenants() {
      try {
        const { data, error } = await supabase
          .from("tenants")
          .select("*, flats(*, buildings(*)), bills(current_reading, created_at)")
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
          return {
            ...t,
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

  const readyCount = tenants.filter(t => readings[t.id] != null && readings[t.id] > t.last_reading).length;

  const handleBulkGenerate = async () => {
    const billsToCreate = tenants
      .filter(t => readings[t.id] && readings[t.id] > t.last_reading)
      .map(t => {
        const units = readings[t.id] - t.last_reading;
        const elecAmount = units * (t.flats?.buildings?.electricity_rate || 0);
        return {
          tenant_id: t.id,
          billing_month: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; })(),
          previous_reading: t.last_reading,
          current_reading: readings[t.id],
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
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/billing"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter">Fast Billing Mode</h1>
          <p className="text-muted-foreground text-sm">Enter current readings for all tenants at once</p>
        </div>
      </div>

      <div className="grid gap-4">
        {tenants.map((t) => (
          <Card key={t.id} className="border-none shadow-lg bg-gradient-to-r from-background to-primary/5 overflow-hidden">
            <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/20 shrink-0">
                  {t.flats?.flat_code}
                </div>
                <div>
                  <h3 className="font-bold">{t.name}</h3>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">{t.flats?.buildings?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-background/50 p-2 rounded-2xl border">
                <div className="px-4 border-r">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Previous</p>
                  <p className="text-lg font-black">{t.last_reading}</p>
                </div>
                <div className="px-2">
                  <p className="text-[10px] font-bold text-primary uppercase">Current Reading</p>
                  <Input
                    type="number"
                    placeholder="0.00"
                    onChange={(e) => handleReadingChange(t.id, e.target.value)}
                    className="h-10 w-32 border-none bg-primary/5 text-lg font-black focus-visible:ring-primary"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-50">
        <Button
          onClick={handleBulkGenerate}
          disabled={submitting || readyCount === 0}
          className="w-full h-16 rounded-3xl bg-gradient-to-r from-primary to-indigo-700 shadow-2xl shadow-primary/40 text-xl font-black transition-all hover:scale-[1.02] active:scale-95"
        >
          {submitting
            ? <><Loader2 className="animate-spin mr-3" /> GENERATING...</>
            : <><Send className="mr-3 h-6 w-6" /> GENERATE {readyCount} INVOICES</>
          }
        </Button>
      </div>
    </div>
  );
}
