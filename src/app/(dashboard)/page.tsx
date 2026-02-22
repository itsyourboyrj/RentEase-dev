import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Building2, DoorOpen, Users, IndianRupee, AlertCircle } from "lucide-react";
import Link from "next/link";
import { RemindButton } from "@/components/dashboard/remind-button";

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
    .select("upi_id")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Here is what is happening across your properties today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardLink href="/buildings" title="Buildings" value={buildingCount} icon={Building2} desc="Manage locations" />
        <DashboardLink href="/flats" title="Flats" value={flatCount} icon={DoorOpen} desc="View unit status" />
        <DashboardLink href="/tenants" title="Active Tenants" value={tenantCount} icon={Users} desc="Current occupancy" />
        <DashboardLink href="/billing" title="Total Dues" value={`₹${totalDues.toLocaleString()}`} icon={IndianRupee} desc="Action required" isAlert />
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        {/* Unpaid Bills Table */}
        <Card className="col-span-4">
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
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/buildings">Add New Building</Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/tenants">Onboard New Tenant</Link>
            </Button>
            <Button className="w-full justify-start font-bold" asChild>
              <Link href="/billing">Generate Monthly Bills</Link>
            </Button>
          </CardContent>
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
    <Link href={href} className="group transition-transform active:scale-95">
      <Card className={`hover:shadow-2xl transition-all border-none relative overflow-hidden ${isAlert ? 'bg-destructive/5' : ''}`}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
          <Icon className={`h-5 w-5 ${isAlert ? 'text-destructive' : 'text-primary'}`} />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black tracking-tighter">{value ?? 0}</div>
          <p className={`text-xs mt-1 ${isAlert ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>{desc}</p>
        </CardContent>
        <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-300 ${isAlert ? 'bg-destructive' : 'bg-primary'}`} />
      </Card>
    </Link>
  );
}
