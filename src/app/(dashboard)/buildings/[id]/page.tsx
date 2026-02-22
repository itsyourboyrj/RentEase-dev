import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Building, DoorOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AddFlatModal } from "./add-flat-modal";

export default async function BuildingDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = await params;

  // 1. Fetch Building Details
  const { data: building } = await supabase
    .from("buildings")
    .select("*")
    .eq("id", id)
    .single();

  if (!building) return notFound();

  // 2. Fetch Flats for this building
  const { data: flats } = await supabase
    .from("flats")
    .select("*")
    .eq("building_id", id)
    .order("flat_code", { ascending: true });

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/buildings">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Building className="h-8 w-8 text-primary" />
            {building.name}
          </h1>
          <p className="text-muted-foreground">{building.address}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <DoorOpen className="h-5 w-5 text-primary" />
          Flats List ({flats?.length || 0})
        </h2>

        <AddFlatModal buildingId={id} buildingName={building.name} />
      </div>

      {/* Flats Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Flat Code</TableHead>
              <TableHead>Floor</TableHead>
              <TableHead>Monthly Rent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!flats || flats.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  No flats added yet. Click "Add Flat" to begin.
                </TableCell>
              </TableRow>
            ) : (
              flats.map((flat) => (
                <TableRow key={flat.id}>
                  <TableCell className="font-medium">{flat.flat_code}</TableCell>
                  <TableCell>{flat.floor}</TableCell>
                  <TableCell>₹{flat.rent_amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      flat.is_occupied
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {flat.is_occupied ? "Occupied" : "Vacant"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
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
