import { createClient } from "@/lib/supabase/server";
import { NewBillModal } from "./new-bill-modal";
import { BillingTable } from "./billing-table";
import { BoutiqueEmptyState } from "@/components/shared/empty-state";
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black tracking-tighter">Billing</h1>
        <NewBillModal tenants={tenants || []} owner={owner} />
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
