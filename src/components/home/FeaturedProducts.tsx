"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Product } from "@/types";

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function FeaturedProducts() {
  const [products, setProducts] = useState<
    (Product & { averageRating: number; reviewCount: number })[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products/featured?limit=8");
        const json = await res.json();
        if (json.success && json.data) {
          setProducts(json.data);
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
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
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-cream-500">No hay productos destacados disponibles.</p>
        <Link href="/productos" className="mt-4 inline-block">
          <Button variant="outline" size="sm">
            Ver todos los productos
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={staggerContainer}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {products.map((product) => (
        <motion.div key={product.id} variants={fadeInUp}>
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
}
