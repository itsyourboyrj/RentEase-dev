import { createClient } from "@/lib/supabase/server";
import { BillingDashboard } from "./billing-dashboard";
import { BoutiqueEmptyState } from "@/components/shared/empty-state";
import { Receipt } from "lucide-react";

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div>Unauthorized</div>;

  const [ownerRes, billsRes, tenantsRes, buildingsRes] = await Promise.all([
    supabase.from("owners").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("bills")
      .select(`*, tenants (*, flats (*, buildings (*)))`)
      .order("created_at", { ascending: false }),
    supabase.from("tenants").select("*, flats(*, buildings(*))").eq("is_active", true),
    supabase.from("buildings").select("id, name"),
  ]);

  const owner = ownerRes.data;
  const bills = billsRes.data ?? [];
  const tenants = tenantsRes.data ?? [];
  const buildings = buildingsRes.data ?? [];

  if (bills.length === 0) {
    return (
      <div className="space-y-6 pb-20">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Billing</h1>
          <p className="text-muted-foreground">Manage invoices and payments.</p>
        </div>
        <BoutiqueEmptyState
          icon={Receipt}
          title="No invoices yet"
          description="Create a bill for a tenant or generate invoices for a whole building."
          buttonText="Start billing"
          href="/billing/bulk"
        />
      </div>
    );
  }

  return (
    <BillingDashboard
      bills={bills}
      owner={owner}
      tenants={tenants}
      buildings={buildings}
    />
  );
}
