"use client";

import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { deleteEntity } from "@/app/actions/shared";
import { toast } from "sonner";

export function DeleteButton({ table, id, label }: { table: string; id: string; label: string }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await deleteEntity(table, id);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(`${label} deleted successfully`);
        setOpen(false);
        window.location.reload();
      }
    } catch {
      toast.error("Failed to delete. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors h-8 w-8">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-[32px] border-none shadow-2xl p-8">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-black tracking-tighter">Delete {label}?</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-500 font-medium">
            This action cannot be undone. This will permanently remove the data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel disabled={loading} className="rounded-2xl border-none bg-slate-100 font-bold">Cancel</AlertDialogCancel>
          <Button onClick={handleDelete} disabled={loading} className="rounded-2xl bg-red-500 hover:bg-red-600 font-bold">
            {loading ? <Loader2 className="animate-spin" /> : "Delete Forever"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
