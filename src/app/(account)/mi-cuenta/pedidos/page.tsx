"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, ShoppingBag, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate } from "@/lib/format";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "success" | "warning" | "error" | "info" }> = {
  PENDING: { label: "Pendiente", variant: "warning" },
  CONFIRMED: { label: "Confirmado", variant: "info" },
  SHIPPED: { label: "Enviado", variant: "default" },
  DELIVERED: { label: "Entregado", variant: "success" },
  CANCELLED: { label: "Cancelado", variant: "error" },
};

export default function MisPedidos() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/orders");
        const json = await res.json();
        if (json.success) setOrders(json.data || []);
      } catch { /* */ }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-cream-900 mb-1">Mis Pedidos</h1>
      <p className="text-sm text-cream-500 mb-6">{orders.length} pedidos realizados</p>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-5 animate-pulse">
              <div className="h-4 bg-cream-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-cream-200 rounded w-2/3" />
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card className="p-8 text-center">
          <ShoppingBag className="h-12 w-12 text-cream-300 mx-auto mb-3" />
          <h2 className="font-display font-semibold text-lg text-cream-900 mb-1">
            Aun no tienes pedidos
          </h2>
          <p className="text-sm text-cream-500 mb-4">
            Explora nuestra tienda y encuentra productos increibles
          </p>
          <Link href="/productos">
            <Button>
              Ver Productos <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const st = STATUS_MAP[order.status] || STATUS_MAP.PENDING;
            const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items || [];

            return (
              <Card key={order.id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-hanna-50 flex items-center justify-center">
                      <Package className="h-5 w-5 text-hanna-500" />
                    </div>
                    <div>
                      <p className="font-mono font-semibold text-sm text-cream-900">{order.orderNumber}</p>
                      <p className="text-xs text-cream-500">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={st.variant} size="md">{st.label}</Badge>
                    <span className="font-display font-bold text-cream-900">{formatPrice(order.total)}</span>
                  </div>
                </div>

                {items.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-cream-100">
                    <p className="text-xs text-cream-500 mb-1">{items.length} producto(s)</p>
                    <div className="flex flex-wrap gap-2">
                      {items.map((item: any, i: number) => (
                        <span key={i} className="text-xs bg-cream-50 px-2 py-1 rounded-lg text-cream-600">
                          {item.name || item.productName || `Producto`} x{item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between text-xs text-cream-500">
                  <span>Metodo: <span className="capitalize">{order.paymentMethod}</span></span>
                  <span>Envio: {order.shippingCost === 0 ? "Gratis" : formatPrice(order.shippingCost)}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
