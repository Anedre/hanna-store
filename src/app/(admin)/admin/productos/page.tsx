"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Trash2, Search, Eye, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types";

export default function AdminProductos() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/products?perPage=100&search=${search}`);
        const json = await res.json();
        if (json.success) setProducts(json.data?.products || []);
      } catch { /* silent */ }
      setLoading(false);
    }
    load();
  }, [search]);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Estas seguro de eliminar "${name}"?`)) return;
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Error al eliminar el producto");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-cream-900">Productos</h1>
          <p className="text-sm text-cream-500 mt-1">{products.length} productos en total</p>
        </div>
        <Link href="/admin/productos/nuevo">
          <Button><Plus className="h-4 w-4 mr-1" /> Nuevo Producto</Button>
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="h-4 w-4" />}
        />
      </div>

      {/* Products Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cream-50 border-b border-cream-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-cream-600 uppercase">Producto</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-cream-600 uppercase">Categoria</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-cream-600 uppercase">Precio</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-cream-600 uppercase">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-cream-600 uppercase">Estado</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-cream-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 bg-cream-200 rounded w-40" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-cream-200 rounded w-20" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-cream-200 rounded w-16" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-cream-200 rounded w-10" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-cream-200 rounded w-14" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-cream-200 rounded w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Package className="h-10 w-10 text-cream-300 mx-auto mb-3" />
                    <p className="text-cream-500 font-medium">No se encontraron productos</p>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const images = typeof product.images === "string"
                    ? JSON.parse(product.images)
                    : product.images || [];
                  const img = images[0] || "/images/products/placeholder.png";

                  return (
                    <tr key={product.id} className="hover:bg-cream-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-cream-100 shrink-0">
                            <Image src={img} alt={product.name} width={40} height={40} className="object-cover w-full h-full" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-cream-900 line-clamp-1">{product.name}</p>
                            <p className="text-xs text-cream-400">SKU: {product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-cream-600">{product.category?.name || "-"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-cream-900">{formatPrice(product.price)}</span>
                        {product.compareAtPrice && (
                          <span className="block text-xs text-cream-400 line-through">{formatPrice(product.compareAtPrice)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-medium ${product.stock > 10 ? "text-green-600" : product.stock > 0 ? "text-amber-600" : "text-red-600"}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={product.active ? "success" : "error"} size="sm">
                          {product.active ? "Activo" : "Inactivo"}
                        </Badge>
                        {product.featured && (
                          <Badge variant="gold" size="sm" className="ml-1">Destacado</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/productos/${product.slug}`} target="_blank" className="p-1.5 rounded-lg text-cream-400 hover:text-hanna-600 hover:bg-cream-100 transition-colors">
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link href={`/admin/productos/${product.id}`} className="p-1.5 rounded-lg text-cream-400 hover:text-hanna-600 hover:bg-cream-100 transition-colors">
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="p-1.5 rounded-lg text-cream-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
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
