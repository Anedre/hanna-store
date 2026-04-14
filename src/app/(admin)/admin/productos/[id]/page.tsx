"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { Category } from "@/types";

export default function EditarProducto() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", description: "", shortDescription: "", price: "", compareAtPrice: "",
    sku: "", stock: "", categoryId: "", origin: "", tags: "", weight: "",
    featured: false, active: true, imageUrl: "",
  });

  useEffect(() => {
    async function load() {
      const [prodRes, catRes] = await Promise.all([
        fetch(`/api/products?perPage=200`),
        fetch("/api/categories"),
      ]);
      const prodJson = await prodRes.json();
      const catJson = await catRes.json();

      if (catJson.success) setCategories(catJson.data || []);

      const allProducts = prodJson.data?.products || [];
      const product = allProducts.find((p: any) => p.id === id);
      if (product) {
        const images = typeof product.images === "string" ? JSON.parse(product.images) : product.images || [];
        setForm({
          name: product.name || "", description: product.description || "",
          shortDescription: product.shortDescription || "", price: String(product.price || ""),
          compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
          sku: product.sku || "", stock: String(product.stock || 0),
          categoryId: product.categoryId || "", origin: product.origin || "",
          tags: product.tags || "", weight: product.weight || "",
          featured: product.featured || false, active: product.active !== false,
          imageUrl: images[0] || "",
        });
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
          stock: parseInt(form.stock),
          images: form.imageUrl ? [form.imageUrl] : [],
        }),
      });
      const json = await res.json();
      if (json.success) router.push("/admin/productos");
      else setError(json.error || "Error al actualizar");
    } catch {
      setError("Error de conexion");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="max-w-3xl">
        <div className="h-8 bg-cream-200 rounded w-48 mb-6 animate-pulse" />
        <Card className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-cream-200 rounded animate-pulse" />)}
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/productos" className="p-2 rounded-lg hover:bg-cream-200 transition-colors">
          <ArrowLeft className="h-5 w-5 text-cream-600" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-cream-900">Editar Producto</h1>
          <p className="text-sm text-cream-500">{form.name}</p>
        </div>
      </div>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-4">
          <h2 className="font-display font-semibold text-lg text-cream-900">Informacion</h2>
          <Input label="Nombre *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Descripcion corta *" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-cream-700 mb-1.5">Descripcion completa</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4}
              className="w-full rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-sm focus:border-hanna-500 focus:outline-none focus:ring-2 focus:ring-hanna-500/20 transition-all" />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="font-display font-semibold text-lg text-cream-900">Precios y Stock</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Precio (PEN) *" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            <Input label="Precio anterior" type="number" step="0.01" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} />
            <Input label="SKU *" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
            <Input label="Stock *" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="font-display font-semibold text-lg text-cream-900">Organizacion</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-cream-700 mb-1.5">Categoria</label>
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-sm focus:border-hanna-500 focus:outline-none focus:ring-2 focus:ring-hanna-500/20">
                <option value="">Seleccionar...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <Input label="Origen" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} />
            <Input label="Tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            <Input label="Peso" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded border-cream-300 text-hanna-500" />
              <span className="text-sm text-cream-700">Destacado</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="rounded border-cream-300 text-hanna-500" />
              <span className="text-sm text-cream-700">Activo</span>
            </label>
          </div>
        </Card>

        <Card className="p-6">
          <Input label="URL de imagen" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
        </Card>

        <div className="flex gap-3">
          <Button type="submit" size="lg" isLoading={saving}><Save className="h-4 w-4 mr-1" /> Guardar Cambios</Button>
          <Link href="/admin/productos"><Button type="button" variant="ghost" size="lg">Cancelar</Button></Link>
        </div>
      </form>
    </div>
  );
}
