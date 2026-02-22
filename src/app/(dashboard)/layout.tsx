import { Sidebar } from "@/components/layout/sidebar";
import { LanguageProvider } from "@/lib/language-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile Header: Provides spacing so menu button doesn't float over data */}
          <header className="lg:hidden h-16 border-b flex items-center px-16 bg-background/80 backdrop-blur-md z-40">
            <span className="font-bold text-primary italic">RentEase</span>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 relative">
            {children}
          </main>
        </div>
      </div>
    </LanguageProvider>
  );
}
