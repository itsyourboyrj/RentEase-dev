"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Loader2 } from "lucide-react";
import { createFlat, createBulkFlats } from "@/app/flats/actions";
import { toast } from "sonner";

export function AddFlatModal({ buildingId, buildingName }: { buildingId: string; buildingName: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSingleSubmit(formData: FormData) {
    if (loading) return;
    setLoading(true);
    try {
      await createFlat(formData);
      toast.success("Flat added successfully!");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleBulkSubmit(formData: FormData) {
    if (loading) return;
    setLoading(true);
    try {
      await createBulkFlats(formData);
      toast.success("Flats generated successfully!");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Flat
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Flat to {buildingName}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-xl mb-4">
            <TabsTrigger value="single">Single Flat</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Add (Range)</TabsTrigger>
          </TabsList>

          <TabsContent value="single">
            <form action={handleSingleSubmit} className="space-y-4 pt-2">
              <input type="hidden" name="building_id" value={buildingId} />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="flat_code">Flat Code (e.g. A-101)</Label>
                  <Input id="flat_code" name="flat_code" placeholder="A-101" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floor">Floor Number</Label>
                  <Input id="floor" name="floor" type="number" placeholder="1" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rent_amount">Monthly Rent (₹)</Label>
                <Input id="rent_amount" name="rent_amount" type="number" placeholder="8000" required />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {loading ? "Saving..." : "Save Flat"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="bulk">
            <form action={handleBulkSubmit} className="space-y-4 pt-2">
              <input type="hidden" name="building_id" value={buildingId} />
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="bulk_prefix" className="text-[10px] font-bold">Prefix</Label>
                  <Input id="bulk_prefix" name="prefix" placeholder="e.g. A-" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="bulk_start_no" className="text-[10px] font-bold">Start #</Label>
                  <Input id="bulk_start_no" name="start_no" type="number" placeholder="101" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="bulk_end_no" className="text-[10px] font-bold">End #</Label>
                  <Input id="bulk_end_no" name="end_no" type="number" placeholder="105" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="bulk_floor" className="text-[10px] font-bold">Floor</Label>
                  <Input id="bulk_floor" name="floor" type="number" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="bulk_rent_amount" className="text-[10px] font-bold">Rent (₹)</Label>
                  <Input id="bulk_rent_amount" name="rent_amount" type="number" required />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 rounded-2xl font-black" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {loading ? "Generating..." : "GENERATE FLATS"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
