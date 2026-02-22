import { createClient } from "@/lib/supabase/server";
import { NewBillModal } from "./new-bill-modal";
import { BillingTable } from "./billing-table";

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: owner } = await supabase.from('owners').select('*').eq('id', user?.id).single();

  const { data: bills } = await supabase
    .from("bills")
    .select(`*, tenants (*, flats (*, buildings (*)))`)
    .order("created_at", { ascending: false });

  const { data: tenants } = await supabase.from("tenants").select("*, flats(*, buildings(*))").eq("is_active", true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Billing</h1>
        <NewBillModal tenants={tenants || []} owner={owner} />
      </div>

      <BillingTable bills={bills || []} owner={owner} />
    </div>
  );
}
