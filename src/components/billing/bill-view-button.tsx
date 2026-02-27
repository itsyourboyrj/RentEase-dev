"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Loader2 } from "lucide-react";
import { PDFViewer, pdf } from "@react-pdf/renderer"; // Added 'pdf' for manual generation
import { InvoicePDF } from "./invoice-pdf";
import { toast } from "sonner";

export function BillViewButton({ bill, tenant, owner }: any) {
  const [isGenerating, setIsGenerating] = useState(false);

  // Function to handle mobile viewing
  const handleViewMobile = async () => {
    setIsGenerating(true);
    try {
      // Generate the PDF as a blob
      const doc = <InvoicePDF bill={bill} tenant={tenant} owner={owner} />;
      const blob = await pdf(doc).toBlob();

      // Create a URL and open in a new tab
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');

      if (!win) {
        // Popup blocked — fallback to download
        const a = document.createElement('a');
        a.href = url;
        a.download = `Invoice_${tenant?.name ?? 'bill'}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.info("Popup blocked — downloading PDF instead.");
      }

      // Cleanup the URL after a few seconds
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (error) {
      console.error("PDF generation failed", error);
      toast.error("Could not open PDF on this device");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex gap-1">
      {/* MOBILE ONLY BUTTON: Opens in new tab */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden h-8 w-8"
        onClick={handleViewMobile}
        disabled={isGenerating}
      >
        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
      </Button>

      {/* DESKTOP ONLY BUTTON: Opens nice Modal */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="hidden lg:flex h-8 w-8">
            <Eye className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden border-none bg-zinc-900">
          <DialogHeader className="p-4 bg-background border-b">
            <DialogTitle className="flex items-center gap-2">
                Invoice Preview - {tenant.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 w-full h-full bg-muted">
            <PDFViewer width="100%" height="100%" showToolbar={true} className="border-none">
              <InvoicePDF bill={bill} tenant={tenant} owner={owner} />
            </PDFViewer>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
