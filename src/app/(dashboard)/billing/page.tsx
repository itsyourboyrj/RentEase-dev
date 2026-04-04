import { createClient } from "@/lib/supabase/server";
import { NewBillModal } from "./new-bill-modal";
import { AdvanceModal } from "./advance-modal";
import { BulkBillingPicker } from "./bulk-picker";
import { SendReportButton } from "./send-report-button";
import { BillingTable } from "./billing-table";
import { BoutiqueEmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt } from "lucide-react";

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div>Unauthorized</div>;

  const { data: owner } = await supabase.from("owners").select("*").eq("id", user.id).maybeSingle();

  const { data: bills } = await supabase
    .from("bills")
    .select(`*, tenants (*, flats (*, buildings (*)))`)
    .order("created_at", { ascending: false });

  const { data: tenants } = await supabase.from("tenants").select("*, flats(*, buildings(*))").eq("is_active", true);
  const { data: buildings } = await supabase.from("buildings").select("id, name");

  const totalBilled = bills?.reduce((acc, b) => acc + (Number(b.total_amount) || 0), 0) || 0;
  const totalCollected = bills?.reduce((acc, b) => acc + (Number(b.paid_amount) || 0), 0) || 0;
  const totalOutstanding = totalBilled - totalCollected;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Billing</h1>
          <p className="text-slate-500 font-medium italic">Manage invoices and collections</p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <AdvanceModal tenants={tenants || []} />
          <BulkBillingPicker buildings={buildings || []} />
          <NewBillModal tenants={tenants || []} owner={owner} />
        </div>
      </div>

      {/* COLLECTION DASHBOARD */}
      {bills && bills.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass-card border-none p-6 bg-primary/5 rounded-[32px]">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Goal</p>
              <p className="text-2xl font-black text-slate-700">₹{totalBilled.toLocaleString()}</p>
            </Card>
            <Card className="glass-card border-none p-6 bg-emerald-50 rounded-[32px]">
              <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Collected</p>
              <p className="text-2xl font-black text-emerald-700">₹{totalCollected.toLocaleString()}</p>
            </Card>
            <Card className="glass-card border-none p-6 bg-red-50 rounded-[32px]">
              <p className="text-[10px] font-black uppercase text-red-600 tracking-widest">Remaining</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-black text-red-700">₹{totalOutstanding.toLocaleString()}</p>
                {totalOutstanding === 0 && <Badge className="bg-emerald-500">FULLY COLLECTED</Badge>}
              </div>
            </Card>
          </div>
          <div className="flex justify-end">
            <SendReportButton
              bills={bills}
              owner={owner}
              totalBilled={totalBilled}
              totalCollected={totalCollected}
              totalOutstanding={totalOutstanding}
            />
          </div>
        </div>
      )}

      {!bills || bills.length === 0 ? (
        <BoutiqueEmptyState
          icon={Receipt}
          title="No Invoices Yet"
          description="Generate your first invoice using Fast Billing Mode or create a single bill for a tenant."
          buttonText="Fast Billing"
          href="/billing/bulk"
        />
      ) : (
        <BillingTable bills={bills} owner={owner} buildings={buildings || []} />
      )}
    </div>
  );
}
