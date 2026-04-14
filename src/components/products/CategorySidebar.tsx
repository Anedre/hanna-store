"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import { getActiveFilters, type CategoryFilter } from "@/lib/category-filters";
import { cn } from "@/lib/utils";

interface CategorySidebarProps {
  categorySlug: string;
  subcategorySlug?: string;
}

export function CategorySidebar({
  categorySlug,
  subcategorySlug,
}: CategorySidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = getActiveFilters(categorySlug, subcategorySlug);

  // Track collapsed state per filter group
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    filters.forEach((f, i) => {
      initial[f.key] = i >= 3;
    });
    return initial;
  });

  const toggleCollapse = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Read currently active filter values from searchParams
  const getActiveValue = (key: string): string | null => {
    if (key === "price") return null;
    // For brand, it's in "brand" param; for attributes, it's in "attr_{key}" param
    if (key === "brand") return searchParams.get("brand");
    return searchParams.get(`attr_${key}`);
  };

  const hasAnyFilter = (): boolean => {
    if (searchParams.get("brand")) return true;
    if (searchParams.get("minPrice") || searchParams.get("maxPrice")) return true;
    const entries = Array.from(searchParams.entries());
    return entries.some(([k]) => k.startsWith("attr_"));
  };

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    // Reset to page 1 when filter changes
    params.delete("page");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleCheckboxToggle = (filterKey: string, optionValue: string) => {
    const paramKey = filterKey === "brand" ? "brand" : `attr_${filterKey}`;
    const current = searchParams.get(paramKey);
    if (current === optionValue) {
      updateParam(paramKey, null);
    } else {
      updateParam(paramKey, optionValue);
    }
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    // Keep only sub param if present
    const sub = searchParams.get("sub");
    if (sub) params.set("sub", sub);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const renderCheckboxFilter = (filter: CategoryFilter) => {
    const paramKey = filter.key === "brand" ? "brand" : `attr_${filter.key}`;
    const activeValue = searchParams.get(paramKey);

    return (
      <div className="space-y-1.5">
        {filter.options?.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-2.5 cursor-pointer group py-0.5"
          >
            <input
              type="checkbox"
              checked={activeValue === opt.value}
              onChange={() => handleCheckboxToggle(filter.key, opt.value)}
              className="w-4 h-4 rounded border-cream-300 text-hanna-500 focus:ring-hanna-400 accent-hanna-500"
            />
            <span className="text-sm text-cream-700 group-hover:text-cream-900 transition-colors">
              {opt.label}
            </span>
          </label>
        ))}
      </div>
    );
  };

  const renderColorFilter = (filter: CategoryFilter) => {
    const paramKey = `attr_${filter.key}`;
    const activeValue = searchParams.get(paramKey);

    return (
      <div className="flex flex-wrap gap-2">
        {filter.options?.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleCheckboxToggle(filter.key, opt.value)}
            title={opt.label}
            className={cn(
              "w-7 h-7 rounded-full border-2 transition-all",
              activeValue === opt.value
                ? "border-hanna-500 ring-2 ring-hanna-200 scale-110"
                : "border-cream-300 hover:border-cream-400"
            )}
            style={{ backgroundColor: opt.color }}
          >
            {opt.color === "#FFFFFF" && (
              <span className="block w-full h-full rounded-full border border-cream-200" />
            )}
          </button>
        ))}
      </div>
    );
  };

  const renderRangeFilter = (filter: CategoryFilter) => {
    const currentMin = searchParams.get("minPrice") || "";
    const currentMax = searchParams.get("maxPrice") || "";

    return (
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-cream-400">
            {filter.unit}
          </span>
          <input
            type="number"
            placeholder={String(filter.min || 0)}
            value={currentMin}
            onChange={(e) => updateParam("minPrice", e.target.value || null)}
            className="w-full pl-8 pr-2 py-2 text-sm border border-cream-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-hanna-400 focus:border-hanna-400 bg-white"
          />
        </div>
        <span className="text-cream-400 text-xs">-</span>
        <div className="relative flex-1">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-cream-400">
            {filter.unit}
          </span>
          <input
            type="number"
            placeholder={String(filter.max || 99999)}
            value={currentMax}
            onChange={(e) => updateParam("maxPrice", e.target.value || null)}
            className="w-full pl-8 pr-2 py-2 text-sm border border-cream-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-hanna-400 focus:border-hanna-400 bg-white"
          />
        </div>
      </div>
    );
  };

  if (filters.length === 0) return null;

  return (
    <aside className="hidden lg:block w-64 flex-shrink-0">
      <div className="sticky top-24 space-y-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-cream-900">
            Filtros
          </h3>
          {hasAnyFilter() && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-hanna-500 hover:text-hanna-600 font-medium flex items-center gap-1 transition-colors"
            >
              <X className="h-3 w-3" />
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Filter groups */}
        {filters.map((filter) => (
          <div
            key={filter.key}
            className="border-b border-cream-200 pb-4 mb-4 last:border-b-0"
          >
            <button
              onClick={() => toggleCollapse(filter.key)}
              className="flex items-center justify-between w-full text-left py-1 group"
            >
              <span className="text-sm font-semibold text-cream-800 group-hover:text-cream-900">
                {filter.label}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-cream-400 transition-transform",
                  collapsed[filter.key] && "-rotate-90"
                )}
              />
            </button>

            {!collapsed[filter.key] && (
              <div className="mt-2.5">
                {filter.type === "checkbox" && renderCheckboxFilter(filter)}
                {filter.type === "color" && renderColorFilter(filter)}
                {filter.type === "range" && renderRangeFilter(filter)}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
