"use client";

import { ProductCard } from "@/components/products/ProductCard";
import type { Product } from "@/types";

interface CategoryProductGridProps {
  products: (Product & { averageRating: number; reviewCount: number })[];
}

export function CategoryProductGrid({ products }: CategoryProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-cream-500 text-lg">
          No hay productos disponibles en esta categoria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
