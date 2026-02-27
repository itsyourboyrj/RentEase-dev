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
      <DialogContent className="sm:max-w-[450px] border-none bg-white/80 backdrop-blur-2xl p-8 rounded-[40px] shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 bg-primary/10 rounded-[28px] flex items-center justify-center text-primary">
            <Sparkles className="h-10 w-10 animate-pulse" />
          </div>
        </div>

        <DialogHeader className="text-center">
          <DialogTitle className="text-3xl font-black tracking-tighter">
            {isProfileIncomplete ? "Welcome to RentEase!" : "Let's build your empire"}
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium text-base pt-2 leading-relaxed">
            {isProfileIncomplete
              ? "To start generating professional invoices and managing tenants, let's quickly set up your landlord profile."
              : "Your profile looks great! Now, let's add your first building to get started."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-8 space-y-3">
          <Button
            className="w-full h-14 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 transition-all hover:gap-4 gap-2"
            onClick={() => {
              setOpen(false);
              router.push(isProfileIncomplete ? "/settings" : "/buildings");
            }}
          >
            {isProfileIncomplete ? "Complete My Profile" : "Add My First Building"}
            <ArrowRight className="h-5 w-5" />
          </Button>

          <p className="text-center text-[10px] uppercase tracking-widest font-black text-slate-400">
            Estimated time: 1 minute
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
