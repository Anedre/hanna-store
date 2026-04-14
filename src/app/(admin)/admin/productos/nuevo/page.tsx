"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { Category } from "@/types";

export default function NuevoProducto() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((j) => { if (j.success) setCategories(j.data || []); });
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      description: fd.get("description") as string,
      shortDescription: fd.get("shortDescription") as string,
      price: parseFloat(fd.get("price") as string),
      compareAtPrice: fd.get("compareAtPrice") ? parseFloat(fd.get("compareAtPrice") as string) : null,
      sku: fd.get("sku") as string,
      stock: parseInt(fd.get("stock") as string),
      categoryId: fd.get("categoryId") as string,
      brand: fd.get("brand") as string || "",
      subcategorySlug: fd.get("subcategorySlug") as string || "",
      origin: fd.get("origin") as string || "Internacional",
      tags: fd.get("tags") as string || "",
      weight: fd.get("weight") as string || null,
      featured: fd.get("featured") === "on",
      active: fd.get("active") !== "off",
      images: fd.get("imageUrl") ? [fd.get("imageUrl") as string] : [],
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        router.push("/admin/productos");
      } else {
        setError(json.error || "Error al crear el producto");
      }
    } catch {
      setError("Error de conexion");
    }
    setSaving(false);
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/productos" className="p-2 rounded-lg hover:bg-cream-200 transition-colors">
          <ArrowLeft className="h-5 w-5 text-cream-600" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-cream-900">Nuevo Producto</h1>
          <p className="text-sm text-cream-500">Completa la informacion del producto</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <Card className="p-6">
          <h2 className="font-display font-semibold text-lg text-cream-900 mb-4">Informacion Basica</h2>
          <div className="space-y-4">
            <Input label="Nombre del producto *" name="name" required placeholder="Ej: Audifonos Bluetooth Pro" />
            <Input label="Descripcion corta *" name="shortDescription" required placeholder="Breve descripcion para listados" />
            <div>
              <label className="block text-sm font-medium text-cream-700 mb-1.5">Descripcion completa *</label>
              <textarea
                name="description"
                required
                rows={4}
                placeholder="Descripcion detallada del producto..."
                className="w-full rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-sm text-cream-900 placeholder:text-cream-400 focus:border-hanna-500 focus:outline-none focus:ring-2 focus:ring-hanna-500/20 transition-all"
              />
            </div>
          </div>
        </Card>

        {/* Pricing */}
        <Card className="p-6">
          <h2 className="font-display font-semibold text-lg text-cream-900 mb-4">Precios y Stock</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Precio (PEN) *" name="price" type="number" step="0.01" min="0" required placeholder="99.90" />
            <Input label="Precio anterior (tachado)" name="compareAtPrice" type="number" step="0.01" min="0" placeholder="149.90" />
            <Input label="SKU *" name="sku" required placeholder="TEC-AUD-001" />
            <Input label="Stock *" name="stock" type="number" min="0" required placeholder="50" />
          </div>
        </Card>

        {/* Organization */}
        <Card className="p-6">
          <h2 className="font-display font-semibold text-lg text-cream-900 mb-4">Organizacion</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-cream-700 mb-1.5">Categoria *</label>
              <select
                name="categoryId"
                required
                className="w-full rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-sm text-cream-900 focus:border-hanna-500 focus:outline-none focus:ring-2 focus:ring-hanna-500/20"
              >
                <option value="">Seleccionar...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <Input label="Marca *" name="brand" placeholder="Samsung, Nike, JBL..." required />
            <Input label="Subcategoria" name="subcategorySlug" placeholder="audifonos, skincare, calzado..." />
            <Input label="Pais de origen" name="origin" placeholder="China" />
            <Input label="Tags (separados por coma)" name="tags" placeholder="bluetooth,inalambrico" />
            <Input label="Peso" name="weight" placeholder="250g" />
          </div>
          <div className="flex gap-6 mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="featured" className="rounded border-cream-300 text-hanna-500 focus:ring-hanna-500" />
              <span className="text-sm text-cream-700">Producto destacado</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="active" defaultChecked className="rounded border-cream-300 text-hanna-500 focus:ring-hanna-500" />
              <span className="text-sm text-cream-700">Activo (visible en tienda)</span>
            </label>
          </div>
        </Card>

        {/* Image */}
        <Card className="p-6">
          <h2 className="font-display font-semibold text-lg text-cream-900 mb-4">Imagen</h2>
          <Input
            label="URL de la imagen"
            name="imageUrl"
            placeholder="https://ejemplo.com/imagen.jpg o /images/products/mi-producto.png"
            icon={<ImagePlus className="h-4 w-4" />}
          />
          <p className="text-xs text-cream-400 mt-2">
            Puedes usar una URL externa o una ruta local dentro de /public/images/products/
          </p>
        </Card>

        {/* Submit */}
        <div className="flex gap-3">
          <Button type="submit" size="lg" isLoading={saving}>
            <Save className="h-4 w-4 mr-1" /> Crear Producto
          </Button>
          <Link href="/admin/productos">
            <Button type="button" variant="ghost" size="lg">Cancelar</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
