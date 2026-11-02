import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { LanguageProvider } from "@/lib/language-context";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <div className="flex h-dvh min-h-0 overflow-hidden gradient-bg text-foreground">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <header className="lg:hidden h-14 shrink-0 flex items-center px-14 bg-white/75 backdrop-blur-xl border-b border-white/80 z-40 dark:bg-slate-950/75 dark:border-white/10">
            <Link href="/" className="font-semibold text-foreground tracking-tight text-lg">RentEase</Link>
          </header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 relative z-10 pb-14">
            <Suspense fallback={
              <div className="h-full w-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
              </div>
            }>
              {children}
            </Suspense>
          </main>
        </div>
      </div>
    </LanguageProvider>
  );
}
