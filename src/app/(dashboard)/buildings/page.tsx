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
          <h1 className="text-3xl font-bold tracking-tight text-primary">Buildings</h1>
          <p className="text-muted-foreground">Manage your property locations and rates.</p>
        </div>

        <form
          id="add-building-form"
          action={handleSubmit}
          className="flex flex-wrap gap-2 bg-card p-3 border rounded-xl shadow-sm"
        >
          <input name="name" placeholder="Building Name" className="bg-transparent border-b px-2 text-sm focus:outline-none focus:border-primary" required />
          <input name="address" placeholder="Address" className="bg-transparent border-b px-2 text-sm focus:outline-none focus:border-primary" required />
          <div className="flex items-center gap-1 border-b px-2">
            <span className="text-xs text-muted-foreground">₹</span>
            <input name="electricity_rate" type="number" step="0.1" defaultValue="8" className="bg-transparent border-none text-sm focus:outline-none w-12" required />
          </div>
          <Button type="submit" size="sm" className="rounded-full" disabled={isSubmitting}>
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
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {buildings.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-xl bg-card/50">
              <Building2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-medium">No buildings yet.</p>
              <p className="text-sm text-muted-foreground">Use the form above to add your first property.</p>
            </div>
          ) : (
            buildings.map((b) => (
              <div key={b.id} className="group relative">
                <div className="glass-card rounded-[32px] p-6 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2 overflow-hidden border-white/40">
                  <div className="flex justify-between items-start mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                      <Building2 className="h-7 w-7" />
                    </div>
                    <DeleteButton table="buildings" id={b.id} label={b.name} />
                  </div>

                  <h3 className="text-2xl font-black tracking-tighter mb-1 truncate">{b.name}</h3>
                  <p className="text-slate-500 text-sm font-medium flex items-center gap-2 mb-6">
                    <MapPin className="h-3.5 w-3.5" /> {b.address}
                  </p>

                  <div className="flex items-center gap-4 pt-4 border-t border-dashed border-slate-200">
                    <div className="flex-1">
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Rate</p>
                      <p className="text-sm font-bold text-primary italic">₹{b.electricity_rate}/unit</p>
                    </div>
                    <Button variant="secondary" className="rounded-2xl font-bold hover:bg-primary hover:text-white transition-all shadow-sm" asChild>
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
