"use client"; // We make this a client component to handle the Toast

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Building2, Loader2 } from "lucide-react";
import { createBuilding } from "@/app/buildings/actions";
import { toast } from "sonner";
import Link from "next/link";
import { DeleteButton } from "@/components/shared/delete-button";

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  async function fetchBuildings() {
    try {
      const { data, error } = await supabase
        .from("buildings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Failed to fetch buildings:", error.message);
        toast.error("Failed to load buildings: " + error.message);
        setBuildings([]);
      } else {
        setBuildings(data || []);
      }
    } catch {
      setBuildings([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBuildings();
  }, []);

  async function handleSubmit(formData: FormData) {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createBuilding(formData);
      toast.success("Building added successfully!");
      fetchBuildings(); // Refresh the list
      (document.getElementById("add-building-form") as HTMLFormElement).reset();
    } catch (error: any) {
      toast.error("Error adding building: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Buildings</h1>
          <p className="text-muted-foreground">Manage your properties and utility rates.</p>
        </div>

        <form
          id="add-building-form"
          action={handleSubmit}
          className="glass-card flex w-full flex-wrap gap-2 rounded-2xl p-3 md:w-auto"
        >
          <input name="name" aria-label="Building name" placeholder="Building name" className="h-10 min-w-0 flex-1 rounded-xl border border-input bg-white/80 dark:bg-slate-950/70 px-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground/80 focus-visible:ring-2 focus-visible:ring-ring/50 md:w-36 md:flex-none" required />
          <input name="address" aria-label="Address" placeholder="Address" className="h-10 min-w-0 flex-1 rounded-xl border border-input bg-white/80 dark:bg-slate-950/70 px-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground/80 focus-visible:ring-2 focus-visible:ring-ring/50 md:w-36 md:flex-none" required />
          <div className="flex h-10 items-center gap-1 rounded-xl border border-input bg-white/80 dark:bg-slate-950/70 px-3">
            <span className="text-xs text-muted-foreground">₹</span>
            <input name="electricity_rate" aria-label="Electricity rate per unit" type="number" step="0.1" defaultValue="8" className="w-14 bg-transparent text-sm outline-none" required />
          </div>
          <Button type="submit" size="sm" className="h-10 rounded-xl px-4" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Plus className="mr-1 h-4 w-4" />}
            {isSubmitting ? "Adding..." : "Add"}
          </Button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {buildings.length === 0 ? (
            <div className="surface-card col-span-full flex flex-col items-center justify-center rounded-2xl border-dashed py-16">
              <Building2 className="mb-3 h-9 w-9 text-muted-foreground/50" />
              <p className="font-medium">No buildings yet</p>
              <p className="text-sm text-muted-foreground">Add your first property using the form above.</p>
            </div>
          ) : (
            buildings.map((b) => (
              <div key={b.id} className="group relative">
                <div className="glass-card rounded-2xl p-5 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg overflow-hidden">
                  <div className="flex justify-between items-start mb-5">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <DeleteButton table="buildings" id={b.id} label={b.name} />
                  </div>

                  <h3 className="text-lg font-semibold tracking-tight mb-1 truncate">{b.name}</h3>
                  <p className="text-muted-foreground text-sm flex items-center gap-2 mb-5">
                    <MapPin className="h-3.5 w-3.5" /> {b.address}
                  </p>

                  <div className="flex items-center gap-4 pt-4 border-t border-border">
                    <div className="flex-1">
                      <p className="text-[11px] uppercase font-medium text-muted-foreground tracking-wide">Electricity rate</p>
                      <p className="text-sm font-semibold text-foreground">₹{b.electricity_rate}/unit</p>
                    </div>
                    <Button variant="secondary" className="rounded-xl font-medium" asChild>
                      <Link href={`/buildings/${b.id}`}>View Flats</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
