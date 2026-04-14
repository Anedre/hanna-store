"use client";

import { useState, useEffect } from "react";
import { FolderOpen, Plus, Trash2, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function AdminCategorias() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/categories");
    const json = await res.json();
    if (json.success) setCategories(json.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, description: newDesc }),
    });
    const json = await res.json();
    if (json.success) {
      setNewName("");
      setNewDesc("");
      setShowForm(false);
      load();
    } else {
      alert(json.error);
    }
    setSaving(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Eliminar la categoria "${name}"?`)) return;
    const res = await fetch("/api/admin/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const json = await res.json();
    if (json.success) {
      load();
    } else {
      alert(json.error);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-cream-900">Categorias</h1>
          <p className="text-sm text-cream-500 mt-1">{categories.length} categorias</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> Nueva Categoria
        </Button>
      </div>

      {showForm && (
        <Card className="p-5 mb-6">
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
            <Input placeholder="Nombre de la categoria" value={newName} onChange={(e) => setNewName(e.target.value)} required />
            <Input placeholder="Descripcion (opcional)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
            <Button type="submit" isLoading={saving} className="shrink-0">Crear</Button>
          </form>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? [...Array(6)].map((_, i) => (
              <Card key={i} className="p-5 animate-pulse">
                <div className="h-5 bg-cream-200 rounded w-2/3 mb-2" />
                <div className="h-3 bg-cream-200 rounded w-full" />
              </Card>
            ))
          : categories.map((cat) => (
              <Card key={cat.id} className="p-5 group hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-hanna-50 flex items-center justify-center">
                      <FolderOpen className="h-5 w-5 text-hanna-500" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-cream-900">{cat.name}</h3>
                      <p className="text-xs text-cream-500 mt-0.5">{cat.slug}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-1.5 rounded-lg text-cream-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {cat.description && (
                  <p className="text-sm text-cream-600 mt-3 line-clamp-2">{cat.description}</p>
                )}
                <div className="mt-3 flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5 text-cream-400" />
                  <span className="text-xs text-cream-500">{cat.productCount} productos</span>
                </div>
              </Card>
            ))}
      </div>
    </div>
  );
}
