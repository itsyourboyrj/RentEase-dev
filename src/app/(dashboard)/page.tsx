import { createClient } from "@/lib/supabase/server";
import { Building2, DoorOpen, Users, IndianRupee, AlertCircle, UserCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { BoutiqueEmptyState } from "@/components/shared/empty-state";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface OverdueBill {
  id: string;
  total_amount: number;
  is_paid: boolean | null;
  tenants: {
    name: string;
    phone: string;
    flats: {
      flat_code: string;
    };
  } | null;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Fetch Owner Profile
  const { data: owner } = await supabase
    .from('owners')
    .select('*')
    .eq('id', user.id)
    .single();

  // 2. Fetch Summary Stats
  const { count: buildingCount } = await supabase.from("buildings").select("*", { count: 'exact', head: true });
  const { count: flatCount } = await supabase.from("flats").select("*", { count: 'exact', head: true });
  const { count: tenantCount } = await supabase.from("tenants").select("*", { count: 'exact', head: true });

  // 3. Calculate Dues
  const { data: unpaidBills } = await supabase
    .from("bills")
    .select("total_amount")
    .eq("is_paid", false);

  const totalDues = unpaidBills?.reduce((sum, bill) => sum + Number(bill.total_amount), 0) || 0;

  // 4. Fetch Overdue Bills
  const { data: overdueBills } = await supabase
    .from("bills")
    .select(`*, tenants (name, phone, flats (flat_code))`)
    .eq("is_paid", false)
    .limit(5);

  // --- LOGIC: CHECK FOR EMPTY PROFILE OR BUILDINGS ---
  if (!owner) {
    return (
      <div className="space-y-8">
        <OnboardingWizard buildingCount={buildingCount ?? 0} />
        <BoutiqueEmptyState
          icon={UserCircle}
          title="Finish your Setup"
          description="You're almost there! We need your landlord details and UPI ID before you can start managing properties."
          buttonText="Setup Profile"
          href="/settings"
        />
      </div>
    );
  }

  const isProfileIncomplete = !owner.full_name || !owner.phone;

  if (isProfileIncomplete) {
    return (
      <div className="space-y-8">
        <OnboardingWizard buildingCount={buildingCount || 0} />
        <BoutiqueEmptyState
          icon={UserCircle}
          title="Finish your Setup"
          description="You're almost there! We need your landlord details and UPI ID before you can start managing properties."
          buttonText="Setup Profile"
          href="/settings"
        />
      </div>
    );
  }

  if (!buildingCount) {
    return (
      <div className="space-y-8">
        <OnboardingWizard buildingCount={0} />
        <BoutiqueEmptyState
          icon={Building2}
          title="No Buildings Yet"
          description="Add your first building to start managing flats and tenants."
          buttonText="Add Building"
          href="/buildings"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <OnboardingWizard buildingCount={buildingCount || 0} />

      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-black tracking-tighter">Dashboard</h1>
        <p className="text-slate-500 font-medium italic">Welcome back, {owner.full_name}</p>
      </div>

      {/* CLICKABLE STATS GRID */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardLink href="/buildings" title="Buildings" value={buildingCount} icon={Building2} desc="Manage locations" />
        <DashboardLink href="/flats" title="Flats" value={flatCount} icon={DoorOpen} desc="View unit status" />
        <DashboardLink href="/tenants" title="Tenants" value={tenantCount} icon={Users} desc="Active occupancy" />
        <DashboardLink href="/billing" title="Dues" value={`₹${totalDues.toLocaleString()}`} icon={IndianRupee} desc="Action required" isAlert />
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 glass-card border-none rounded-[32px] overflow-hidden">
          <CardHeader className="bg-white/40 border-b border-white/40">
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
                    <TableRow key={bill.id} className="border-white/40 hover:bg-white/20">
                      <TableCell className="pl-6 font-bold">{bill.tenants?.name ?? "Unknown tenant"}</TableCell>
                      <TableCell className="text-xs font-black">{bill.tenants?.flats?.flat_code ?? "No flat"}</TableCell>
                      <TableCell className="text-destructive font-black">₹{bill.total_amount}</TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="sm" className="rounded-xl font-bold text-primary hover:bg-primary/10" asChild>
                          <Link href="/billing">Remind</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 glass-card border-none rounded-[32px] p-6">
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
        "glass-card p-6 rounded-[32px] transition-all duration-500 hover:translate-y-[-4px] hover:shadow-2xl relative overflow-hidden",
        isAlert ? "bg-red-50/50" : ""
      )}>
        <div className="flex justify-between items-start mb-4">
          <div className={cn("p-3 rounded-2xl", isAlert ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary")}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</div>
        </div>
        <div className="text-3xl font-black tracking-tighter mb-1">{value ?? 0}</div>
        <p className={cn("text-xs font-bold", isAlert ? "text-red-500" : "text-slate-500")}>{desc}</p>
        <div className={cn("absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500", isAlert ? "bg-destructive" : "bg-primary")} />
      </div>
    </Link>
  );
}

function QuickActionButton({ href, label, primary }: { href: string; label: string; primary?: boolean }) {
  return (
    <Button
      variant={primary ? "default" : "outline"}
      className={cn("w-full justify-start h-12 rounded-2xl font-bold", primary ? "bg-primary shadow-lg shadow-primary/20" : "border-slate-200")}
      asChild
    >
      <Link href={href}>{label}</Link>
    </Button>
  );
}
