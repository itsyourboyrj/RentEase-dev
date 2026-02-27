"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Building2, DoorOpen, Users,
  Receipt, Settings, LogOut, Menu
} from "lucide-react";
import { signout } from "@/app/auth/actions";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLanguage } from "@/components/language-provider";
import { translations } from "@/lib/translations";
import { createClient } from "@/lib/supabase/client";

type NavItem = { name: string; href: string; icon: React.ElementType };
type Owner = { full_name?: string | null; profile_url?: string | null } | null;

function NavContent({ navItems, pathname, owner, lang }: {
  navItems: NavItem[];
  pathname: string;
  owner: Owner;
  lang: string;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-white/20 px-6">
        <Link href="/" className="flex items-center gap-2 font-black italic tracking-tighter text-primary">
          <div className="bg-primary text-white p-1 rounded-lg">
            <Building2 className="h-5 w-5" />
          </div>
          <span className="text-xl">RentEase</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300",
              isActive
                ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                : "hover:bg-white/60 text-slate-500 hover:text-primary"
            )}>
              <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-400")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/20 p-4 space-y-3">
        {/* Admin Profile */}
        <Link href="/settings" className="flex items-center gap-3 p-2 bg-white/40 rounded-2xl hover:bg-white/60 transition-colors">
          <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold overflow-hidden shrink-0">
            {owner?.profile_url
              ? <img src={owner.profile_url} className="h-full w-full object-cover" alt={owner?.full_name || "Owner avatar"} />
              : <span aria-hidden="true">{owner?.full_name?.[0]?.toUpperCase() || "A"}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{owner?.full_name || "Admin"}</p>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{lang === "hi" ? "मालिक" : "Owner"}</p>
          </div>
        </Link>
        {/* Logout */}
        <form action={signout}>
          <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="h-5 w-5" /> {lang === "hi" ? "लॉग आउट" : "Logout"}
          </button>
        </form>
      </div>
    </div>
  );
}

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const t = translations[lang as keyof typeof translations];
  const [owner, setOwner] = useState<Owner>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();
    async function loadOwner() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase.from("owners").select("full_name, profile_url").eq("id", user.id).single();
          if (data) setOwner(data);
        }
      } catch (err) {
        console.error('Failed to load owner profile:', err);
      }
    }
    loadOwner();
  }, []);

  const navItems: NavItem[] = [
    { name: t.dashboard, href: "/", icon: LayoutDashboard },
    { name: t.buildings, href: "/buildings", icon: Building2 },
    { name: t.flats, href: "/flats", icon: DoorOpen },
    { name: t.tenants, href: "/tenants", icon: Users },
    { name: t.billing, href: "/billing", icon: Receipt },
    { name: t.settings, href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn("hidden lg:flex h-full w-64 flex-col glass-sidebar", className)}>
        <NavContent navItems={navItems} pathname={pathname} owner={owner} lang={lang} />
      </div>

      {/* Mobile Trigger — client-only to prevent Radix ID hydration mismatch */}
      {mounted && (
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <Sheet>
            <SheetTrigger asChild>
              <button aria-label="Open menu" className="p-2 bg-primary text-white rounded-md shadow-lg">
                <Menu />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <NavContent navItems={navItems} pathname={pathname} owner={owner} lang={lang} />
            </SheetContent>
          </Sheet>
        </div>
      )}
    </>
  );
}
