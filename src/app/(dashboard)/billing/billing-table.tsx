"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MessageCircle, Trash2, MoreVertical } from "lucide-react";
import { deleteBills, updateBillStatus } from "@/app/billing/actions";
import { toast } from "sonner";
import { BillViewButton } from "@/components/billing/bill-view-button";

export function BillingTable({ bills, owner }: any) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedIds.length === bills.length) setSelectedIds([]);
    else setSelectedIds(bills.map((b: any) => b.id));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  async function handleDelete() {
    if (!confirm(`Delete ${selectedIds.length} selected bills?`)) return;
    try {
      await deleteBills(selectedIds);
      toast.success("Bills deleted");
      setSelectedIds([]);
    } catch (err: any) { toast.error(err.message); }
  }

  const sendWhatsAppInvoice = (bill: any) => {
    const tenant = bill.tenants;
    const message =
      `*Rent Invoice / किराया चालान*\n\n` +
      `Hi ${tenant.name}, your rent for ${bill.billing_month} is *₹${bill.total_amount}*.\n` +
      `नमस्ते ${tenant.name}, ${bill.billing_month} के लिए आपका किराया *₹${bill.total_amount}* है।\n\n` +
      `*UPI ID:* ${owner.upi_id}\n\n` +
      `Click below to view/pay:\n` +
      `upi://pay?pa=${owner.upi_id}&pn=${owner.full_name}&am=${bill.total_amount}&cu=INR`;

    window.open(`https://wa.me/${tenant.phone}?text=${encodeURIComponent(message)}`);
  };

  return (
    <div className="space-y-4">
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-destructive/10 p-2 px-4 rounded-lg border border-destructive/20 animate-in fade-in slide-in-from-top-2">
          <span className="text-sm font-bold text-destructive">{selectedIds.length} selected</span>
          <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-2">
            <Trash2 className="h-4 w-4" /> Delete Selected
          </Button>
        </div>
      )}

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={selectedIds.length === bills.length && bills.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Month</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.map((bill: any) => (
              <TableRow key={bill.id} className={selectedIds.includes(bill.id) ? "bg-muted/50" : ""}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(bill.id)}
                    onCheckedChange={() => toggleSelect(bill.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{bill.billing_month}</TableCell>
                <TableCell>{bill.tenants.name}</TableCell>
                <TableCell>{bill.tenants.flats.flat_code}</TableCell>
                <TableCell className="font-bold">₹{bill.total_amount.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant={bill.status === 'Paid' ? 'default' : 'outline'} className={bill.status === 'Due' ? "border-amber-500 text-amber-600" : ""}>
                      {bill.status || (bill.is_paid ? "Paid" : "Due")}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => sendWhatsAppInvoice(bill)}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <BillViewButton bill={bill} tenant={bill.tenants} owner={owner} />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => updateBillStatus(bill.id, 'Paid')}>Mark as Paid</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateBillStatus(bill.id, 'Advance Paid')}>Mark as Advance Paid</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateBillStatus(bill.id, 'Due')}>Mark as Due</DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={async () => {
                            if (!confirm("Delete this bill?")) return;
                            try { await deleteBills([bill.id]); toast.success("Bill deleted"); }
                            catch (err: any) { toast.error(err.message); }
                          }}
                        >
                          Delete Bill
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
