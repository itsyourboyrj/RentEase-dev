"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/billing/invoice-pdf";
import { BillViewButton } from "@/components/billing/bill-view-button";
import { updateBillStatus } from "@/app/billing/actions";
import { FileDown, ChevronDown } from "lucide-react";
import { toast } from "sonner";

export function BillRowActions({ bill, owner }: { bill: any; owner: any }) {
  const [pending, setPending] = useState(false);

  async function handleStatus(newStatus: string) {
    setPending(true);
    try {
      await updateBillStatus(bill.id, newStatus);
      toast.success(`Marked as ${newStatus}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex justify-end gap-2">
      {/* PDF Preview */}
      <BillViewButton bill={bill} tenant={bill.tenants} owner={owner} />

      {/* PDF Download */}
      <PDFDownloadLink
        document={<InvoicePDF bill={bill} tenant={bill.tenants} owner={owner} />}
        fileName={`Invoice_${bill.tenants.name}_${bill.billing_month}.pdf`}
      >
        {({ loading }) => (
          <Button variant="outline" size="sm" disabled={loading}>
            <FileDown className="h-4 w-4" />
          </Button>
        )}
      </PDFDownloadLink>

      {/* Status Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={pending}>
            Options <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleStatus("Paid")}>
            Mark as Paid
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatus("Advance Paid")}>
            Mark as Advance Paid
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatus("Due")}>
            Mark as Due
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
