"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Loader2 } from "lucide-react";
import { updateTenant } from "@/app/tenants/actions";
import { toast } from "sonner";

export function EditTenantModal({ tenant, onSaved }: { tenant: any; onSaved?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await updateTenant(tenant.id, formData);
      toast.success("Profile updated successfully");
      setOpen(false);
      onSaved?.();
    } catch (err: any) {
      const message = err?.message || (typeof err === 'string' ? err : 'An error occurred');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="h-4 w-4" /> Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Resident Profile: {tenant.name}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input name="name" defaultValue={tenant.name} required />
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input name="phone" defaultValue={tenant.phone} required />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input name="email" defaultValue={tenant.email} />
          </div>
          <div className="space-y-2">
            <Label>Aadhar Number</Label>
            <Input name="aadhar_number" defaultValue={tenant.aadhar_number} maxLength={12} pattern="\d{12}" inputMode="numeric" />
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select name="gender" defaultValue={tenant.gender}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Marital Status</Label>
            <Select name="marital_status" defaultValue={tenant.marital_status}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Single">Single</SelectItem>
                <SelectItem value="Married">Married</SelectItem>
                <SelectItem value="Divorced">Divorced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Employment Status</Label>
            <Select name="employment_status" defaultValue={tenant.employment_status}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Govt Employee">Govt Employee</SelectItem>
                <SelectItem value="Private Company">Private Company</SelectItem>
                <SelectItem value="Student">Student</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="None">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Total Members</Label>
            <Input name="occupancy_count" type="number" defaultValue={tenant.occupancy_count ?? 1} min={1} step="1" />
          </div>
          <div className="space-y-2 col-span-full">
            <Label>Emergency Contact</Label>
            <Input name="emergency_contact" defaultValue={tenant.emergency_contact} />
          </div>
          <div className="space-y-2 col-span-full">
            <Label>Permanent Address</Label>
            <Input name="address" defaultValue={tenant.address} />
          </div>

          <Button type="submit" className="w-full col-span-full h-12 mt-2" disabled={loading}>
            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
