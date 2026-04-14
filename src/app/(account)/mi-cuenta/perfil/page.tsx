"use client";

import { useState, useEffect } from "react";
import { Save, User, AlertCircle, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function MiPerfil() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState({
    dni: "", name: "", lastName: "", email: "", phone: "",
    address: "", city: "", district: "", postalCode: "",
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/users/profile");
        const json = await res.json();
        if (json.success && json.data) {
          setForm({
            dni: json.data.dni || "",
            name: json.data.name || "",
            lastName: json.data.lastName || "",
            email: json.data.email || "",
            phone: json.data.phone || "",
            address: json.data.address || "",
            city: json.data.city || "",
            district: json.data.district || "",
            postalCode: json.data.postalCode || "",
          });
        }
      } catch { /* */ }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const { dni, ...data } = form;
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: "Perfil actualizado correctamente" });
      } else {
        setMessage({ type: "error", text: json.error || "Error al actualizar" });
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexion" });
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-cream-900 mb-6">Mi Perfil</h1>
        <Card className="p-6 space-y-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-cream-200 rounded animate-pulse" />)}
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-cream-900 mb-1">Mi Perfil</h1>
      <p className="text-sm text-cream-500 mb-6">Actualiza tu informacion personal</p>

      {message && (
        <div className={`mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
          message.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"
        }`}>
          {message.type === "success" ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h2 className="font-display font-semibold text-lg text-cream-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-hanna-500" /> Datos Personales
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Input label="DNI" value={form.dni} disabled />
              <p className="text-xs text-cream-400 mt-1">El DNI no se puede cambiar</p>
            </div>
            <Input label="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input label="Nombre *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="Apellido *" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
            <Input label="Telefono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="999999999" />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display font-semibold text-lg text-cream-900 mb-4">Direccion de Envio</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input label="Direccion" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Av. Principal 123, Dpto. 4B" />
            </div>
            <Input label="Distrito" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} placeholder="San Isidro" />
            <Input label="Ciudad" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Lima" />
            <Input label="Codigo Postal" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} placeholder="15036" />
          </div>
        </Card>

        <Button type="submit" size="lg" isLoading={saving}>
          <Save className="h-4 w-4 mr-1" /> Guardar Cambios
        </Button>
      </form>
    </div>
  );
}
