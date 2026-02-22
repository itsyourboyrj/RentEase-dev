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
import { Plus, Loader2 } from "lucide-react";
import { createFlat } from "@/app/flats/actions";
import { toast } from "sonner";

export function AddFlatModal({ buildingId, buildingName }: { buildingId: string; buildingName: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
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
        <form action={handleSubmit} className="space-y-4 pt-4">
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
      </DialogContent>
    </Dialog>
  );
}
