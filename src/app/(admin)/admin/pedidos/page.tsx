"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Eye, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/format";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "success" | "warning" | "error" | "info" | "gold" }> = {
  PENDING: { label: "Pendiente", variant: "warning" },
  CONFIRMED: { label: "Confirmado", variant: "info" },
  SHIPPED: { label: "Enviado", variant: "default" },
  DELIVERED: { label: "Entregado", variant: "success" },
  CANCELLED: { label: "Cancelado", variant: "error" },
};

export default function AdminPedidos() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/orders");
        const json = await res.json();
        if (json.success) setOrders(json.data || []);
      } catch { /* */ }
      setLoading(false);
    }
    load();
  }, []);

  async function updateStatus(orderId: string, newStatus: string) {
    try {
      await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch {
      alert("Error al actualizar el estado");
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-cream-900 mb-1">Pedidos</h1>
      <p className="text-sm text-cream-500 mb-6">{orders.length} pedidos en total</p>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cream-50 border-b border-cream-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-cream-600 uppercase"># Pedido</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-cream-600 uppercase">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-cream-600 uppercase">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-cream-600 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-cream-600 uppercase">Pago</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-cream-600 uppercase">Estado</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-cream-600 uppercase">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-cream-200 rounded w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <ShoppingCart className="h-10 w-10 text-cream-300 mx-auto mb-3" />
                    <p className="text-cream-500">No hay pedidos todavia</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const st = STATUS_MAP[order.status] || STATUS_MAP.PENDING;
                  return (
                    <tr key={order.id} className="hover:bg-cream-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono font-medium text-cream-900">{order.orderNumber}</td>
                      <td className="px-4 py-3 text-sm text-cream-700">{order.user?.name} {order.user?.lastName}</td>
                      <td className="px-4 py-3 text-sm text-cream-500">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-cream-900">{formatPrice(order.total)}</td>
                      <td className="px-4 py-3 text-sm text-cream-600 capitalize">{order.paymentMethod}</td>
                      <td className="px-4 py-3">
                        <Badge variant={st.variant} size="sm">{st.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className="text-xs border border-cream-300 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-hanna-500"
                        >
                          <option value="PENDING">Pendiente</option>
                          <option value="CONFIRMED">Confirmado</option>
                          <option value="SHIPPED">Enviado</option>
                          <option value="DELIVERED">Entregado</option>
                          <option value="CANCELLED">Cancelado</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
