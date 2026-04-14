"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { formatPrice, calcDiscount } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product & { averageRating?: number; reviewCount?: number };
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [isAdding, setIsAdding] = useState(false);

  // Parse images -- the field comes as string[] from the API (already parsed),
  // but handle the case where it's still a raw JSON string from SQLite
  let images: string[] = [];
  if (Array.isArray(product.images)) {
    images = product.images;
  } else if (typeof product.images === "string") {
    try {
      images = JSON.parse(product.images);
    } catch {
      images = [];
    }
  }

  const mainImage = images[0] || "https://placehold.co/800x800/E8E1D8/8B7E74?text=Sin+Imagen";

  const hasDiscount =
    product.compareAtPrice !== null &&
    product.compareAtPrice !== undefined &&
    product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? calcDiscount(product.price, product.compareAtPrice!)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);

    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: mainImage,
      quantity: 1,
      maxStock: product.stock,
    });

    setTimeout(() => setIsAdding(false), 600);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group"
    >
      <Link href={`/productos/${product.slug}`} className="block">
        <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden transition-shadow duration-300 group-hover:shadow-lg">
          {/* Image container */}
          <div className="relative aspect-square overflow-hidden bg-cream-50">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Discount badge */}
            {hasDiscount && discountPercent > 0 && (
              <div className="absolute top-3 left-3 z-10">
                <Badge variant="error" size="sm" className="font-bold shadow-md">
                  -{discountPercent}%
                </Badge>
              </div>
            )}

            {/* Out of stock overlay */}
            {product.stock <= 0 && (
              <div className="absolute inset-0 bg-cream-900/50 flex items-center justify-center z-10">
                <span className="bg-white px-4 py-2 rounded-xl font-display font-semibold text-cream-700 text-sm">
                  Agotado
                </span>
              </div>
            )}

            {/* Quick add overlay */}
            {product.stock > 0 && (
              <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
                <Button
                  onClick={handleAddToCart}
                  size="sm"
                  className="w-full shadow-lg"
                  disabled={isAdding}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {isAdding ? "Agregado!" : "Agregar al Carrito"}
                </Button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Category label */}
            {product.category && (
              <p className="text-xs font-medium text-hanna-500 mb-1 uppercase tracking-wider">
                {product.category.name}
              </p>
            )}

            {/* Product name */}
            <h3 className="font-display font-semibold text-sm text-cream-900 leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-hanna-600 transition-colors">
              {product.name}
            </h3>

            {/* Star rating */}
            <div className="mt-1.5">
              <StarRating
                rating={product.averageRating || 0}
                size="sm"
                showCount
                count={product.reviewCount || 0}
              />
            </div>

            {/* Price */}
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display font-bold text-lg text-hanna-600">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-cream-500 line-through">
                  {formatPrice(product.compareAtPrice!)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
