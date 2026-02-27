import { Sidebar } from "@/components/layout/sidebar";
import { LanguageProvider } from "@/lib/language-context";
import { Footer } from "@/components/shared/footer";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <div className="flex h-screen overflow-hidden gradient-bg text-slate-900">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Decorative background orbs */}
          <div className="absolute top-[-10%] right-[-5%] w-[30%] h-[30%] bg-purple-200/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[10%] left-[-5%] w-[20%] h-[20%] bg-blue-200/20 rounded-full blur-[100px] pointer-events-none" />

          {/* Mobile Glass Header */}
          <header className="lg:hidden h-16 flex items-center px-16 bg-white/40 backdrop-blur-md border-b border-white/20 z-40">
            <Link href="/" className="font-black text-primary tracking-tighter italic text-xl">RentEase</Link>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 relative z-10">
            {children}
            <Footer />
          </main>
        </div>
      </div>
    </LanguageProvider>
  );
}
