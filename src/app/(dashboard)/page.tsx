export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { Building2, DoorOpen, Users, IndianRupee, AlertCircle, UserCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { BoutiqueEmptyState } from "@/components/shared/empty-state";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { RemindButton } from "./remind-button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface OverdueBill {
  id: string;
  total_amount: number;
  paid_amount: number | null;
  remaining_balance: number | null;
  billing_month: string | null;
  status: string | null;
  tenants: {
    name: string;
    phone: string;
    flats: {
      flat_code: string;
    } | null;
  } | null;
}

function getOutstandingBalance(bill: {
  remaining_balance: number | null;
  total_amount: number;
  paid_amount: number | null;
}) {
  const remainingBalance = Number(bill.remaining_balance);
  if (Number.isFinite(remainingBalance) && remainingBalance > 0) return remainingBalance;

  return Math.max(0, Number(bill.total_amount) - Number(bill.paid_amount ?? 0));
}

function isOutstandingBill(bill: {
  is_paid: boolean | null;
  status: string | null;
  remaining_balance: number | null;
  total_amount: number;
  paid_amount: number | null;
}) {
  return bill.is_paid !== true &&
    !["Paid", "Advance Paid", "Cancelled"].includes(bill.status ?? "") &&
    getOutstandingBalance(bill) > 0;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Fetch Owner Profile & Counts simultaneously for speed
  const [ownerRes, buildingsCountRes, flatsCountRes, activeTenantsRes] = await Promise.all([
    supabase.from('owners').select('full_name, phone, upi_id, profile_url').eq('id', user.id).single(),
    supabase.from("buildings").select("id", { count: 'exact', head: true }),
    supabase.from("flats").select("id", { count: 'exact', head: true }),
    supabase.from("tenants").select("id", { count: 'exact', head: true }).eq("is_active", true),
  ]);

  const owner = ownerRes.data;
  const buildingCount = buildingsCountRes.count || 0;
  const flatCount = flatsCountRes.count || 0;
  const tenantCount = activeTenantsRes.count || 0;

  // Logic: Is the user a "First Timer"?
  const isProfileIncomplete = !owner?.full_name || !owner?.phone;
  const hasNoData = buildingCount === 0;

  // --- SHOW ONBOARDING IF BRAND NEW ---
  if (!owner || isProfileIncomplete || hasNoData) {
    return (
      <div className="space-y-8">
        <OnboardingWizard buildingCount={buildingCount} />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <BoutiqueEmptyState
            icon={!owner || isProfileIncomplete ? UserCircle : Building2}
            title={!owner || isProfileIncomplete ? "Finish your Setup" : "Start your Empire"}
            description={!owner || isProfileIncomplete
              ? "You're almost there! We need your landlord details and UPI ID before you can start managing properties."
              : "Your profile is set! Now, let's add your first building to start managing tenants."}
            buttonText={!owner || isProfileIncomplete ? "Setup Profile" : "Add First Building"}
            href={!owner || isProfileIncomplete ? "/settings" : "/buildings"}
          />
        </div>
      </div>
    );
  }

  // --- SHOW PROFESSIONAL DASHBOARD FOR REGULAR USERS ---
  const { data: unpaidBills } = await supabase
    .from("bills")
    .select("remaining_balance, total_amount, paid_amount, status, is_paid")
    .or("remaining_balance.gt.0,is_paid.eq.false,status.eq.Due,status.eq.Partial,status.eq.Pending");

  const totalDues = unpaidBills
    ?.filter(isOutstandingBill)
    .reduce((sum, bill) => sum + getOutstandingBalance(bill), 0) || 0;

  const { data: pendingBillCandidates } = await supabase
    .from("bills")
    .select(`
      id,
      billing_month,
      total_amount,
      paid_amount,
      remaining_balance,
      status,
      is_paid,
      tenants (
        name,
        phone,
        flats (flat_code)
      )
    `)
    .or("remaining_balance.gt.0,is_paid.eq.false,status.eq.Due,status.eq.Partial,status.eq.Pending")
    .order("created_at", { ascending: false })
    .limit(20);

  const overdueBills = (pendingBillCandidates ?? [])
    .map(bill => ({ ...bill, remaining_balance: getOutstandingBalance(bill) }))
    .filter(isOutstandingBill)
    .slice(0, 5);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your properties at a glance, {owner.full_name}</p>
      </div>

      {/* CLICKABLE STATS GRID */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardLink href="/buildings" title="Buildings" value={buildingCount} icon={Building2} desc="Managed locations" />
        <DashboardLink href="/flats" title="Flats" value={flatCount} icon={DoorOpen} desc="View unit status" />
        <DashboardLink href="/tenants" title="Tenants" value={tenantCount} icon={Users} desc="Active residents" />
        <DashboardLink href="/billing" title="Dues" value={`\u20B9${totalDues.toLocaleString()}`} icon={IndianRupee} desc="Action required" isAlert />
      </div>

      <div className="grid gap-5 md:grid-cols-7">
        <Card className="md:col-span-4 glass-card rounded-2xl overflow-hidden gap-0">
          <CardHeader className="border-b border-border/70 py-5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="pl-6">Tenant</TableHead>
                  <TableHead>Flat</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!overdueBills || overdueBills.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                      All caught up! No pending dues.
                    </TableCell>
                  </TableRow>
                ) : (
                  overdueBills.map((bill: OverdueBill) => (
                    <TableRow key={bill.id} className="hover:bg-muted/60">
                      <TableCell className="pl-6 font-bold">{bill.tenants?.name ?? "Unknown tenant"}</TableCell>
                      <TableCell className="text-xs font-medium">{bill.tenants?.flats?.flat_code ?? "No flat"}</TableCell>
                      <TableCell className="text-destructive font-semibold">₹{Number(bill.remaining_balance ?? bill.total_amount).toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right pr-6">
                        <RemindButton bill={bill} ownerUpiId={owner?.upi_id} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 glass-card rounded-2xl p-6">
          <CardTitle className="text-lg mb-4">Quick Actions</CardTitle>
          <div className="grid gap-3">
            <QuickActionButton href="/buildings" label="Add Building" />
            <QuickActionButton href="/tenants" label="Onboard Tenant" />
            <QuickActionButton href="/billing/bulk" label="Fast Billing Mode" primary />
          </div>
        </Card>
      </div>
    </div>
  );
}

function DashboardLink({ href, title, value, icon: Icon, desc, isAlert }: {
  href: string;
  title: string;
  value: number | string | null;
  icon: React.ElementType;
  desc: string;
  isAlert?: boolean;
}) {
  return (
    <Link href={href} className="group">
      <div className={cn(
        "glass-card p-5 rounded-2xl transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg relative overflow-hidden",
        isAlert ? "bg-rose-50/70 dark:bg-rose-950/20" : ""
      )}>
        <div className="flex justify-between items-start mb-4">
          <div className={cn("p-2.5 rounded-xl", isAlert ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300" : "bg-primary/10 text-primary")}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{title}</div>
        </div>
        <div className="text-3xl font-semibold tracking-tight mb-1">{value ?? 0}</div>
        <p className={cn("text-sm", isAlert ? "text-rose-700 dark:text-rose-300" : "text-muted-foreground")}>{desc}</p>
      </div>
    </Link>
  );
}

function QuickActionButton({ href, label, primary }: { href: string; label: string; primary?: boolean }) {
  return (
    <Button
      variant={primary ? "default" : "outline"}
      className={cn("w-full justify-start h-11 rounded-xl font-medium", primary ? "shadow-sm shadow-primary/20" : "border-border bg-white/60 dark:bg-slate-900/60")}
      asChild
    >
      <Link href={href}>{label}</Link>
    </Button>
  );
}
