"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, ShoppingCart, Users, Star, DollarSign, TrendingUp, Eye, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  totalReviews: number;
  totalMessages: number;
  recentOrders: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/stats");
        const json = await res.json();
        if (json.success) setStats(json.data);
      } catch { /* silent */ }
    }
    load();
  }, []);

  const cards = [
    { label: "Productos", value: stats?.totalProducts ?? "...", icon: Package, color: "bg-hanna-100 text-hanna-600", href: "/admin/productos" },
    { label: "Pedidos", value: stats?.totalOrders ?? "...", icon: ShoppingCart, color: "bg-gold-100 text-gold-600", href: "/admin/pedidos" },
    { label: "Ingresos", value: stats ? formatPrice(stats.totalRevenue) : "...", icon: DollarSign, color: "bg-green-100 text-green-600", href: "/admin/pedidos" },
    { label: "Resenas", value: stats?.totalReviews ?? "...", icon: Star, color: "bg-purple-100 text-purple-600", href: "/admin/resenas" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-cream-900">Dashboard</h1>
          <p className="text-sm text-cream-500 mt-1">Resumen general de la tienda</p>
        </div>
        <Link href="/admin/productos/nuevo">
          <Button>
            <Plus className="h-4 w-4 mr-1" /> Nuevo Producto
          </Button>
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}>
            <Card className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-cream-500 uppercase tracking-wider">{c.label}</p>
                  <p className="font-display font-bold text-2xl text-cream-900 mt-1">{c.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center`}>
                  <c.icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pending orders alert */}
      {stats && stats.pendingOrders > 0 && (
        <Card className="p-4 mb-6 border-gold-300 bg-gold-50">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-5 w-5 text-gold-600" />
            <p className="text-sm text-gold-700 font-medium">
              Tienes <strong>{stats.pendingOrders}</strong> pedidos pendientes por confirmar.
            </p>
            <Link href="/admin/pedidos" className="text-sm text-gold-600 underline ml-auto">Ver pedidos</Link>
          </div>
        </Card>
      )}

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Link href="/admin/productos/nuevo">
          <Card interactive className="p-5 text-center">
            <Package className="h-8 w-8 text-hanna-500 mx-auto mb-2" />
            <p className="font-display font-semibold text-sm">Agregar Producto</p>
            <p className="text-xs text-cream-500 mt-1">Crear nuevo producto</p>
          </Card>
        </Link>
        <Link href="/admin/pedidos">
          <Card interactive className="p-5 text-center">
            <ShoppingCart className="h-8 w-8 text-gold-500 mx-auto mb-2" />
            <p className="font-display font-semibold text-sm">Gestionar Pedidos</p>
            <p className="text-xs text-cream-500 mt-1">Ver y actualizar estados</p>
          </Card>
        </Link>
        <Link href="/admin/resenas">
          <Card interactive className="p-5 text-center">
            <Star className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="font-display font-semibold text-sm">Moderar Resenas</p>
            <p className="text-xs text-cream-500 mt-1">Aprobar o rechazar</p>
          </Card>
        </Link>
      </div>

      {/* Messages count */}
      {stats && stats.totalMessages > 0 && (
        <Card className="p-4">
          <p className="text-sm text-cream-600">
            Tienes <strong>{stats.totalMessages}</strong> mensajes de contacto.{" "}
            <Link href="/admin/mensajes" className="text-hanna-600 underline">Ver mensajes</Link>
          </p>
        </Card>
      )}
    </div>
  );
}
