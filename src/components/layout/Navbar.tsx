"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  X,
  ShoppingCart,
  User,
  Search,
  LogOut,
  Package,
  Settings,
  Shield,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";
import { NAV_LINKS, SITE_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const totalItems = useCartStore((s) => s.totalItems());
  const openCart = useCartStore((s) => s.openCart);
  const { data: session, status } = useSession();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = status === "authenticated" && !!session?.user;
  const isAdmin = isLoggedIn && (session.user as any)?.role === "ADMIN";
  const userName = session?.user?.name || "Usuario";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          isScrolled
            ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-cream-200"
            : "bg-white"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Image
                src="/logo.png"
                alt={SITE_NAME}
                width={180}
                height={55}
                className="h-11 lg:h-14 w-auto object-contain"
                priority
              />
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    pathname === link.href
                      ? "text-hanna-600 bg-hanna-50"
                      : "text-cream-700 hover:text-hanna-600 hover:bg-cream-100"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg text-cream-600 hover:bg-cream-100 transition-colors hidden sm:flex cursor-pointer">
                <Search className="h-5 w-5" />
              </button>

              <button
                onClick={openCart}
                className="relative p-2 rounded-lg text-cream-600 hover:bg-cream-100 transition-colors cursor-pointer"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-hanna-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {totalItems > 9 ? "9+" : totalItems}
                  </motion.span>
                )}
              </button>

              {/* User Menu - Desktop */}
              <div className="hidden sm:block relative" ref={userMenuRef}>
                {isLoggedIn ? (
                  <>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-cream-100 transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-hanna-500 text-white flex items-center justify-center text-xs font-bold">
                        {getInitials(userName)}
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 text-cream-500 transition-transform",
                          isUserMenuOpen && "rotate-180"
                        )}
                      />
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
                          {/* User info header */}
                          <div className="px-4 py-2 border-b border-cream-100">
                            <p className="text-sm font-semibold text-cream-900 truncate">
                              {userName}
                            </p>
                            <p className="text-xs text-cream-500 truncate">
                              {session.user?.email}
                            </p>
                          </div>

                          {/* Links */}
                          <div className="py-1">
                            <Link
                              href="/mi-cuenta"
                              className="flex items-center gap-3 px-4 py-2 text-sm text-cream-700 hover:bg-cream-50 transition-colors"
                            >
                              <User className="h-4 w-4 text-cream-400" />
                              Mi Cuenta
                            </Link>
                            <Link
                              href="/mi-cuenta/pedidos"
                              className="flex items-center gap-3 px-4 py-2 text-sm text-cream-700 hover:bg-cream-50 transition-colors"
                            >
                              <Package className="h-4 w-4 text-cream-400" />
                              Mis Pedidos
                            </Link>
                            <Link
                              href="/mi-cuenta/perfil"
                              className="flex items-center gap-3 px-4 py-2 text-sm text-cream-700 hover:bg-cream-50 transition-colors"
                            >
                              <Settings className="h-4 w-4 text-cream-400" />
                              Mi Perfil
                            </Link>
                          </div>

                          {/* Admin link */}
                          {isAdmin && (
                            <div className="border-t border-cream-100 py-1">
                              <Link
                                href="/admin"
                                className="flex items-center gap-3 px-4 py-2 text-sm text-hanna-600 font-medium hover:bg-hanna-50 transition-colors"
                              >
                                <Shield className="h-4 w-4" />
                                Panel Admin
                              </Link>
                            </div>
                          )}

                          {/* Logout */}
                          <div className="border-t border-cream-100 py-1">
                            <button
                              onClick={() => signOut({ callbackUrl: "/" })}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full cursor-pointer"
                            >
                              <LogOut className="h-4 w-4" />
                              Cerrar Sesion
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    href="/iniciar-sesion"
                    className="p-2 rounded-lg text-cream-600 hover:bg-cream-100 transition-colors"
                  >
                    <User className="h-5 w-5" />
                  </Link>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-cream-600 hover:bg-cream-100 transition-colors cursor-pointer"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-0 top-16 z-30 bg-white border-b border-cream-200 shadow-lg lg:hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "block px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "text-hanna-600 bg-hanna-50"
                      : "text-cream-700 hover:bg-cream-100"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-cream-200 space-y-2">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-2">
                      <div className="w-9 h-9 rounded-full bg-hanna-500 text-white flex items-center justify-center text-xs font-bold">
                        {getInitials(userName)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-cream-900">{userName}</p>
                        <p className="text-xs text-cream-500">{session.user?.email}</p>
                      </div>
                    </div>
                    <Link href="/mi-cuenta" className="block px-4 py-2.5 rounded-xl text-sm text-cream-700 hover:bg-cream-100">
                      Mi Cuenta
                    </Link>
                    <Link href="/mi-cuenta/pedidos" className="block px-4 py-2.5 rounded-xl text-sm text-cream-700 hover:bg-cream-100">
                      Mis Pedidos
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className="block px-4 py-2.5 rounded-xl text-sm text-hanna-600 font-medium hover:bg-hanna-50">
                        Panel Admin
                      </Link>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="block w-full text-left px-4 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      Cerrar Sesion
                    </button>
                  </>
                ) : (
                  <Link href="/iniciar-sesion">
                    <Button variant="outline" className="w-full">
                      <User className="h-4 w-4" />
                      Iniciar Sesion
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed navbar */}
      <div className="h-16 lg:h-20" />
    </>
  );
}
