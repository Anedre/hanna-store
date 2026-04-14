"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import type { Product } from "@/types";

interface FilteredProductGridProps {
  categorySlug: string;
  initialProducts: (Product & { averageRating: number; reviewCount: number })[];
  initialTotal: number;
  initialTotalPages: number;
}

export function FilteredProductGrid({
  categorySlug,
  initialProducts,
  initialTotal,
  initialTotalPages,
}: FilteredProductGridProps) {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "newest");
  const [page, setPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );

  // Determine if any filter is active (beyond initial load)
  const hasFilters = useCallback(() => {
    return (
      searchParams.get("brand") ||
      searchParams.get("sub") ||
      searchParams.get("minPrice") ||
      searchParams.get("maxPrice") ||
      searchParams.get("sortBy") ||
      searchParams.get("page") ||
      Array.from(searchParams.keys()).some((k) => k.startsWith("attr_"))
    );
  }, [searchParams]);

  // Fetch products with current filters
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("category", categorySlug);
      params.set("perPage", "12");

      // Map search params
      const brand = searchParams.get("brand");
      const sub = searchParams.get("sub");
      const minPrice = searchParams.get("minPrice");
      const maxPrice = searchParams.get("maxPrice");
      const currentSort = searchParams.get("sortBy") || sortBy;
      const currentPage = searchParams.get("page") || String(page);

      if (brand) params.set("brand", brand);
      if (sub) params.set("subcategory", sub);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (currentSort) params.set("sortBy", currentSort);
      params.set("page", currentPage);

      // Forward attr_* params
      searchParams.forEach((value, key) => {
        if (key.startsWith("attr_")) {
          params.set(key, value);
        }
      });

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
  }, [categorySlug, searchParams, sortBy, page]);

  // Refetch when searchParams change
  useEffect(() => {
    if (hasFilters()) {
      fetchProducts();
    } else {
      // Reset to initial data when no filters
      setProducts(initialProducts);
      setTotal(initialTotal);
      setTotalPages(initialTotalPages);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", newSort);
    params.delete("page");
    window.history.pushState(null, "", `?${params.toString()}`);
    // Trigger refetch
    const url = new URL(window.location.href);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    window.history.pushState(null, "", `?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Trigger refetch via searchParams change
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <div className="flex-1 min-w-0">
      {/* Toolbar: sort + count */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <p className="text-sm text-cream-600">
          <span className="font-semibold text-cream-900">{total}</span>{" "}
          {total === 1 ? "producto" : "productos"}
        </p>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-cream-400" />
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="text-sm border border-cream-300 rounded-lg px-3 py-1.5 bg-white text-cream-700 focus:outline-none focus:ring-1 focus:ring-hanna-400"
          >
            <option value="newest">Mas recientes</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
            <option value="name">Nombre A-Z</option>
            <option value="popular">Mas populares</option>
          </select>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-hanna-500" />
          <span className="ml-3 text-cream-600">Cargando productos...</span>
        </div>
      )}

      {/* Product grid */}
      {!loading && products.length === 0 && (
        <div className="text-center py-16">
          <p className="text-cream-500 text-lg">
            No se encontraron productos con los filtros seleccionados.
          </p>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-2 text-sm border border-cream-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cream-100 transition-colors"
          >
            Anterior
          </button>

          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (page <= 3) {
              pageNum = i + 1;
            } else if (page >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = page - 2 + i;
            }
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-9 h-9 text-sm rounded-lg transition-colors ${
                  page === pageNum
                    ? "bg-hanna-500 text-white font-semibold"
                    : "border border-cream-300 text-cream-700 hover:bg-cream-100"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-2 text-sm border border-cream-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cream-100 transition-colors"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
