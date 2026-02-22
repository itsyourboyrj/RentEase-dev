"use client";

import dynamic from "next/dynamic";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { InvoicePDF } from "./invoice-pdf";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then(mod => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Loading PDF viewer...
      </div>
    ),
  }
);

export function BillViewButton({ bill, tenant, owner }: any) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="View invoice">
          <Eye className="h-4 w-4" />
        </Button>
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
