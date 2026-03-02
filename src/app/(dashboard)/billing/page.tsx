import { createClient } from "@/lib/supabase/server";
import { NewBillModal } from "./new-bill-modal";
import { BillingTable } from "./billing-table";
import { BoutiqueEmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Receipt, Zap } from "lucide-react";
import Link from "next/link";

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

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Billing</h1>
          <p className="text-slate-500 font-medium italic">Manage invoices and collections</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-2xl font-bold h-11 border-slate-200" asChild>
            <Link href="/billing/bulk">
              <Zap className="mr-2 h-4 w-4 fill-amber-400 text-amber-400" /> Fast Billing
            </Link>
          </Button>
          <NewBillModal tenants={tenants || []} owner={owner} />
        </div>
      </div>

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
