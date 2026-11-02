"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export function OnboardingWizard({ buildingCount }: { buildingCount: number }) {
  const { owner, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && owner) {
      const isProfileIncomplete = !owner.full_name || !owner.phone;
      const hasNoBuildings = buildingCount === 0;

      if ((isProfileIncomplete || hasNoBuildings) && pathname !== "/settings") {
        setOpen(true);
      } else {
        setOpen(false);
      }
    }
  }, [owner, loading, buildingCount, pathname]);

  const isProfileIncomplete = !owner?.full_name || !owner?.phone;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[450px] bg-white/85 dark:bg-slate-900/90 backdrop-blur-2xl p-7 sm:p-8 rounded-3xl shadow-2xl">
        <div className="flex justify-center mb-5">
          <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>

        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            {isProfileIncomplete ? "Welcome to RentEase" : "Add your first building"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-base pt-2 leading-relaxed">
            {isProfileIncomplete
              ? "Add your landlord details to start managing properties and preparing invoices."
              : "Your profile is ready. Add a building to organize flats and residents."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-8 space-y-3">
          <Button
            className="w-full h-12 rounded-xl font-medium shadow-sm shadow-primary/20"
            onClick={() => {
              setOpen(false);
              router.push(isProfileIncomplete ? "/settings" : "/buildings");
            }}
          >
            {isProfileIncomplete ? "Complete My Profile" : "Add My First Building"}
            <ArrowRight className="h-5 w-5" />
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Estimated time: 1 minute
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
