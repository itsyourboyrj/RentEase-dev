import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Building2, DoorOpen, Users, IndianRupee, AlertCircle, UserCircle } from "lucide-react";
import Link from "next/link";
import { RemindButton } from "@/components/dashboard/remind-button";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { BoutiqueEmptyState } from "@/components/shared/empty-state";

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Fetch Summary Stats
  const { count: buildingCount } = await supabase.from("buildings").select("*", { count: 'exact', head: true });
  const { count: flatCount } = await supabase.from("flats").select("*", { count: 'exact', head: true });
  const { count: tenantCount } = await supabase.from("tenants").select("*", { count: 'exact', head: true });

  // 2. Calculate Dues
  const { data: unpaidBills } = await supabase
    .from("bills")
    .select("total_amount")
    .eq("is_paid", false);

  const totalDues = unpaidBills?.reduce((sum, bill) => sum + Number(bill.total_amount), 0) || 0;

  // 3. Fetch Recent Overdue Bills with tenant phone for WhatsApp reminder
  const { data: overdueBills } = await supabase
    .from("bills")
    .select(`
      *,
      tenants (
        name,
        phone,
        flats (flat_code)
      )
    `)
    .eq("is_paid", false)
    .limit(5);

  // 4. Fetch owner for UPI reminder message
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: owner } = await supabase
    .from("owners")
    .select("upi_id, full_name, phone")
    .eq("id", user.id)
    .maybeSingle();

  // Profile incomplete → show setup prompt before anything else
  if (!owner?.full_name || !owner?.phone) {
    return (
      <div className="space-y-8 pb-10">
        <OnboardingWizard buildingCount={buildingCount || 0} />
        <BoutiqueEmptyState
          icon={UserCircle}
          title="Finish your Setup"
          description="We need your landlord name and phone number before you can start managing properties."
          buttonText="Setup Profile"
          href="/settings"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <OnboardingWizard buildingCount={buildingCount || 0} />

      <div>
        <h1 className="text-3xl font-black tracking-tighter">Dashboard</h1>
        <p className="text-slate-500 font-medium">Here is what is happening across your properties today.</p>
      </div>

      {(buildingCount ?? 0) === 0 ? (
        <BoutiqueEmptyState
          icon={Building2}
          title="No Buildings Yet"
          description="You haven't added any properties. Add your first building to start managing flats and tenants."
          buttonText="Add Building"
          href="/buildings"
        />
      ) : (
        <>
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardLink href="/buildings" title="Buildings" value={buildingCount} icon={Building2} desc="Manage locations" />
        <DashboardLink href="/flats" title="Flats" value={flatCount} icon={DoorOpen} desc="View unit status" />
        <DashboardLink href="/tenants" title="Active Tenants" value={tenantCount} icon={Users} desc="Current occupancy" />
        <DashboardLink href="/billing" title="Total Dues" value={`₹${totalDues.toLocaleString()}`} icon={IndianRupee} desc="Action required" isAlert />
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        {/* Unpaid Bills Table */}
        <Card className="col-span-4 glass-card border-none rounded-[32px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Flat</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Action</TableHead>
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
                  overdueBills.map((bill: any) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">{bill.tenants.name}</TableCell>
                      <TableCell>{bill.tenants.flats.flat_code}</TableCell>
                      <TableCell className="text-destructive font-bold">₹{bill.total_amount.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <RemindButton tenant={bill.tenants} bill={bill} owner={owner} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3 glass-card border-none rounded-[32px]">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button className="w-full justify-start rounded-2xl" variant="outline" asChild>
              <Link href="/buildings">Add New Building</Link>
            </Button>
            <Button className="w-full justify-start rounded-2xl" variant="outline" asChild>
              <Link href="/tenants">Onboard New Tenant</Link>
            </Button>
            <Button className="w-full justify-start rounded-2xl bg-gradient-to-r from-primary to-indigo-600 hover:opacity-90 shadow-lg shadow-primary/20 border-none font-bold" asChild>
              <Link href="/billing">Generate Monthly Bills</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
        </>
      )}
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
          <div className={cn(
            "p-3 rounded-2xl",
            isAlert ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary"
          )}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</div>
        </div>
        <div className="text-3xl font-black tracking-tighter mb-1">{value ?? 0}</div>
        <p className={cn("text-xs font-bold", isAlert ? "text-red-500" : "text-slate-500")}>{desc}</p>
        <div className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500" />
      </div>
    </Link>
  );
}
