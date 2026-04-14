"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Menu, X, ShoppingCart, User, Search, LogOut, Package,
  Settings, Shield, ChevronDown, Cpu, House, Shirt, Dumbbell,
  Sparkles, Gamepad2, LayoutGrid, TrendingUp, BadgePercent,
  BookOpen, Heart, Truck, HelpCircle, Mail, MessageCircle, ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";
import { NAV_LINKS, SITE_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { MEGA_MENU } from "@/lib/mega-menu-data";

// Icon resolver
const ICON_MAP: Record<string, React.ElementType> = {
  Cpu, House, Shirt, Dumbbell, Sparkles, Gamepad2, LayoutGrid,
  TrendingUp, BadgePercent, BookOpen, Heart, Truck, HelpCircle,
  Mail, MessageCircle,
};

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const totalItems = useCartStore((s) => s.totalItems());
  const openCart = useCartStore((s) => s.openCart);
  const { data: session, status } = useSession();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const dropdownTimeout = useRef<NodeJS.Timeout>(undefined);

  const isLoggedIn = status === "authenticated" && !!session?.user;
  const isAdmin = isLoggedIn && (session.user as any)?.role === "ADMIN";
  const userName = session?.user?.name || "Usuario";

  useEffect(() => {
    const h = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleDropdownEnter(href: string) {
    clearTimeout(dropdownTimeout.current);
    setActiveDropdown(href);
  }
  function handleDropdownLeave() {
    dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 200);
  }

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-cream-200"
            : "bg-white"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Image src="/logo.png" alt={SITE_NAME} width={160} height={48} className="h-10 lg:h-12 w-auto object-contain" priority />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-0.5">
              {NAV_LINKS.map((link) => {
                const dropdown = MEGA_MENU[link.href];
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                const hasDropdown = !!dropdown;

                return (
                  <div
                    key={link.href}
                    className="relative"
                    onMouseEnter={() => hasDropdown && handleDropdownEnter(link.href)}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center gap-1 px-4 py-2.5 rounded-lg text-[13px] font-semibold tracking-wide uppercase transition-all duration-200",
                        isActive
                          ? "text-hanna-600"
                          : "text-cream-700 hover:text-hanna-600"
                      )}
                    >
                      {link.label}
                      {hasDropdown && (
                        <ChevronDown className={cn(
                          "h-3.5 w-3.5 transition-transform duration-200",
                          activeDropdown === link.href && "rotate-180"
                        )} />
                      )}
                    </Link>

                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-hanna-500 rounded-full" />
                    )}

                    {/* Mega Dropdown */}
                    <AnimatePresence>
                      {hasDropdown && activeDropdown === link.href && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-1/2 -translate-x-1/2 top-full pt-3"
                          onMouseEnter={() => handleDropdownEnter(link.href)}
                          onMouseLeave={handleDropdownLeave}
                        >
                          <div className="bg-white rounded-2xl shadow-2xl shadow-cream-300/60 border border-cream-100 overflow-hidden min-w-[680px]">
                            <div className="flex divide-x divide-cream-100">
                              {/* Columns */}
                              <div className="flex-1 p-5 grid grid-cols-2 gap-6">
                                {dropdown.columns.map((col) => (
                                  <div key={col.title}>
                                    <h3 className="text-[11px] font-bold text-cream-400 uppercase tracking-widest mb-3">
                                      {col.title}
                                    </h3>
                                    <div className="space-y-0.5">
                                      {col.items.map((item) => {
                                        const Icon = item.icon ? ICON_MAP[item.icon] : null;
                                        return (
                                          <Link
                                            key={item.href}
                                            href={item.href}
                                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-cream-700 hover:bg-hanna-50 hover:text-hanna-600 transition-colors group"
                                          >
                                            {Icon && (
                                              <div className="w-9 h-9 rounded-lg bg-cream-100 group-hover:bg-hanna-100 flex items-center justify-center shrink-0 transition-colors">
                                                <Icon className="h-4.5 w-4.5 text-cream-500 group-hover:text-hanna-500 transition-colors" />
                                              </div>
                                            )}
                                            <div>
                                              <div className="flex items-center gap-2">
                                                <span className="font-medium whitespace-nowrap">{item.label}</span>
                                                {item.badge && (
                                                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-red-100 text-red-600">
                                                    {item.badge}
                                                  </span>
                                                )}
                                              </div>
                                              {item.description && (
                                                <p className="text-xs text-cream-400 mt-0.5 whitespace-nowrap">{item.description}</p>
                                              )}
                                            </div>
                                          </Link>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Featured card */}
                              {dropdown.featured && (
                                <div className="w-56 bg-cream-50 p-5 flex flex-col">
                                  <div className="rounded-xl overflow-hidden mb-3 aspect-[16/10]">
                                    <Image
                                      src={dropdown.featured.image}
                                      alt={dropdown.featured.title}
                                      width={400}
                                      height={250}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <h4 className="font-display font-bold text-sm text-cream-900">
                                    {dropdown.featured.title}
                                  </h4>
                                  <p className="text-xs text-cream-600 mt-1 flex-1 line-clamp-2">
                                    {dropdown.featured.description}
                                  </p>
                                  <Link
                                    href={dropdown.featured.href}
                                    className="mt-3 flex items-center gap-1 text-xs font-bold text-hanna-600 hover:text-hanna-700 transition-colors"
                                  >
                                    {dropdown.featured.cta} <ArrowRight className="h-3 w-3" />
                                  </Link>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5">
              <button className="p-2 rounded-lg text-cream-600 hover:bg-cream-100 transition-colors hidden sm:flex cursor-pointer">
                <Search className="h-5 w-5" />
              </button>

              <button onClick={openCart} className="relative p-2 rounded-lg text-cream-600 hover:bg-cream-100 transition-colors cursor-pointer">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-hanna-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                  >{totalItems > 9 ? "9+" : totalItems}</motion.span>
                )}
              </button>

              {/* User Menu */}
              <div className="hidden sm:block relative" ref={userMenuRef}>
                {isLoggedIn ? (
                  <>
                    <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-1.5 p-1.5 rounded-xl hover:bg-cream-100 transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-hanna-500 text-white flex items-center justify-center text-xs font-bold">
                        {getInitials(userName)}
                      </div>
                      <ChevronDown className={cn("h-3 w-3 text-cream-500 transition-transform", isUserMenuOpen && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 5, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-cream-200 py-2 z-50"
                        >
                          <div className="px-4 py-2.5 border-b border-cream-100">
                            <p className="text-sm font-semibold text-cream-900 truncate">{userName}</p>
                            <p className="text-xs text-cream-500 truncate">{session.user?.email}</p>
                          </div>
                          <div className="py-1">
                            <Link href="/mi-cuenta" className="flex items-center gap-3 px-4 py-2 text-sm text-cream-700 hover:bg-cream-50 transition-colors">
                              <User className="h-4 w-4 text-cream-400" /> Mi Cuenta
                            </Link>
                            <Link href="/mi-cuenta/pedidos" className="flex items-center gap-3 px-4 py-2 text-sm text-cream-700 hover:bg-cream-50 transition-colors">
                              <Package className="h-4 w-4 text-cream-400" /> Mis Pedidos
                            </Link>
                            <Link href="/mi-cuenta/perfil" className="flex items-center gap-3 px-4 py-2 text-sm text-cream-700 hover:bg-cream-50 transition-colors">
                              <Settings className="h-4 w-4 text-cream-400" /> Mi Perfil
                            </Link>
                          </div>
                          {isAdmin && (
                            <div className="border-t border-cream-100 py-1">
                              <Link href="/admin" className="flex items-center gap-3 px-4 py-2 text-sm text-hanna-600 font-medium hover:bg-hanna-50 transition-colors">
                                <Shield className="h-4 w-4" /> Panel Admin
                              </Link>
                            </div>
                          )}
                          <div className="border-t border-cream-100 py-1">
                            <button onClick={() => signOut({ callbackUrl: "/" })}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full cursor-pointer">
                              <LogOut className="h-4 w-4" /> Cerrar Sesion
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link href="/iniciar-sesion" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-hanna-500 text-white text-sm font-medium hover:bg-hanna-600 transition-colors">
                    <User className="h-4 w-4" />
                    <span className="hidden md:inline">Ingresar</span>
                  </Link>
                )}
              </div>

              {/* Mobile Toggle */}
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-cream-600 hover:bg-cream-100 transition-colors cursor-pointer">
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-0 top-16 bottom-0 z-30 bg-white overflow-y-auto lg:hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {NAV_LINKS.map((link) => {
                const dropdown = MEGA_MENU[link.href];
                return (
                  <div key={link.href}>
                    <Link href={link.href}
                      className={cn("block px-4 py-3 rounded-xl text-sm font-semibold transition-colors",
                        pathname === link.href ? "text-hanna-600 bg-hanna-50" : "text-cream-700 hover:bg-cream-100"
                      )}
                    >{link.label}</Link>
                    {dropdown && (
                      <div className="ml-4 space-y-0.5 mb-2">
                        {dropdown.columns.flatMap(c => c.items).map(item => (
                          <Link key={item.href} href={item.href}
                            className="block px-4 py-2 rounded-lg text-sm text-cream-500 hover:text-hanna-600 hover:bg-cream-50 transition-colors">
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="pt-3 border-t border-cream-200 space-y-2">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-2">
                      <div className="w-9 h-9 rounded-full bg-hanna-500 text-white flex items-center justify-center text-xs font-bold">{getInitials(userName)}</div>
                      <div>
                        <p className="text-sm font-semibold text-cream-900">{userName}</p>
                        <p className="text-xs text-cream-500">{session.user?.email}</p>
                      </div>
                    </div>
                    <Link href="/mi-cuenta" className="block px-4 py-2.5 rounded-xl text-sm text-cream-700 hover:bg-cream-100">Mi Cuenta</Link>
                    <Link href="/mi-cuenta/pedidos" className="block px-4 py-2.5 rounded-xl text-sm text-cream-700 hover:bg-cream-100">Mis Pedidos</Link>
                    {isAdmin && <Link href="/admin" className="block px-4 py-2.5 rounded-xl text-sm text-hanna-600 font-medium hover:bg-hanna-50">Panel Admin</Link>}
                    <button onClick={() => signOut({ callbackUrl: "/" })}
                      className="block w-full text-left px-4 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 cursor-pointer">Cerrar Sesion</button>
                  </>
                ) : (
                  <Link href="/iniciar-sesion">
                    <Button className="w-full"><User className="h-4 w-4" /> Iniciar Sesion</Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-16 lg:h-[72px]" />
    </>
  );
}
