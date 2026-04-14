"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Product, Category } from "@/types";

interface ProductCatalogProps {
  initialParams?: {
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
    sortBy?: string;
    page?: string;
  };
}

const SORT_OPTIONS = [
  { value: "newest", label: "Mas recientes" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
  { value: "name", label: "Nombre A-Z" },
];

export function ProductCatalog({ initialParams }: ProductCatalogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [products, setProducts] = useState<
    (Product & { averageRating: number; reviewCount: number })[]
  >([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filter state from URL params
  const category = searchParams.get("category") || initialParams?.category || "";
  const search = searchParams.get("search") || initialParams?.search || "";
  const sortBy = searchParams.get("sortBy") || initialParams?.sortBy || "newest";
  const page = parseInt(
    searchParams.get("page") || initialParams?.page || "1",
    10
  );

  const [searchInput, setSearchInput] = useState(search);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch categories once
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const json = await res.json();
        if (json.success && json.data) {
          setCategories(json.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }
    fetchCategories();
  }, []);

  // Build URL and update route
  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      // Reset to page 1 when filters change (unless we're specifically changing page)
      if (!("page" in updates)) {
        params.delete("page");
      }

      router.push(`/productos?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (search) params.set("search", search);
      if (sortBy) params.set("sortBy", sortBy);
      params.set("page", String(page));
      params.set("perPage", "12");

      const res = await fetch(`/api/products?${params.toString()}`);
      const json = await res.json();

      if (json.success && json.data) {
        setProducts(json.data.products);
        setTotal(json.data.total);
        setTotalPages(json.data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [category, search, sortBy, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handlers
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ search: searchInput || undefined });
  }

  function handleCategoryChange(slug: string) {
    updateParams({ category: slug || undefined });
  }

  function handleSortChange(value: string) {
    updateParams({ sortBy: value });
  }

  function handlePageChange(newPage: number) {
    updateParams({ page: String(newPage) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearFilters() {
    setSearchInput("");
    router.push("/productos");
  }

  const hasActiveFilters = !!(category || search);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-cream-900">
          Nuestros <span className="text-gradient">Productos</span>
        </h1>
        <p className="mt-2 text-cream-600">
          Encuentra los mejores productos internacionales importados con calidad
          garantizada
        </p>
      </div>

      {/* Search & Filter bar */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cream-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-200 bg-white text-sm focus:outline-none focus:border-hanna-500 focus:ring-1 focus:ring-hanna-500 transition-all"
              />
            </div>
            <Button type="submit" size="sm">
              Buscar
            </Button>
          </form>

          {/* Sort & Filter toggle */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-cream-200 bg-white text-sm text-cream-700 focus:outline-none focus:border-hanna-500 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2.5 rounded-xl border border-cream-200 bg-white text-sm text-cream-700 hover:bg-cream-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filtros</span>
            </button>
          </div>
        </div>

        {/* Category filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-white rounded-2xl border border-cream-200">
                <p className="text-sm font-medium text-cream-700 mb-3">
                  Categorias
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategoryChange("")}
                    className={`px-4 py-2 text-sm rounded-xl font-medium transition-colors cursor-pointer ${
                      !category
                        ? "bg-hanna-50 text-hanna-600"
                        : "text-cream-600 hover:bg-cream-100"
                    }`}
                  >
                    Todos
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.slug)}
                      className={`px-4 py-2 text-sm rounded-xl font-medium transition-colors cursor-pointer ${
                        category === cat.slug
                          ? "bg-hanna-50 text-hanna-600"
                          : "text-cream-600 hover:bg-cream-100"
                      }`}
                    >
                      {cat.name}
                      {cat._count && (
                        <span className="ml-1 text-cream-400">
                          ({cat._count.products})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-cream-500">Filtros activos:</span>
            {category && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-hanna-50 text-hanna-600 rounded-full text-xs font-medium">
                {categories.find((c) => c.slug === category)?.name || category}
                <button
                  onClick={() => handleCategoryChange("")}
                  className="hover:text-hanna-800 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {search && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-hanna-50 text-hanna-600 rounded-full text-xs font-medium">
                &ldquo;{search}&rdquo;
                <button
                  onClick={() => {
                    setSearchInput("");
                    updateParams({ search: undefined });
                  }}
                  className="hover:text-hanna-800 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-cream-500 hover:text-hanna-600 underline cursor-pointer"
            >
              Limpiar todo
            </button>
          </div>
        )}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-cream-500 mb-6">
          {total} producto{total !== 1 ? "s" : ""} encontrado
          {total !== 1 ? "s" : ""}
        </p>
      )}

      {/* Product grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-cream-200 rounded-t-2xl" />
              <CardContent>
                <div className="h-4 bg-cream-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-cream-200 rounded w-1/2 mb-3" />
                <div className="h-5 bg-cream-200 rounded w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-12 w-12 text-cream-300 mx-auto mb-4" />
          <h3 className="font-display text-lg font-semibold text-cream-700 mb-2">
            No se encontraron productos
          </h3>
          <p className="text-cream-500 text-sm mb-4">
            Intenta con otros filtros o busqueda
          </p>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Ver todos los productos
          </Button>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.05 } },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
              }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
          >
            Anterior
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                // Show first, last, current, and neighbors
                if (p === 1 || p === totalPages) return true;
                if (Math.abs(p - page) <= 1) return true;
                return false;
              })
              .map((p, idx, arr) => {
                const prevPage = arr[idx - 1];
                const showEllipsis = prevPage !== undefined && p - prevPage > 1;

                return (
                  <span key={p} className="flex items-center">
                    {showEllipsis && (
                      <span className="px-2 text-cream-400">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                        p === page
                          ? "bg-hanna-500 text-white"
                          : "text-cream-600 hover:bg-cream-100"
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                );
              })}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => handlePageChange(page + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}
    </section>
  );
}
