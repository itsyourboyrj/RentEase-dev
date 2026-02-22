"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { createTenant } from "@/app/tenants/actions";
import { toast } from "sonner";

export function AddTenantModal({ buildings, vacantFlats }: { buildings: any[], vacantFlats: any[] }) {
  const [open, setOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<string>("");

  // Filter flats based on the building chosen in the first dropdown
  const filteredFlats = vacantFlats.filter(f => f.building_id === selectedBuilding);

  async function handleSubmit(formData: FormData) {
    try {
      await createTenant(formData);
      toast.success("Tenant onboarded successfully!");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Tenant
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Onboard New Tenant</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Building</Label>
              <Select onValueChange={setSelectedBuilding} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Building" />
                </SelectTrigger>
                <SelectContent>
                  {buildings.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Flat</Label>
              <Select name="flat_id" disabled={!selectedBuilding} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Flat" />
                </SelectTrigger>
                <SelectContent>
                  {filteredFlats.map(f => (
                    <SelectItem key={f.id} value={f.id}>{f.flat_code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Tenant Full Name</Label>
            <Input id="name" name="name" placeholder="Ramesh Kumar" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency_contact">Emergency Contact (Name & Phone)</Label>
            <Input id="emergency_contact" name="emergency_contact" placeholder="Sita Devi - 9876543211" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Permanent Address</Label>
            <Input id="address" name="address" placeholder="123, Street Name, City" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" placeholder="9876543210" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="join_date">Join Date</Label>
              <Input id="join_date" name="join_date" type="date" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="security_deposit">Security Deposit (₹)</Label>
              <Input id="security_deposit" name="security_deposit" type="number" placeholder="15000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meter_number">Meter Number</Label>
              <Input id="meter_number" name="meter_number" placeholder="MET-001" />
            </div>
          </div>

          <Button type="submit" className="w-full">Create Tenant Record</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
