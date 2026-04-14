"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SubcategoryDef } from "@/lib/category-filters";

interface SubcategoryNavProps {
  subcategories: SubcategoryDef[];
  activeSlug?: string;
}

export function SubcategoryNav({
  subcategories,
  activeSlug,
}: SubcategoryNavProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSelect = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("sub", slug);
    } else {
      params.delete("sub");
    }
    // Reset page when changing subcategory
    params.delete("page");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  if (subcategories.length === 0) return null;

  return (
    <div className="relative mb-6">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {/* "Todos" pill */}
        <button
          onClick={() => handleSelect(null)}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
            !activeSlug
              ? "bg-hanna-500 text-white shadow-md"
              : "bg-cream-100 text-cream-700 hover:bg-cream-200"
          )}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          Todos
        </button>

        {/* Subcategory pills */}
        {subcategories.map((sub) => (
          <button
            key={sub.slug}
            onClick={() => handleSelect(sub.slug)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
              activeSlug === sub.slug
                ? "bg-hanna-500 text-white shadow-md"
                : "bg-cream-100 text-cream-700 hover:bg-cream-200"
            )}
          >
            {sub.name}
          </button>
        ))}
      </div>
    </div>
  );
}
