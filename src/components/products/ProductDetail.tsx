"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Minus,
  Plus,
  ShoppingCart,
  Zap,
  Package,
  Globe,
  Tag,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { formatPrice, calcDiscount, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { useCartStore } from "@/stores/cart-store";
import { submitReview } from "@/actions/reviews";
import { ProductCard } from "@/components/products/ProductCard";
import type { Product, Review } from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FullProduct = Product & {
  averageRating: number;
  reviewCount: number;
  reviews?: Review[];
};

interface ProductDetailProps {
  product: FullProduct;
  relatedProducts: FullProduct[];
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

const TABS = ["Descripcion", "Especificaciones", "Resenas"] as const;
type TabKey = (typeof TABS)[number];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const addItem = useCartStore((s) => s.addItem);

  // Image gallery
  const images = product.images.length > 0 ? product.images : [];
  const [selectedImage, setSelectedImage] = useState(0);
  const mainImage =
    images[selectedImage] ||
    "https://placehold.co/800x800/E8E1D8/8B7E74?text=Sin+Imagen";

  // Quantity
  const [quantity, setQuantity] = useState(1);
  const inStock = product.stock > 0;

  // Tabs
  const [activeTab, setActiveTab] = useState<TabKey>("Descripcion");

  // Review form
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Add-to-cart animation
  const [isAdding, setIsAdding] = useState(false);

  // Discount
  const hasDiscount =
    product.compareAtPrice !== null &&
    product.compareAtPrice !== undefined &&
    product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? calcDiscount(product.price, product.compareAtPrice!)
    : 0;

  // Handlers
  const handleAddToCart = () => {
    if (!inStock) return;
    setIsAdding(true);
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: mainImage,
      quantity,
      maxStock: product.stock,
    });
    setTimeout(() => setIsAdding(false), 800);
  };

  const handleBuyNow = () => {
    if (!inStock) return;
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: mainImage,
      quantity,
      maxStock: product.stock,
    });
    router.push("/checkout");
  };

  const handleSubmitReview = async () => {
    if (!session?.user) return;
    if (reviewRating === 0 || reviewComment.trim().length < 5) {
      setReviewMessage({
        type: "error",
        text: "Selecciona una calificacion y escribe un comentario (min. 5 caracteres)",
      });
      return;
    }
    setReviewLoading(true);
    setReviewMessage(null);
    try {
      const result = await submitReview(product.id, reviewRating, reviewComment);
      if (result.success) {
        setReviewMessage({
          type: "success",
          text: "Resena enviada. Sera visible tras aprobacion.",
        });
        setReviewRating(0);
        setReviewComment("");
      } else {
        setReviewMessage({ type: "error", text: result.error || "Error" });
      }
    } catch {
      setReviewMessage({ type: "error", text: "Error al enviar la resena" });
    } finally {
      setReviewLoading(false);
    }
  };

  // Tags parsing
  const tags = product.tags
    ? product.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ------------------------------------------------------------------ */}
      {/* Breadcrumb                                                         */}
      {/* ------------------------------------------------------------------ */}
      <nav className="flex items-center gap-1.5 text-sm text-cream-500 mb-8 flex-wrap">
        <Link href="/" className="hover:text-hanna-600 transition-colors">
          Inicio
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <Link
          href="/productos"
          className="hover:text-hanna-600 transition-colors"
        >
          Productos
        </Link>
        {product.category && (
          <>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <Link
              href={`/categorias/${product.category.slug}`}
              className="hover:text-hanna-600 transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span className="text-cream-900 font-medium">{product.name}</span>
      </nav>

      {/* ------------------------------------------------------------------ */}
      {/* Main Grid : Images + Info                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        {/* ---------- Images ---------- */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Main image */}
          <div className="relative aspect-square bg-white rounded-2xl border border-cream-200 overflow-hidden mb-4">
            {images.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={mainImage}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-cream-100 to-cream-200 flex items-center justify-center">
                <Package className="h-20 w-20 text-cream-300" />
              </div>
            )}

            {hasDiscount && discountPercent > 0 && (
              <div className="absolute top-4 left-4 z-10">
                <Badge variant="error" className="font-bold shadow-md text-sm">
                  -{discountPercent}%
                </Badge>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    idx === selectedImage
                      ? "border-hanna-500 ring-2 ring-hanna-200"
                      : "border-cream-200 hover:border-cream-400"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* ---------- Product Info ---------- */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-5"
        >
          {/* Category badge */}
          {product.category && (
            <Link href={`/categorias/${product.category.slug}`}>
              <Badge variant="default" size="md" className="cursor-pointer">
                {product.category.name}
              </Badge>
            </Link>
          )}

          {/* Name */}
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-cream-900 leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <StarRating
              rating={product.averageRating}
              size="md"
              showCount
              count={product.reviewCount}
            />
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="font-display text-2xl font-bold text-hanna-600">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-cream-500 line-through">
                  {formatPrice(product.compareAtPrice!)}
                </span>
                <Badge variant="error" size="sm">
                  -{discountPercent}%
                </Badge>
              </>
            )}
          </div>

          {/* Short description */}
          {product.shortDescription && (
            <p className="text-cream-600 leading-relaxed">
              {product.shortDescription}
            </p>
          )}

          {/* Meta */}
          <div className="border-t border-cream-200 pt-4 space-y-2 text-sm">
            {product.origin && (
              <div className="flex items-center gap-2 text-cream-600">
                <Globe className="h-4 w-4 text-hanna-500 shrink-0" />
                <span>
                  Origen: <strong className="text-cream-800">{product.origin}</strong>
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-cream-600">
              <Tag className="h-4 w-4 text-hanna-500 shrink-0" />
              <span>
                SKU: <strong className="text-cream-800">{product.sku}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-cream-600">
              <Info className="h-4 w-4 text-hanna-500 shrink-0" />
              <span>
                Stock:{" "}
                {inStock ? (
                  <strong className="text-green-600">
                    En stock ({product.stock} disponible{product.stock !== 1 ? "s" : ""})
                  </strong>
                ) : (
                  <strong className="text-red-500">Agotado</strong>
                )}
              </span>
            </div>
          </div>

          {/* Quantity selector + buttons */}
          {inStock && (
            <div className="border-t border-cream-200 pt-5 space-y-4">
              {/* Quantity */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-cream-700">
                  Cantidad:
                </span>
                <div className="flex items-center border border-cream-300 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 text-cream-600 hover:bg-cream-100 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 text-sm font-semibold text-cream-900 min-w-[3rem] text-center bg-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock, q + 1))
                    }
                    className="px-3 py-2 text-cream-600 hover:bg-cream-100 transition-colors"
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  isLoading={isAdding}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {isAdding ? "Agregado!" : "Agregar al Carrito"}
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="flex-1"
                  onClick={handleBuyNow}
                >
                  <Zap className="h-5 w-5" />
                  Comprar Ahora
                </Button>
              </div>
            </div>
          )}

          {!inStock && (
            <div className="border-t border-cream-200 pt-5">
              <Button size="lg" disabled className="w-full">
                Producto Agotado
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Tabs                                                               */}
      {/* ------------------------------------------------------------------ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-16"
      >
        {/* Tab headers */}
        <div className="flex border-b border-cream-200 mb-6 overflow-x-auto">
          {TABS.map((tab) => {
            const label =
              tab === "Resenas"
                ? `Resenas (${product.reviewCount})`
                : tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? "text-hanna-600 border-hanna-500"
                    : "text-cream-500 border-transparent hover:text-cream-700 hover:border-cream-300"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* ---------- Descripcion ---------- */}
            {activeTab === "Descripcion" && (
              <div className="prose prose-cream max-w-none">
                <div className="text-cream-700 leading-relaxed whitespace-pre-wrap">
                  {product.description || "Sin descripcion disponible."}
                </div>
              </div>
            )}

            {/* ---------- Especificaciones ---------- */}
            {activeTab === "Especificaciones" && (
              <Card className="overflow-hidden">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-cream-100">
                    {product.origin && (
                      <tr>
                        <td className="px-6 py-3 font-medium text-cream-600 bg-cream-50 w-1/3">
                          Origen
                        </td>
                        <td className="px-6 py-3 text-cream-900">
                          {product.origin}
                        </td>
                      </tr>
                    )}
                    {product.weight && (
                      <tr>
                        <td className="px-6 py-3 font-medium text-cream-600 bg-cream-50 w-1/3">
                          Peso
                        </td>
                        <td className="px-6 py-3 text-cream-900">
                          {product.weight}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td className="px-6 py-3 font-medium text-cream-600 bg-cream-50 w-1/3">
                        SKU
                      </td>
                      <td className="px-6 py-3 text-cream-900">
                        {product.sku}
                      </td>
                    </tr>
                    {product.category && (
                      <tr>
                        <td className="px-6 py-3 font-medium text-cream-600 bg-cream-50 w-1/3">
                          Categoria
                        </td>
                        <td className="px-6 py-3 text-cream-900">
                          <Link
                            href={`/categorias/${product.category.slug}`}
                            className="text-hanna-600 hover:underline"
                          >
                            {product.category.name}
                          </Link>
                        </td>
                      </tr>
                    )}
                    {tags.length > 0 && (
                      <tr>
                        <td className="px-6 py-3 font-medium text-cream-600 bg-cream-50 w-1/3">
                          Etiquetas
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {tags.map((tag) => (
                              <Badge key={tag} variant="gold" size="sm">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Card>
            )}

            {/* ---------- Resenas ---------- */}
            {activeTab === "Resenas" && (
              <div className="space-y-6">
                {/* Existing reviews */}
                {product.reviews && product.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {product.reviews.map((review) => (
                      <Card key={review.id} className="p-5">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-cream-900 text-sm">
                              {review.user
                                ? `${review.user.name} ${review.user.lastName}`
                                : "Usuario"}
                            </p>
                            <p className="text-xs text-cream-500">
                              {formatDate(review.createdAt)}
                            </p>
                          </div>
                          <StarRating rating={review.rating} size="sm" />
                        </div>
                        <p className="text-sm text-cream-700 leading-relaxed">
                          {review.comment}
                        </p>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-cream-500">
                      Este producto aun no tiene resenas.
                    </p>
                    <p className="text-sm text-cream-400 mt-1">
                      Se el primero en dejar una resena.
                    </p>
                  </div>
                )}

                {/* Write review form */}
                <div className="border-t border-cream-200 pt-6">
                  <h3 className="font-display font-semibold text-lg text-cream-900 mb-4">
                    Escribir Resena
                  </h3>

                  {session?.user ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-cream-700 mb-2">
                          Calificacion
                        </label>
                        <StarRating
                          rating={reviewRating}
                          size="lg"
                          interactive
                          onChange={setReviewRating}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-cream-700 mb-1.5">
                          Comentario
                        </label>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          rows={4}
                          placeholder="Comparte tu experiencia con este producto..."
                          className="w-full rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-sm text-cream-900 placeholder:text-cream-400 focus:border-hanna-500 focus:outline-none focus:ring-2 focus:ring-hanna-500/20 transition-all duration-200 resize-none"
                        />
                      </div>
                      {reviewMessage && (
                        <p
                          className={`text-sm ${
                            reviewMessage.type === "success"
                              ? "text-green-600"
                              : "text-red-500"
                          }`}
                        >
                          {reviewMessage.text}
                        </p>
                      )}
                      <Button
                        onClick={handleSubmitReview}
                        isLoading={reviewLoading}
                        disabled={reviewRating === 0}
                      >
                        Enviar Resena
                      </Button>
                    </div>
                  ) : (
                    <Card className="p-5 text-center bg-cream-50">
                      <p className="text-cream-600 mb-3">
                        Inicia sesion para dejar una resena
                      </p>
                      <Link href="/iniciar-sesion">
                        <Button variant="outline" size="sm">
                          Iniciar Sesion
                        </Button>
                      </Link>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ------------------------------------------------------------------ */}
      {/* Related Products                                                   */}
      {/* ------------------------------------------------------------------ */}
      {relatedProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h2 className="font-display text-2xl font-bold text-cream-900 mb-6">
            Productos Relacionados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </motion.div>
      )}
    </section>
  );
}
