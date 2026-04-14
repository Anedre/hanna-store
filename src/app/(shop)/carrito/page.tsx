"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";
import { SHIPPING } from "@/lib/constants";

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, clearCart, subtotal } =
    useCartStore();

  const sub = subtotal();
  const shippingCost = sub >= SHIPPING.freeThreshold ? 0 : SHIPPING.cost;
  const total = sub + shippingCost;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-cream-900 mb-8">
        Mi <span className="text-gradient">Carrito</span>
      </h1>

      {items.length === 0 ? (
        /* Empty Cart */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <ShoppingBag className="h-20 w-20 text-cream-300 mx-auto mb-6" />
          <h2 className="font-display text-2xl font-semibold text-cream-700 mb-2">
            Tu carrito esta vacio
          </h2>
          <p className="text-cream-500 mb-8">
            Agrega productos a tu carrito para comenzar a comprar
          </p>
          <Link href="/productos">
            <Button size="lg">
              Explorar Productos
              <ArrowRight className="h-5 w-5 ml-1" />
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-cream-600">
                {items.length} {items.length === 1 ? "producto" : "productos"}{" "}
                en tu carrito
              </p>
              <button
                onClick={clearCart}
                className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors cursor-pointer"
              >
                Vaciar carrito
              </button>
            </div>

            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                >
                  <Card className="p-4 sm:p-5">
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-cream-200 shrink-0">
                        <Image
                          src={item.image || "/images/products/placeholder.jpg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/productos/${item.slug}`}
                          className="font-display font-semibold text-cream-900 hover:text-hanna-600 transition-colors line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        <p className="text-lg font-bold text-hanna-600 mt-1">
                          {formatPrice(item.price)}
                        </p>

                        <div className="flex items-center justify-between mt-3">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="w-8 h-8 flex items-center justify-center rounded-lg border border-cream-300 hover:bg-cream-100 transition-colors cursor-pointer"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-10 text-center font-medium text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              disabled={item.quantity >= item.maxStock}
                              className="w-8 h-8 flex items-center justify-center rounded-lg border border-cream-300 hover:bg-cream-100 transition-colors disabled:opacity-40 cursor-pointer"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Subtotal & Remove */}
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-semibold text-cream-800">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-2 text-cream-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            <Link
              href="/productos"
              className="inline-flex items-center gap-1.5 text-sm text-hanna-600 hover:text-hanna-700 font-medium transition-colors mt-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Seguir comprando
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="font-display font-semibold text-lg text-cream-900 mb-5">
                Resumen del Pedido
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-cream-600">
                    Subtotal ({items.length}{" "}
                    {items.length === 1 ? "producto" : "productos"})
                  </span>
                  <span className="font-medium">{formatPrice(sub)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cream-600">Envio</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? (
                      <span className="text-green-600">Gratis</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>
                {shippingCost > 0 && (
                  <p className="text-xs text-hanna-600">
                    Envio gratis en compras mayores a{" "}
                    {formatPrice(SHIPPING.freeThreshold)}
                  </p>
                )}
              </div>

              <div className="flex justify-between text-lg font-bold mt-5 pt-4 border-t border-cream-200">
                <span>Total</span>
                <span className="text-hanna-600">{formatPrice(total)}</span>
              </div>

              <Link href="/checkout" className="block mt-6">
                <Button size="lg" className="w-full">
                  Proceder al Pago
                  <ArrowRight className="h-5 w-5 ml-1" />
                </Button>
              </Link>

              <div className="flex items-center gap-2 mt-4 text-xs text-cream-500 justify-center">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                Compra 100% segura y protegida
              </div>
            </Card>
          </div>
        </div>
      )}
    </section>
  );
}
