import { createClient } from "@/lib/supabase/server";
import { FlatCard } from "./flat-card";
import { DoorOpen } from "lucide-react";

export default async function AllFlatsPage() {
  const supabase = await createClient();

  // Fetch flats along with their current active tenant and documents
  const { data: flats, error } = await supabase
    .from("flats")
    .select(`
      *,
      buildings(name),
      tenants(
        *,
        documents(*)
      )
    `)
    .order('flat_code', { ascending: true });

  if (error) throw new Error(error.message);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Property Overview</h1>
        <p className="text-muted-foreground flex items-center gap-2">
          <DoorOpen className="h-4 w-4" />
          Managing {flats?.length || 0} total units
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {flats?.map((flat) => {
          const activeTenant = flat.tenants?.find((t: any) => t.is_active);

          return (
            <FlatCard
              key={flat.id}
              flat={flat}
              tenant={activeTenant}
            />
          );
        })}
      </div>
    </div>
  );
}
