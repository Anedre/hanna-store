"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  TrendingUp,
  CalendarDays,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/format";
import type { Order } from "@/types";

// ---------------------------------------------------------------------------
// Status badge mapping
// ---------------------------------------------------------------------------

function statusBadge(status: string) {
  switch (status) {
    case "PENDING":
      return (
        <Badge variant="warning" size="sm">
          Pendiente
        </Badge>
      );
    case "CONFIRMED":
      return (
        <Badge variant="info" size="sm">
          Confirmado
        </Badge>
      );
    case "SHIPPED":
      return (
        <Badge variant="info" size="sm">
          Enviado
        </Badge>
      );
    case "DELIVERED":
      return (
        <Badge variant="success" size="sm">
          Entregado
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge variant="error" size="sm">
          Cancelado
        </Badge>
      );
    default:
      return (
        <Badge variant="default" size="sm">
          {status}
        </Badge>
      );
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MiCuentaPage() {
  const { data: session } = useSession();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders
  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch("/api/orders");
        const result = await res.json();

        if (result.success && result.data) {
          setOrders(result.data);
        } else {
          setError(result.error || "Error al cargar pedidos");
        }
      } catch {
        setError("Error de conexion");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  // Stats
  const orderCount = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const lastOrderDate =
    orders.length > 0 ? new Date(orders[0].createdAt) : null;

  const STAT_CARDS = [
    {
      icon: Package,
      label: "Total Pedidos",
      value: String(orderCount),
      color: "bg-hanna-100 text-hanna-600",
    },
    {
      icon: TrendingUp,
      label: "Total Gastado",
      value: formatPrice(totalSpent),
      color: "bg-gold-100 text-gold-600",
    },
    {
      icon: CalendarDays,
      label: "Ultimo Pedido",
      value: lastOrderDate ? formatDate(lastOrderDate) : "N/A",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: ShoppingBag,
      label: "Pedidos Pendientes",
      value: String(orders.filter((o) => o.status === "PENDING").length),
      color: "bg-amber-100 text-amber-600",
    },
  ];

  return (
    <div>
      {/* Welcome banner */}
      <Card className="p-6 mb-8 bg-gradient-hero text-white">
        <h2 className="font-display text-xl font-bold">
          Bienvenido
          {session?.user?.name ? `, ${session.user.name}` : " de vuelta"}!
        </h2>
        <p className="text-hanna-100 text-sm mt-1">
          Desde aqui puedes gestionar tus pedidos y ver el estado de tus compras.
        </p>
      </Card>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-cream-500 truncate">
                      {stat.label}
                    </p>
                    <p className="font-display font-bold text-cream-900 text-lg leading-tight truncate">
                      {loading ? "-" : stat.value}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-lg text-cream-900">
            Pedidos Recientes
          </h3>
          {orders.length > 0 && (
            <Link
              href="/mi-cuenta/pedidos"
              className="text-sm text-hanna-600 hover:text-hanna-700 font-medium transition-colors flex items-center gap-1"
            >
              Ver todos
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-10">
            <Loader2 className="h-8 w-8 text-hanna-500 mx-auto animate-spin mb-3" />
            <p className="text-cream-500 text-sm">Cargando pedidos...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-10">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* No orders */}
        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-10">
            <Package className="h-12 w-12 text-cream-300 mx-auto mb-3" />
            <p className="text-cream-500 font-medium">
              Aun no tienes pedidos
            </p>
            <p className="text-sm text-cream-400 mt-1">
              Tus pedidos apareceran aqui una vez que realices tu primera compra
            </p>
            <Link href="/productos">
              <Button variant="outline" size="sm" className="mt-4">
                Explorar Productos
              </Button>
            </Link>
          </div>
        )}

        {/* Orders list */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-3">
            {orders.slice(0, 10).map((order, idx) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-cream-50 hover:bg-cream-100 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-hanna-100 flex items-center justify-center shrink-0">
                    <Package className="h-5 w-5 text-hanna-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-cream-900">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-cream-500">
                      {formatDate(order.createdAt)} &middot;{" "}
                      {order.items?.length || 0} producto
                      {(order.items?.length || 0) !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6">
                  {statusBadge(order.status)}
                  <span className="font-display font-bold text-cream-900 text-sm">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Profile section */}
      {session?.user && (
        <Card className="p-6 mt-6">
          <h3 className="font-display font-semibold text-lg text-cream-900 mb-4">
            Informacion de la Cuenta
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-cream-500 mb-0.5">Nombre</p>
              <p className="font-medium text-cream-900">
                {session.user.name || "---"}
              </p>
            </div>
            <div>
              <p className="text-cream-500 mb-0.5">Correo</p>
              <p className="font-medium text-cream-900">
                {session.user.email || "---"}
              </p>
            </div>
            <div>
              <p className="text-cream-500 mb-0.5">DNI</p>
              <p className="font-medium text-cream-900">
                {session.user.dni || "---"}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
