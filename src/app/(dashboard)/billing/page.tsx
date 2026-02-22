import { createClient } from "@/lib/supabase/server";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Receipt, IndianRupee, CheckCircle2, Clock } from "lucide-react";
import { NewBillModal } from "./new-bill-modal";

export default async function BillingPage() {
  const supabase = await createClient();

  // Fetch all bills with tenant/flat/building info
  const { data: bills } = await supabase
    .from("bills")
    .select(`
      *,
      tenants (
        name,
        phone,
        flats (
          flat_code,
          buildings (name, electricity_rate)
        )
      )
    `)
    .order("created_at", { ascending: false });

  // Fetch active tenants for the "New Bill" dropdown
  const { data: tenants } = await supabase
    .from("tenants")
    .select("*, flats(*, buildings(*))")
    .eq("is_active", true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground">Generate invoices and track payments.</p>
        </div>

        <NewBillModal tenants={tenants || []} />
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!bills || bills.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No bills generated yet.
                </TableCell>
              </TableRow>
            ) : (
              bills.map((bill: any) => (
                <TableRow key={bill.id}>
                  <TableCell className="font-medium">{bill.billing_month}</TableCell>
                  <TableCell>{bill.tenants.name}</TableCell>
                  <TableCell>{bill.tenants.flats.flat_code}</TableCell>
                  <TableCell className="font-bold">₹{bill.total_amount.toLocaleString()}</TableCell>
                  <TableCell>
                    {bill.is_paid ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                        <CheckCircle2 className="h-3 w-3" /> PAID
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-600 text-xs font-bold">
                        <Clock className="h-3 w-3" /> DUE
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">Options</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
