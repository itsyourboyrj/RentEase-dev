import { createClient } from "@/lib/supabase/server";
import { FlatsClientView } from "./flats-client-view";
import { DoorOpen } from "lucide-react";

export default async function AllFlatsPage() {
  const supabase = await createClient();

  const { data: flats, error } = await supabase
    .from("flats")
    .select(`*, buildings(id, name), tenants(*, documents(*))`)
    .order("flat_code", { ascending: true });

  if (error) throw new Error(error.message);

  const { data: buildings, error: buildingsError } = await supabase.from("buildings").select("id, name");
  if (buildingsError) throw new Error(buildingsError.message);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tighter">Property Overview</h1>
        <p className="text-muted-foreground flex items-center gap-2">
          <DoorOpen className="h-4 w-4" />
          Managing {flats?.length || 0} total units
        </p>
      </div>

      <FlatsClientView flats={flats || []} buildings={buildings || []} />
    </div>
  );
}
