"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { PDFViewer } from "@react-pdf/renderer";
import { InvoicePDF } from "./invoice-pdf";

export function BillViewButton({ bill, tenant, owner }: any) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh]">
        <DialogHeader>
          <DialogTitle>Invoice Preview</DialogTitle>
        </DialogHeader>
        <PDFViewer width="100%" height="100%" style={{ borderRadius: 8 }}>
          <InvoicePDF bill={bill} tenant={tenant} owner={owner} />
        </PDFViewer>
      </DialogContent>
    </Dialog>
  );
}
