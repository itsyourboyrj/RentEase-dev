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
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative mb-5">
        <div className="relative h-16 w-16 glass-card rounded-2xl flex items-center justify-center text-primary shadow-sm">
          <Icon className="h-7 w-7" />
        </div>
      </div>

      <h3 className="text-2xl font-semibold tracking-tight mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-[340px] leading-relaxed mb-6">
        {description}
      </p>

      {buttonText && href && (
        <Button asChild className="rounded-xl h-11 px-6 font-medium shadow-sm shadow-primary/20">
          <Link href={href}>
            <Plus className="mr-2 h-5 w-5" /> {buttonText}
          </Link>
        </Button>
      )}
    </div>
  );
}
