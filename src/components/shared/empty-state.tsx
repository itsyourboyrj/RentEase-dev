import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export function BoutiqueEmptyState({
  icon: Icon,
  title,
  description,
  buttonText,
  href
}: {
  icon: any,
  title: string,
  description: string,
  buttonText?: string,
  href?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/20 blur-[50px] rounded-full" />
        <div className="relative h-24 w-24 glass-card rounded-[32px] flex items-center justify-center text-primary shadow-2xl">
          <Icon className="h-10 w-10" />
        </div>
      </div>

      <h3 className="text-3xl font-black tracking-tighter mb-3">{title}</h3>
      <p className="text-slate-500 max-w-[300px] font-medium leading-relaxed mb-8">
        {description}
      </p>

      {buttonText && href && (
        <Button asChild className="rounded-2xl bg-primary hover:scale-105 transition-all shadow-xl shadow-primary/20 h-12 px-8 font-bold">
          <Link href={href}>
            <Plus className="mr-2 h-5 w-5" /> {buttonText}
          </Link>
        </Button>
      )}
    </div>
  );
}
