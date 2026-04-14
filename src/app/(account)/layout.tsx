"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, Settings } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";

const ACCOUNT_NAV = [
  { label: "Mi Cuenta", href: "/mi-cuenta", icon: User },
  { label: "Mis Pedidos", href: "/mi-cuenta/pedidos", icon: Package },
  { label: "Mi Perfil", href: "/mi-cuenta/perfil", icon: Settings },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display text-2xl font-bold text-cream-900 mb-6">
          Mi Cuenta
        </h1>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <nav className="bg-white rounded-2xl border border-cream-200 overflow-hidden">
              {ACCOUNT_NAV.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-5 py-3.5 text-sm font-medium border-b border-cream-100 last:border-b-0 transition-colors",
                      isActive
                        ? "bg-hanna-50 text-hanna-600 border-l-4 border-l-hanna-500"
                        : "text-cream-700 hover:bg-cream-50 hover:text-hanna-600"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
      <Footer />
    </>
  );
}
