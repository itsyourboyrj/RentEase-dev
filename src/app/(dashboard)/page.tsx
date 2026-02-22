import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/layout/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Building2, DoorOpen, Users, IndianRupee, AlertCircle } from "lucide-react";
import Link from "next/link";

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

  // 3. Fetch Recent Overdue Bills for the "Attention" table
  const { data: overdueBills } = await supabase
    .from("bills")
    .select(`
      *,
      tenants (
        name,
        flats (flat_code)
      )
    `)
    .eq("is_paid", false)
    .limit(5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Here is what is happening across your properties today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Buildings" value={buildingCount || 0} icon={Building2} description="Managed locations" />
        <StatCard title="Total Flats" value={flatCount || 0} icon={DoorOpen} description="Across all buildings" />
        <StatCard title="Active Tenants" value={tenantCount || 0} icon={Users} description="Current occupancy" />
        <StatCard
          title="Total Dues"
          value={`₹${totalDues.toLocaleString()}`}
          icon={IndianRupee}
          description="Unpaid invoices"
          trend="Action required"
          trendColor="text-destructive"
        />
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
                        <Button variant="outline" size="sm" asChild>
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
