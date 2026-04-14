"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Menu, X, ShoppingCart, User, Search, LogOut, Package,
  Settings, Shield, ChevronDown, Cpu, House, Shirt, Dumbbell,
  Sparkles, Gamepad2, ArrowRight, Heart, MapPin,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";
import { SITE_NAME } from "@/lib/constants";
import { useCartStore } from "@/stores/cart-store";

// Category tabs for the secondary nav
const CATEGORY_TABS = [
  { label: "Tecnologia", href: "/categorias/tecnologia", icon: Cpu },
  { label: "Moda", href: "/categorias/moda", icon: Shirt },
  { label: "Hogar", href: "/categorias/hogar", icon: House },
  { label: "Deportes", href: "/categorias/deportes", icon: Dumbbell },
  { label: "Belleza", href: "/categorias/belleza", icon: Sparkles },
  { label: "Juguetes", href: "/categorias/juguetes", icon: Gamepad2 },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const totalItems = useCartStore((s) => s.totalItems());
  const openCart = useCartStore((s) => s.openCart);
  const { data: session, status } = useSession();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = status === "authenticated" && !!session?.user;
  const isAdmin = isLoggedIn && (session.user as any)?.role === "ADMIN";
  const userName = session?.user?.name || "Usuario";

  useEffect(() => {
    const h = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setIsUserMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/productos?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  }

  return (
    <>
      {/* ===== TOP BAR (announcement) ===== */}
      <div className="bg-cream-900 text-white py-1.5 text-center text-[11px] font-medium tracking-wide">
        <span className="text-gold-400">Envio GRATIS</span> en pedidos mayores a S/150 | Productos 100% originales | Soporte 24/7
      </div>

      {/* ===== MAIN HEADER ===== */}
      <header className={cn(
        "sticky top-0 z-40 bg-white transition-shadow duration-300",
        isScrolled && "shadow-md"
      )}>
        {/* Row 1: Logo + Search + Actions */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16 lg:h-[68px]">
            {/* Mobile menu toggle */}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 -ml-2 text-cream-600 hover:bg-cream-100 rounded-lg cursor-pointer">
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Logo */}
            <Link href="/" className="shrink-0">
              <Image src="/logo.png" alt={SITE_NAME} width={140} height={44} className="h-9 lg:h-11 w-auto object-contain" priority />
            </Link>

            {/* Search bar — desktop */}
            <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-2xl">
              <div className="flex w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos, marcas, categorias..."
                  className="flex-1 px-4 py-2.5 rounded-l-xl border border-r-0 border-cream-300 bg-cream-50 text-sm text-cream-900 placeholder:text-cream-400 focus:outline-none focus:border-hanna-500 focus:bg-white transition-colors"
                />
                <button type="submit" className="px-5 bg-hanna-500 hover:bg-hanna-600 text-white rounded-r-xl transition-colors cursor-pointer flex items-center">
                  <Search className="h-4.5 w-4.5" />
                </button>
              </div>
            </form>

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-2 ml-auto">
              {/* Mobile search */}
              <button onClick={() => router.push("/productos")} className="sm:hidden p-2 text-cream-600 hover:bg-cream-100 rounded-lg cursor-pointer">
                <Search className="h-5 w-5" />
              </button>

              {/* User menu */}
              <div className="relative" ref={userMenuRef}>
                {isLoggedIn ? (
                  <>
                    <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-1.5 p-1.5 rounded-xl hover:bg-cream-100 transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-hanna-500 text-white flex items-center justify-center text-xs font-bold">
                        {getInitials(userName)}
                      </div>
                      <div className="hidden lg:block text-left">
                        <p className="text-[10px] text-cream-400 leading-none">Hola,</p>
                        <p className="text-xs font-semibold text-cream-800 leading-tight truncate max-w-[80px]">{userName.split(" ")[0]}</p>
                      </div>
                      <ChevronDown className={cn("h-3 w-3 text-cream-400 hidden sm:block transition-transform", isUserMenuOpen && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.12 }}
                          className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-cream-200 py-1.5 z-50">
                          <div className="px-4 py-2.5 border-b border-cream-100">
                            <p className="text-sm font-semibold text-cream-900 truncate">{userName}</p>
                            <p className="text-xs text-cream-500 truncate">{session.user?.email}</p>
                          </div>
                          <div className="py-1">
                            <Link href="/mi-cuenta" className="flex items-center gap-3 px-4 py-2 text-sm text-cream-700 hover:bg-cream-50"><User className="h-4 w-4 text-cream-400" /> Mi Cuenta</Link>
                            <Link href="/mi-cuenta/pedidos" className="flex items-center gap-3 px-4 py-2 text-sm text-cream-700 hover:bg-cream-50"><Package className="h-4 w-4 text-cream-400" /> Mis Pedidos</Link>
                            <Link href="/mi-cuenta/perfil" className="flex items-center gap-3 px-4 py-2 text-sm text-cream-700 hover:bg-cream-50"><Settings className="h-4 w-4 text-cream-400" /> Mi Perfil</Link>
                            <Link href="/contacto" className="flex items-center gap-3 px-4 py-2 text-sm text-cream-700 hover:bg-cream-50"><Heart className="h-4 w-4 text-cream-400" /> Ayuda</Link>
                          </div>
                          {isAdmin && (
                            <div className="border-t border-cream-100 py-1">
                              <Link href="/admin" className="flex items-center gap-3 px-4 py-2 text-sm text-hanna-600 font-medium hover:bg-hanna-50"><Shield className="h-4 w-4" /> Panel Admin</Link>
                            </div>
                          )}
                          <div className="border-t border-cream-100 py-1">
                            <button onClick={() => signOut({ callbackUrl: "/" })}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full cursor-pointer"><LogOut className="h-4 w-4" /> Cerrar Sesion</button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link href="/iniciar-sesion" className="flex items-center gap-1.5 p-2 rounded-xl hover:bg-cream-100 transition-colors">
                    <User className="h-5 w-5 text-cream-600" />
                    <span className="hidden lg:block text-xs font-medium text-cream-700">Ingresar</span>
                  </Link>
                )}
              </div>

              {/* Cart */}
              <button onClick={openCart} className="relative p-2 text-cream-600 hover:bg-cream-100 rounded-xl transition-colors cursor-pointer">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-hanna-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalItems > 9 ? "9+" : totalItems}
                  </motion.span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Category tabs — desktop */}
        <div className="hidden lg:block border-t border-cream-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-0.5 h-11 overflow-x-auto scrollbar-none">
              <Link href="/productos"
                className={cn("flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold whitespace-nowrap transition-colors",
                  pathname === "/productos" ? "text-hanna-600 bg-hanna-50" : "text-cream-600 hover:text-hanna-600 hover:bg-cream-50"
                )}>
                <LayoutGrid className="h-3.5 w-3.5" />
                Todos
              </Link>
              {CATEGORY_TABS.map((tab) => {
                const isActive = pathname.startsWith(tab.href);
                return (
                  <Link key={tab.href} href={tab.href}
                    className={cn("flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors",
                      isActive ? "text-hanna-600 bg-hanna-50" : "text-cream-600 hover:text-hanna-600 hover:bg-cream-50"
                    )}>
                    <tab.icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </Link>
                );
              })}
              <div className="h-5 w-px bg-cream-200 mx-1" />
              <Link href="/productos?sortBy=price_asc" className="flex items-center gap-1 px-3 py-2 rounded-lg text-[13px] font-medium text-red-500 hover:bg-red-50 whitespace-nowrap">
                Ofertas
              </Link>
              <Link href="/nosotros" className="px-3 py-2 rounded-lg text-[13px] font-medium text-cream-500 hover:text-cream-700 hover:bg-cream-50 whitespace-nowrap">
                Nosotros
              </Link>
              <Link href="/contacto" className="px-3 py-2 rounded-lg text-[13px] font-medium text-cream-500 hover:text-cream-700 hover:bg-cream-50 whitespace-nowrap">
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ===== MOBILE MENU ===== */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, x: -300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl overflow-y-auto lg:hidden">
            <div className="p-4">
              {/* Mobile search */}
              <form onSubmit={handleSearch} className="flex mb-4">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos..."
                  className="flex-1 px-4 py-2.5 rounded-l-xl border border-r-0 border-cream-300 bg-cream-50 text-sm focus:outline-none focus:border-hanna-500" />
                <button type="submit" className="px-4 bg-hanna-500 text-white rounded-r-xl cursor-pointer"><Search className="h-4 w-4" /></button>
              </form>

              {/* User info */}
              {isLoggedIn ? (
                <div className="flex items-center gap-3 p-3 bg-cream-50 rounded-xl mb-4">
                  <div className="w-10 h-10 rounded-full bg-hanna-500 text-white flex items-center justify-center text-sm font-bold">{getInitials(userName)}</div>
                  <div>
                    <p className="text-sm font-semibold text-cream-900">{userName}</p>
                    <p className="text-xs text-cream-500">{session.user?.email}</p>
                  </div>
                </div>
              ) : (
                <Link href="/iniciar-sesion" className="flex items-center gap-3 p-3 bg-hanna-50 rounded-xl mb-4 text-hanna-600 font-medium text-sm">
                  <User className="h-5 w-5" /> Ingresar / Registrarse
                </Link>
              )}

              {/* Categories */}
              <p className="text-[10px] font-bold text-cream-400 uppercase tracking-widest px-1 mb-2">Categorias</p>
              <div className="space-y-0.5 mb-4">
                <Link href="/productos" className="block px-3 py-2.5 rounded-xl text-sm font-medium text-cream-700 hover:bg-cream-50">Todos los Productos</Link>
                {CATEGORY_TABS.map((tab) => (
                  <Link key={tab.href} href={tab.href} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-cream-700 hover:bg-cream-50">
                    <tab.icon className="h-4 w-4 text-cream-400" /> {tab.label}
                  </Link>
                ))}
              </div>

              {/* More links */}
              <div className="border-t border-cream-200 pt-3 space-y-0.5">
                <Link href="/nosotros" className="block px-3 py-2.5 rounded-xl text-sm text-cream-600 hover:bg-cream-50">Nosotros</Link>
                <Link href="/contacto" className="block px-3 py-2.5 rounded-xl text-sm text-cream-600 hover:bg-cream-50">Contacto</Link>
                <Link href="/faq" className="block px-3 py-2.5 rounded-xl text-sm text-cream-600 hover:bg-cream-50">Preguntas Frecuentes</Link>
              </div>

              {isLoggedIn && (
                <div className="border-t border-cream-200 pt-3 mt-3 space-y-0.5">
                  <Link href="/mi-cuenta" className="block px-3 py-2.5 rounded-xl text-sm text-cream-700 hover:bg-cream-50">Mi Cuenta</Link>
                  <Link href="/mi-cuenta/pedidos" className="block px-3 py-2.5 rounded-xl text-sm text-cream-700 hover:bg-cream-50">Mis Pedidos</Link>
                  {isAdmin && <Link href="/admin" className="block px-3 py-2.5 rounded-xl text-sm text-hanna-600 font-medium hover:bg-hanna-50">Panel Admin</Link>}
                  <button onClick={() => signOut({ callbackUrl: "/" })}
                    className="block w-full text-left px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 cursor-pointer">Cerrar Sesion</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </>
  );
}

// Missing icon import workaround
function LayoutGrid(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>
    </svg>
  );
}
