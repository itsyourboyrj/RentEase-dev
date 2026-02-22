import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Users, Phone, Home } from "lucide-react";
import { AddTenantModal } from "./add-tenant-modal";

export default async function TenantsPage() {
  const supabase = await createClient();

  // Fetch tenants with their flat and building info
  const { data: tenants } = await supabase
    .from("tenants")
    .select(`
      *,
      flats (
        flat_code,
        buildings (name)
      )
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  // Fetch buildings and vacant flats for the "Add Tenant" form
  const { data: buildings } = await supabase.from("buildings").select("id, name");
  const { data: vacantFlats } = await supabase
    .from("flats")
    .select("id, flat_code, building_id")
    .eq("is_occupied", false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
          <p className="text-muted-foreground">Manage active residents and their deposits.</p>
        </div>

        <AddTenantModal
          buildings={buildings || []}
          vacantFlats={vacantFlats || []}
        />
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Deposit</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!tenants || tenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No active tenants found.
                </TableCell>
              </TableRow>
            ) : (
              tenants.map((tenant: any) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        {tenant.name.substring(0, 2).toUpperCase()}
                      </div>
                      {tenant.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="flex items-center gap-1 text-xs">
                        <Phone className="h-3 w-3" /> {tenant.phone}
                      </span>
                      <span className="text-xs text-muted-foreground">{tenant.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="flex items-center gap-1 font-medium">
                        <Home className="h-3 w-3" /> {tenant.flats?.flat_code}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {tenant.flats?.buildings?.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(tenant.join_date).toLocaleDateString()}</TableCell>
                  <TableCell>₹{tenant.security_deposit?.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">View Profile</Button>
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
