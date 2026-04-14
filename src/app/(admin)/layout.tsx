"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Star,
  Settings,
  FolderOpen,
  Mail,
  BarChart3,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/categorias", label: "Categorias", icon: FolderOpen },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/resenas", label: "Resenas", icon: Star },
  { href: "/admin/mensajes", label: "Mensajes", icon: Mail },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="animate-spin h-8 w-8 border-4 border-hanna-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session || (session.user as any)?.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-cream-900 mb-2">
            Acceso Denegado
          </h1>
          <p className="text-cream-500 mb-4">
            Necesitas permisos de administrador para acceder.
          </p>
          <Link
            href="/iniciar-sesion"
            className="text-hanna-600 font-medium hover:underline"
          >
            Iniciar sesion como admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-cream-900 text-cream-300 flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-5 border-b border-cream-800">
          <Link href="/admin" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Hanna" width={100} height={36} className="brightness-0 invert opacity-80" />
          </Link>
          <p className="text-xs text-cream-500 mt-1">Panel de Administracion</p>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {ADMIN_NAV.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-hanna-600 text-white"
                    : "text-cream-400 hover:bg-cream-800 hover:text-white"
                )}
              >
                <item.icon className="h-4.5 w-4.5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-cream-800 space-y-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-hanna-600 flex items-center justify-center text-white text-xs font-bold">
              {session.user?.name?.[0] || "A"}
            </div>
            <div className="text-xs">
              <p className="text-cream-200 font-medium">{session.user?.name}</p>
              <p className="text-cream-500">Admin</p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-cream-400 hover:bg-cream-800 hover:text-white transition-colors"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Ver Tienda
          </Link>
          <button
            onClick={() => {
              import("next-auth/react").then((m) => m.signOut({ callbackUrl: "/" }));
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors w-full cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            Cerrar Sesion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
