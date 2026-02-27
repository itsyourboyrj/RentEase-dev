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
import { Plus, Loader2 } from "lucide-react";
import { createTenant } from "@/app/tenants/actions";
import { toast } from "sonner";

export function AddTenantModal({ buildings, vacantFlats }: { buildings: any[], vacantFlats: any[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<string>("");

  // Filter flats based on the building chosen in the first dropdown
  const filteredFlats = vacantFlats.filter(f => f.building_id === selectedBuilding);

  async function handleSubmit(formData: FormData) {
    if (loading) return;

    const occupancy = parseInt(formData.get('occupancy_count') as string);
    if (!Number.isFinite(occupancy) || occupancy < 1) {
      toast.error("Total members must be at least 1");
      return;
    }
    const meterReading = parseFloat(formData.get('initial_meter_reading') as string);
    if (!Number.isFinite(meterReading) || meterReading < 0) {
      toast.error("Meter reading cannot be negative");
      return;
    }

    setLoading(true);
    try {
      await createTenant(formData);
      toast.success("Tenant onboarded successfully!");
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name*</Label>
              <Input name="name" placeholder="Ramesh Kumar" required />
            </div>
            <div className="space-y-2">
              <Label>Aadhar Number*</Label>
              <Input name="aadhar_number" placeholder="000000000000" maxLength={12} pattern="\d{12}" inputMode="numeric" title="Enter 12 numeric digits" required />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Gender*</Label>
              <Select name="gender" required>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Marital Status*</Label>
              <Select name="marital_status" required>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Single">Single</SelectItem>
                  <SelectItem value="Married">Married</SelectItem>
                  <SelectItem value="Divorced">Divorced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Employment*</Label>
              <Select name="employment_status" required>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Govt Employee">Govt Employee</SelectItem>
                  <SelectItem value="Private Company">Private Company</SelectItem>
                  <SelectItem value="Student">Student</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="None">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Total Members*</Label>
              <Input name="occupancy_count" type="number" placeholder="1" defaultValue="1" min={1} step="1" required />
            </div>
            <div className="space-y-2">
              <Label>Current Meter Reading*</Label>
              <Input name="initial_meter_reading" type="number" step="0.01" min={0} placeholder="0.00" required />
            </div>
            <div className="space-y-2">
              <Label>Join Date*</Label>
              <Input name="join_date" type="date" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone Number*</Label>
              <Input name="phone" placeholder="9876543210" required />
            </div>
            <div className="space-y-2">
              <Label>Security Deposit (₹)</Label>
              <Input name="security_deposit" type="number" placeholder="15000" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Emergency Contact (Name & Phone)</Label>
            <Input name="emergency_contact" placeholder="Sita Devi - 9876543211" />
          </div>

          <div className="space-y-2">
            <Label>Permanent Address</Label>
            <Input name="address" placeholder="123, Street Name, City" />
          </div>

          <div className="space-y-2">
            <Label>Meter Number</Label>
            <Input name="meter_number" placeholder="MET-001" />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? "Creating..." : "Create Tenant Record"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
