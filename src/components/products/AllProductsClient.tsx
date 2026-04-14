"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, SlidersHorizontal, X, ChevronDown, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product, Category } from "@/types";

interface AllProductsClientProps {
  initialParams: Record<string, string | undefined>;
  categories: Category[];
}

export function AllProductsClient({ initialParams, categories }: AllProductsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const currentCategory = searchParams.get("category") || "";
  const currentBrand = searchParams.get("brand") || "";
  const currentSearch = searchParams.get("search") || "";
  const currentSort = searchParams.get("sortBy") || "newest";
  const currentPage = parseInt(searchParams.get("page") || "1");

  const updateParam = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== "page") params.delete("page");
    router.push(`/productos?${params.toString()}`);
  }, [router, searchParams]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams(searchParams.toString());
        params.set("perPage", "12");
        const res = await fetch(`/api/products?${params.toString()}`);
        const json = await res.json();
        if (json.success) {
          setProducts(json.data?.products || []);
          setTotal(json.data?.total || 0);
          setTotalPages(json.data?.totalPages || 0);
        }
      } catch { /* silent */ }
      setLoading(false);
    }
    load();
  }, [searchParams]);

  // Collect unique brands from all products for the sidebar
  const [allBrands, setAllBrands] = useState<string[]>([]);
  useEffect(() => {
    fetch("/api/products?perPage=200")
      .then(r => r.json())
      .then(j => {
        if (j.success) {
          const brands = [...new Set((j.data?.products || []).map((p: any) => p.brand).filter(Boolean))] as string[];
          setAllBrands(brands.sort());
        }
      });
  }, []);

  const hasActiveFilters = currentCategory || currentBrand || currentSearch;

  return (
    <section className="py-8 bg-cream-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          {/* Sidebar filters - desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Search */}
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cream-400" />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    defaultValue={currentSearch}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") updateParam("search", (e.target as HTMLInputElement).value || null);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 bg-white text-sm focus:border-hanna-500 focus:outline-none focus:ring-2 focus:ring-hanna-500/20"
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-xs font-bold text-cream-400 uppercase tracking-widest mb-3">Categorias</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => updateParam("category", null)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                      !currentCategory ? "bg-hanna-50 text-hanna-600 font-semibold" : "text-cream-600 hover:bg-cream-100"
                    }`}
                  >
                    Todas las categorias
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => updateParam("category", cat.slug)}
                      className={`flex items-center justify-between w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                        currentCategory === cat.slug ? "bg-hanna-50 text-hanna-600 font-semibold" : "text-cream-600 hover:bg-cream-100"
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-xs text-cream-400">{(cat as any)._count?.products || ""}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands */}
              {allBrands.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-cream-400 uppercase tracking-widest mb-3">Marcas</h3>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {allBrands.map((brand) => (
                      <label key={brand} className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-cream-100 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={currentBrand === brand}
                          onChange={() => updateParam("brand", currentBrand === brand ? null : brand)}
                          className="rounded border-cream-300 text-hanna-500 focus:ring-hanna-500"
                        />
                        <span className="text-sm text-cream-700">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Clear filters */}
              {hasActiveFilters && (
                <button
                  onClick={() => router.push("/productos")}
                  className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" /> Limpiar filtros
                </button>
              )}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Active filters + sort bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-cream-500">{total} productos</span>
                {currentCategory && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-hanna-50 text-hanna-700 text-xs font-medium">
                    {categories.find(c => c.slug === currentCategory)?.name}
                    <button onClick={() => updateParam("category", null)} className="hover:text-red-500 cursor-pointer"><X className="h-3 w-3" /></button>
                  </span>
                )}
                {currentBrand && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold-50 text-gold-700 text-xs font-medium">
                    {currentBrand}
                    <button onClick={() => updateParam("brand", null)} className="hover:text-red-500 cursor-pointer"><X className="h-3 w-3" /></button>
                  </span>
                )}
                {currentSearch && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cream-200 text-cream-700 text-xs font-medium">
                    &ldquo;{currentSearch}&rdquo;
                    <button onClick={() => updateParam("search", null)} className="hover:text-red-500 cursor-pointer"><X className="h-3 w-3" /></button>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border border-cream-300 text-sm text-cream-700 hover:bg-cream-100 cursor-pointer"
                >
                  <SlidersHorizontal className="h-4 w-4" /> Filtros
                </button>
                <select
                  value={currentSort}
                  onChange={(e) => updateParam("sortBy", e.target.value)}
                  className="px-3 py-2 rounded-xl border border-cream-300 bg-white text-sm text-cream-700 focus:border-hanna-500 focus:outline-none"
                >
                  <option value="newest">Mas recientes</option>
                  <option value="price_asc">Precio: menor a mayor</option>
                  <option value="price_desc">Precio: mayor a menor</option>
                  <option value="name">Nombre A-Z</option>
                </select>
              </div>
            </div>

            {/* Product grid */}
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                    <div className="aspect-square bg-cream-200" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-3 w-1/3" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-5 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <Search className="h-12 w-12 text-cream-300 mx-auto mb-4" />
                <h3 className="font-display font-semibold text-lg text-cream-900 mb-1">No se encontraron productos</h3>
                <p className="text-sm text-cream-500 mb-4">Intenta con otros filtros o busqueda</p>
                <Button variant="outline" onClick={() => router.push("/productos")}>Ver todos</Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    {currentPage > 1 && (
                      <button onClick={() => updateParam("page", String(currentPage - 1))}
                        className="px-4 py-2 rounded-xl border border-cream-300 text-sm hover:bg-cream-100 cursor-pointer">Anterior</button>
                    )}
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button key={page} onClick={() => updateParam("page", String(page))}
                          className={`w-10 h-10 rounded-xl text-sm font-medium cursor-pointer ${
                            page === currentPage ? "bg-hanna-500 text-white" : "border border-cream-300 hover:bg-cream-100"
                          }`}>{page}</button>
                      );
                    })}
                    {currentPage < totalPages && (
                      <button onClick={() => updateParam("page", String(currentPage + 1))}
                        className="px-4 py-2 rounded-xl border border-cream-300 text-sm hover:bg-cream-100 cursor-pointer">Siguiente</button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
