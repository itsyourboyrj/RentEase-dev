"use client";

import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { PDFViewer, pdf } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CollectionReportPDF } from "@/components/billing/collection-report-pdf";

export function CollectionReportButton({ bills, billingMonth }: { bills: any[]; billingMonth: string }) {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileName = "RentEase_Collection_Report_" + billingMonth + ".pdf";

  const generatePdf = () => pdf(<CollectionReportPDF bills={bills} billingMonth={billingMonth} />).toBlob();

  const downloadReport = async () => {
    setIsGenerating(true);
    try {
      const blob = await generatePdf();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error("Collection report PDF generation failed:", error);
      toast.error("Could not generate the collection report PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  const previewOnMobile = async () => {
    setIsGenerating(true);
    try {
      const blob = await generatePdf();
      const url = URL.createObjectURL(blob);
      const preview = window.open(url, "_blank");
      if (!preview) {
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.info("Preview was blocked, so the report was downloaded.");
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      console.error("Collection report PDF generation failed:", error);
      toast.error("Could not open the collection report PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Button
        onClick={previewOnMobile}
        variant="ghost"
        size="sm"
        className="lg:hidden rounded-xl text-xs font-medium text-muted-foreground"
        disabled={isGenerating || bills.length === 0}
      >
        {isGenerating ? <Loader2 className="animate-spin" /> : null}
        <FileText className="h-4 w-4" /> View report
      </Button>
      <Button
        onClick={() => setOpen(true)}
        variant="ghost"
        size="sm"
        className="hidden lg:inline-flex rounded-xl text-xs font-medium text-muted-foreground"
        disabled={bills.length === 0}
      >
        <FileText className="h-4 w-4" /> View report
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden border-none bg-zinc-900">
          <DialogHeader className="p-4 bg-background border-b flex-row items-center justify-between pr-12">
            <DialogTitle>Collection Report - {billingMonth}</DialogTitle>
            <Button onClick={downloadReport} disabled={isGenerating} size="sm" variant="outline">
              {isGenerating ? <Loader2 className="animate-spin" /> : <Download />}
              Download PDF
            </Button>
          </DialogHeader>
          <div className="flex-1 min-h-0 w-full bg-muted">
            {open && (
              <PDFViewer width="100%" height="100%" showToolbar className="border-none">
                <CollectionReportPDF bills={bills} billingMonth={billingMonth} />
              </PDFViewer>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
