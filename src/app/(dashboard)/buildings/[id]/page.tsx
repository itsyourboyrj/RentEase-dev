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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Building, DoorOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AddFlatModal } from "./add-flat-modal";
import { EditStatusModal } from "@/components/flats/edit-status-modal";

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
          <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
            <Building className="h-6 w-6 text-primary" />
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
      <div className="surface-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
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
                    <Badge className={cn(
                      "text-[10px]",
                      {
                        'Occupied': 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-200',
                        'Pre-booked': 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200',
                        'Vacant': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200',
                      }[String((flat as any).status)] ?? 'bg-gray-100 text-gray-700'
                    )}>
                      {({
                        'Occupied': 'OCCUPIED',
                        'Pre-booked': 'PRE-BOOKED',
                        'Vacant': 'VACANT',
                      }[String((flat as any).status)] ?? 'UNKNOWN')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <EditStatusModal flat={flat} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>
    </div>
  );
}
