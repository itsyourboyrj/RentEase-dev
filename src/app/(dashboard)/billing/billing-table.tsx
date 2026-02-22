"use client";

import { useState, useEffect } from "react";
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

  // Keep selection in sync when bills change
  useEffect(() => {
    const validIds = new Set(bills.map((b: any) => b.id));
    setSelectedIds(prev => prev.filter(id => validIds.has(id)));
  }, [bills]);

  const toggleSelectAll = () => {
    const allIds = bills.map((b: any) => b.id);
    if (selectedIds.length === bills.length) setSelectedIds([]);
    else setSelectedIds(allIds);
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
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleUpdateStatus(id: string, status: string) {
    try {
      await updateBillStatus(id, status);
      toast.success(`Marked as ${status}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  }

  const sendWhatsAppInvoice = (bill: any) => {
    const tenant = bill.tenants;

    if (!tenant?.phone) {
      toast.error("Tenant phone number is not available.");
      return;
    }
    if (!owner?.upi_id) {
      toast.error("UPI ID is not configured. Please update your settings.");
      return;
    }
    if (!Number.isFinite(bill.total_amount)) {
      toast.error("Bill amount is invalid.");
      return;
    }

    // Normalize phone: digits only, no leading +
    const phone = tenant.phone.replace(/\D/g, '').replace(/^\+/, '');

    const formattedAmount = bill.total_amount.toLocaleString('en-IN');
    const upiLink = `upi://pay?pa=${encodeURIComponent(owner.upi_id)}&pn=${encodeURIComponent(owner.full_name ?? '')}&am=${encodeURIComponent(bill.total_amount)}&cu=INR`;

    const message =
      `*Rent Invoice / किराया चालान*\n\n` +
      `Hi ${tenant.name}, your rent for ${bill.billing_month} is *₹${formattedAmount}*.\n` +
      `नमस्ते ${tenant.name}, ${bill.billing_month} के लिए आपका किराया *₹${formattedAmount}* है।\n\n` +
      `*UPI ID:* ${owner.upi_id}\n\n` +
      `Click below to view/pay:\n` +
      upiLink;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
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
            {bills.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  No bills generated yet.
                </TableCell>
              </TableRow>
            ) : bills.map((bill: any) => (
              <TableRow key={bill.id} className={selectedIds.includes(bill.id) ? "bg-muted/50" : ""}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(bill.id)}
                    onCheckedChange={() => toggleSelect(bill.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{bill.billing_month}</TableCell>
                <TableCell>{bill.tenants?.name}</TableCell>
                <TableCell>{bill.tenants?.flats?.flat_code}</TableCell>
                <TableCell className="font-bold">{Number.isFinite(bill.total_amount) ? `₹${bill.total_amount.toLocaleString('en-IN')}` : "—"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant={bill.status === 'Paid' ? 'default' : 'outline'} className={bill.status === 'Due' ? "border-amber-500 text-amber-600" : ""}>
                      {bill.status || (bill.is_paid ? "Paid" : "Due")}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                      aria-label="Send WhatsApp invoice"
                      disabled={!Number.isFinite(bill.total_amount)}
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
                        <DropdownMenuItem onClick={() => handleUpdateStatus(bill.id, 'Paid')}>Mark as Paid</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(bill.id, 'Advance Paid')}>Mark as Advance Paid</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(bill.id, 'Due')}>Mark as Due</DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={async () => {
                            if (!confirm("Delete this bill?")) return;
                            try { await deleteBills([bill.id]); toast.success("Bill deleted"); }
                            catch (err: unknown) { toast.error(err instanceof Error ? err.message : String(err)); }
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
