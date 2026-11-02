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
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-full h-8 w-8">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-3xl shadow-2xl p-6">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-semibold tracking-tight">Delete {label}?</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            This action cannot be undone. This will permanently remove the data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel disabled={loading} className="rounded-xl bg-muted font-medium">Cancel</AlertDialogCancel>
          <Button onClick={handleDelete} disabled={loading} variant="destructive" className="rounded-xl font-medium">
            {loading ? <Loader2 className="animate-spin" /> : "Delete Forever"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
