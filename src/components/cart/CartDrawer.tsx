"use client";

import { X, ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { SHIPPING } from "@/lib/constants";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal } =
    useCartStore();

  const sub = subtotal();
  const shippingCost = sub >= SHIPPING.freeThreshold ? 0 : SHIPPING.cost;
  const total = sub + shippingCost;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 h-full w-full sm:w-96 bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200">
              <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-hanna-500" />
                Mi Carrito ({items.length})
              </h2>
              <button
                onClick={closeCart}
                className="p-1.5 rounded-lg hover:bg-cream-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-cream-400">
                  <ShoppingBag className="h-16 w-16 mb-4 opacity-30" />
                  <p className="font-medium">Tu carrito esta vacio</p>
                  <p className="text-sm mt-1">Agrega productos para empezar</p>
                  <Link href="/productos" onClick={closeCart}>
                    <Button variant="primary" size="sm" className="mt-4">
                      Ver Productos
                    </Button>
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="flex gap-3 p-3 rounded-xl bg-cream-50 border border-cream-200"
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-cream-200 shrink-0">
                      <Image
                        src={item.image || "/images/products/placeholder.jpg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/productos/${item.slug}`}
                        onClick={closeCart}
                        className="text-sm font-medium text-cream-900 hover:text-hanna-600 line-clamp-1 transition-colors"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm font-semibold text-hanna-600 mt-0.5">
                        {formatPrice(item.price)}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-6 h-6 flex items-center justify-center rounded-md bg-cream-200 hover:bg-cream-300 transition-colors cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            disabled={item.quantity >= item.maxStock}
                            className="w-6 h-6 flex items-center justify-center rounded-md bg-cream-200 hover:bg-cream-300 transition-colors disabled:opacity-40 cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-cream-400 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Summary */}
            {items.length > 0 && (
              <div className="border-t border-cream-200 p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-cream-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(sub)}</span>
                </div>
                <div className="flex justify-between text-sm">
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
                <div className="flex justify-between text-base font-semibold pt-2 border-t border-cream-200">
                  <span>Total</span>
                  <span className="text-hanna-600">{formatPrice(total)}</span>
                </div>
                <Link href="/checkout" onClick={closeCart} className="block">
                  <Button variant="primary" size="lg" className="w-full">
                    Proceder al Pago
                  </Button>
                </Link>
                <Link
                  href="/carrito"
                  onClick={closeCart}
                  className="block text-center text-sm text-hanna-600 hover:underline"
                >
                  Ver carrito completo
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
