"use client"; // We make this a client component to handle the Toast

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, MapPin, Zap, Building2 as BuildingIcon, Loader2 } from "lucide-react";
import { createBuilding } from "@/app/buildings/actions";
import { toast } from "sonner";
import Link from "next/link";

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  async function fetchBuildings() {
    const { data } = await supabase
      .from("buildings")
      .select("*")
      .order("created_at", { ascending: false });
    setBuildings(data || []);
    setLoading(false);
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {buildings.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-xl bg-card/50">
              <BuildingIcon className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-medium">No buildings yet.</p>
              <p className="text-sm text-muted-foreground">Use the form above to add your first property.</p>
            </div>
          ) : (
            buildings.map((b) => (
              <Card key={b.id} className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all group">
                <div className="h-2 bg-primary w-full" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">{b.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4 text-primary/60" />
                      {b.address}
                    </div>
                    <div className="flex items-center text-sm font-semibold text-amber-600 bg-amber-50 w-fit px-2 py-1 rounded-md">
                      <Zap className="mr-2 h-4 w-4 fill-amber-600" />
                      ₹{b.electricity_rate} / unit
                    </div>
                  </div>
                  <Button variant="secondary" className="w-full group-hover:bg-primary group-hover:text-white transition-all" asChild>
                    <Link href={`/buildings/${b.id}`}>View Flats</Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
