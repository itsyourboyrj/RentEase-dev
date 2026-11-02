"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Loader2, Check } from "lucide-react";
import { updateFlatStatus } from "@/app/flats/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const statuses = [
  { label: "Vacant", value: "Vacant", color: "bg-emerald-500", text: "text-emerald-800 dark:text-emerald-200", light: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-300 dark:border-emerald-800" },
  { label: "Booked", value: "Booked", color: "bg-amber-500", text: "text-amber-800 dark:text-amber-200", light: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-300 dark:border-amber-800" },
  { label: "Occupied", value: "Occupied", color: "bg-blue-500", text: "text-blue-800 dark:text-blue-200", light: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-300 dark:border-blue-800" },
];

export function EditStatusModal({ flat }: { flat: any }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: string) => {
    setLoading(newStatus);
    try {
      await updateFlatStatus(flat.id, newStatus);
      toast.success(`Flat ${flat.flat_code} marked as ${newStatus}`);
      setOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10">
          <Pencil className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[320px] p-0 overflow-hidden rounded-2xl shadow-2xl">
        <DialogHeader className="p-4 border-b bg-muted/30">
          <DialogTitle className="text-base font-semibold">
            Update status · {flat.flat_code}
          </DialogTitle>
        </DialogHeader>
        <div className="p-3 grid gap-2">
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => handleStatusChange(s.value)}
              disabled={!!loading}
              className={cn(
                "flex items-center justify-between w-full p-3 rounded-xl transition-colors duration-150 font-medium text-sm border",
                flat.status === s.value
                  ? `${s.light} ${s.border} ${s.text}`
                  : "bg-background border-border hover:bg-muted"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn("h-3 w-3 rounded-full shadow-sm", s.color)} />
                {s.label}
              </div>
              {loading === s.value ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : flat.status === s.value ? (
                <Check className="h-4 w-4" />
              ) : null}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
