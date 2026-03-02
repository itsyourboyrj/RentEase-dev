"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Calculator, AlertCircle } from "lucide-react";
import { createBill, saveInvoiceUrl } from "@/app/billing/actions";
import { pdf } from "@react-pdf/renderer";
import { toast } from "sonner";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/billing/invoice-pdf";

function getLocalDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function NewBillModal({ tenants, owner }: { tenants: any[], owner: any }) {
  const [open, setOpen] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [prevReading, setPrevReading] = useState(0);
  const [currReading, setCurrReading] = useState(0);
  const [generatedBill, setGeneratedBill] = useState<any>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [billingMonth, setBillingMonth] = useState(getLocalDateString().slice(0, 7));
  const supabase = createClient();

  const tenant = tenants.find(t => t.id === selectedTenantId);

  // Auto-fetch the correct starting meter reading + check for duplicates when tenant/month changes
  useEffect(() => {
    if (!selectedTenantId) return;

    let cancelled = false;

    async function getLatestReadingAndCheckDuplicate() {
      try {
        // Fetch latest reading
        const { data: lastBill, error } = await supabase
          .from('bills')
          .select('current_reading')
          .eq('tenant_id', selectedTenantId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (cancelled) return;

        if (error && error.code !== 'PGRST116') {
          console.error('Failed to fetch latest reading:', error.message);
          return;
        }

        if (lastBill) {
          setPrevReading(lastBill.current_reading);
        } else {
          const t = tenants.find(t => t.id === selectedTenantId);
          setPrevReading(t?.initial_meter_reading || 0);
        }

        // Check for duplicate bill
        if (billingMonth) {
          const { data: existing } = await supabase
            .from('bills')
            .select('id')
            .eq('tenant_id', selectedTenantId)
            .eq('billing_month', billingMonth)
            .limit(1)
            .maybeSingle();

          if (!cancelled) {
            setIsDuplicate(!!existing);
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Unexpected error fetching meter reading:', err);
        }
      }
    }

    setCurrReading(0);
    getLatestReadingAndCheckDuplicate();

    return () => { cancelled = true; };
  }, [selectedTenantId, billingMonth, supabase, tenants]);

  // Auto-calculate
  const units = Math.max(0, currReading - prevReading);
  const elecRate = tenant?.flats?.buildings?.electricity_rate || 8;
  const elecAmount = units * elecRate;
  const rentAmount = tenant?.flats?.rent_amount || 0;
  const totalAmount = elecAmount + rentAmount;

  async function handleSubmit(formData: FormData) {
    if (!owner?.upi_id) {
      toast.error("Please set your UPI ID in Settings first.");
      return;
    }

    try {
      // 1. Create the bill record
      const bill = await createBill(formData);

      // 2. Generate PDF and upload in background
      try {
        if (!tenant) {
          setGeneratedBill(bill);
          toast.success("Bill generated! (Could not identify tenant for PDF upload)");
          return;
        }

        const doc = <InvoicePDF bill={bill} tenant={tenant} owner={owner} />;
        const blob = await pdf(doc).toBlob();
        const file = new File([blob], `invoice-${bill.id}.pdf`, { type: 'application/pdf' });

        // 3. Upload to Supabase Storage
        const filePath = `${tenant.id}/${bill.id}.pdf`;
        const { error: uploadError } = await supabase.storage
          .from('invoices')
          .upload(filePath, file, { upsert: true });

        if (uploadError) {
          console.error('PDF upload failed:', uploadError.message);
          setGeneratedBill(bill);
          toast.success("Bill generated! (PDF upload failed — you can still download it)");
          return;
        }

        // 4. Get public URL and save to DB
        const { data: { publicUrl } } = supabase.storage
          .from('invoices')
          .getPublicUrl(filePath);

        await saveInvoiceUrl(bill.id, publicUrl);
        setGeneratedBill({ ...bill, pdf_url: publicUrl });
        toast.success("Bill generated and saved to cloud!");
      } catch (uploadErr) {
        // Bill was created but PDF upload failed — still show success
        console.error('PDF upload failed:', uploadErr);
        setGeneratedBill(bill);
        toast.success("Bill generated! (PDF upload failed — you can still download it)");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  const upiPayLink = owner?.upi_id && owner?.full_name && generatedBill?.total_amount != null
    ? `upi://pay?pa=${encodeURIComponent(owner.upi_id)}&pn=${encodeURIComponent(owner.full_name)}&am=${encodeURIComponent(generatedBill.total_amount)}&cu=INR`
    : '';

  const whatsappMessage =
    `*Rent Invoice / किराया चालान*\n\n` +
    `Hi ${tenant?.name}, your rent for ${generatedBill?.billing_month} is ₹${generatedBill?.total_amount}.\n` +
    `नमस्ते ${tenant?.name}, ${generatedBill?.billing_month} के लिए आपका किराया ₹${generatedBill?.total_amount} है।\n\n` +
    (upiPayLink ? `*Pay Now / अभी भुगतान करें:* ${upiPayLink}\n\n` : '') +
    `Thank you! / धन्यवाद!`;

  const phone = tenant?.phone ? tenant.phone.replace(/\D/g, '').replace(/^\+/, '') : '';
  const whatsappUrl = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}` : '';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-amber-600 hover:bg-amber-700">
          <Plus className="mr-2 h-4 w-4" /> Generate Bill
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Monthly Bill</DialogTitle>
        </DialogHeader>

        {!generatedBill ? (
          <form action={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Select Tenant</Label>
              <Select name="tenant_id" onValueChange={setSelectedTenantId} required>
                <SelectTrigger><SelectValue placeholder="Select Tenant" /></SelectTrigger>
                <SelectContent>
                  {tenants.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name} ({t.flats.flat_code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Billing Month</Label>
                <Input name="billing_month" type="month" value={billingMonth} onChange={(e) => setBillingMonth(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Rent (₹)</Label>
                <Input name="rent_amount" value={rentAmount} readOnly className="bg-muted" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Period Start Date</Label>
                <Input name="billing_start_date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label>Period End Date</Label>
                <Input name="billing_end_date" type="date" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Reading Date*</Label>
              <Input
                name="current_reading_date"
                type="date"
                defaultValue={getLocalDateString()}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4 bg-primary/5 p-4 rounded-xl border border-primary/10">
              <div className="space-y-2">
                <Label className="text-primary font-bold">Previous Reading (Auto)</Label>
                <Input
                  name="previous_reading"
                  value={prevReading}
                  readOnly
                  className="bg-background font-bold text-lg border-primary/20"
                  onChange={() => {}}
                />
                <p className="text-[10px] text-muted-foreground uppercase font-medium">Pulled from last month</p>
              </div>
              <div className="space-y-2">
                <Label>Final Reading*</Label>
                <Input
                  name="current_reading"
                  type="number"
                  step="0.01"
                  placeholder="Enter current"
                  className="text-lg font-bold"
                  required
                  value={currReading || ""}
                  onChange={(e) => {
                    const parsed = parseFloat(e.target.value);
                    setCurrReading(Number.isFinite(parsed) ? parsed : 0);
                  }}
                />
              </div>
            </div>

            <div className="p-4 bg-primary/5 rounded-lg space-y-2 border border-primary/20">
              <div className="flex justify-between text-sm">
                <span>Electricity ({units} units × ₹{elecRate})</span>
                <span>₹{elecAmount}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total Amount</span>
                <span>₹{totalAmount}</span>
              </div>
              <input type="hidden" name="electricity_amount" value={elecAmount} />
              <input type="hidden" name="total_amount" value={totalAmount} />
            </div>

            {isDuplicate && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold">
                <AlertCircle className="h-5 w-5 shrink-0" />
                Bill already exists for this month. Delete the old one to re-generate.
              </div>
            )}

            <Button type="submit" disabled={isDuplicate} className="w-full h-14">
              {isDuplicate ? "DUPLICATE DETECTED" : "GENERATE INVOICE"}
            </Button>
          </form>
        ) : (
          <div className="py-6 text-center space-y-4">
            <div className="flex justify-center"><Calculator className="h-12 w-12 text-green-500" /></div>
            <h3 className="text-xl font-bold">Bill Generated!</h3>
            <div className="flex flex-col gap-2">
              <PDFDownloadLink
                document={<InvoicePDF bill={generatedBill} tenant={tenant} owner={owner} />}
                fileName={`Invoice_${tenant?.name ?? "Tenant"}_${generatedBill?.billing_month ?? "bill"}.pdf`}
              >
                {({ loading }) => (
                  <Button className="w-full" variant="outline">
                    {loading ? "Preparing PDF..." : "Download PDF Invoice"}
                  </Button>
                )}
              </PDFDownloadLink>

              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!whatsappUrl}
                onClick={() => whatsappUrl && window.open(whatsappUrl)}
              >
                Share via WhatsApp
              </Button>

              <Button variant="ghost" onClick={() => { setGeneratedBill(null); setOpen(false); }}>
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
