"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Tag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { createCoupon, toggleCoupon, deleteCoupon } from "@/actions/coupons";
import { formatPrice } from "@/lib/format";
import type { Coupon } from "@/types";

export function CouponsClient({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    code: "",
    type: "PERCENT" as "PERCENT" | "FIXED",
    value: "",
    minOrder: "",
    maxUses: "",
    endsAt: "",
  });

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await createCoupon({
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minOrder: form.minOrder ? Number(form.minOrder) : undefined,
        maxUses: form.maxUses ? Number(form.maxUses) : undefined,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
        active: true,
      });
      if (!res.success) {
        setError(res.error);
        return;
      }
      setShowForm(false);
      setForm({ code: "", type: "PERCENT", value: "", minOrder: "", maxUses: "", endsAt: "" });
      router.refresh();
    });
  }

  function toggle(c: Coupon) {
    startTransition(async () => {
      await toggleCoupon(c.id, !c.active);
      router.refresh();
    });
  }

  function remove(c: Coupon) {
    if (!window.confirm(`¿Eliminar el cupón ${c.code}? Los pedidos ya creados no se afectan.`)) return;
    startTransition(async () => {
      await deleteCoupon(c.id);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-cream-900">Cupones</h1>
          <p className="text-sm text-cream-500 mt-1">
            Códigos de descuento para el checkout. El uso se consume al crear el pedido.
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1" /> Nuevo cupón
        </Button>
      </div>

      {coupons.length === 0 ? (
        <Card className="p-12 text-center">
          <Tag className="h-10 w-10 text-cream-300 mx-auto mb-3" />
          <p className="text-cream-600 font-medium mb-1">Sin cupones todavía</p>
          <p className="text-sm text-cream-500">Crea códigos tipo HANNA10 para tus campañas y seguidores.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream-50 border-b border-cream-200">
                <tr>
                  {["Código", "Descuento", "Mínimo", "Usos", "Vence", "Estado", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-cream-600 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {coupons.map((c) => {
                  const expired = c.endsAt && new Date(c.endsAt) < new Date();
                  const exhausted = c.maxUses && c.usedCount >= c.maxUses;
                  return (
                    <tr key={c.id} className="hover:bg-cream-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono font-bold text-cream-900">{c.code}</td>
                      <td className="px-4 py-3 text-sm text-cream-700">
                        {c.type === "PERCENT" ? `${c.value}%` : formatPrice(c.value)}
                      </td>
                      <td className="px-4 py-3 text-sm text-cream-500">
                        {c.minOrder ? formatPrice(c.minOrder) : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-cream-700">
                        {c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""}
                      </td>
                      <td className="px-4 py-3 text-sm text-cream-500">
                        {c.endsAt ? new Date(c.endsAt).toLocaleDateString("es-PE") : "Sin fecha"}
                      </td>
                      <td className="px-4 py-3">
                        {exhausted ? (
                          <Badge variant="error" size="sm">Agotado</Badge>
                        ) : expired ? (
                          <Badge variant="warning" size="sm">Vencido</Badge>
                        ) : c.active ? (
                          <Badge variant="success" size="sm">Activo</Badge>
                        ) : (
                          <Badge variant="default" size="sm">Pausado</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => toggle(c)}
                          className="text-xs text-hanna-600 hover:underline mr-3 cursor-pointer"
                        >
                          {c.active ? "Pausar" : "Activar"}
                        </button>
                        <button onClick={() => remove(c)} className="text-cream-400 hover:text-red-500 cursor-pointer">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Nuevo cupón" size="md">
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-cream-700 mb-1">Código *</label>
              <Input
                placeholder="HANNA10"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cream-700 mb-1">Tipo</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as "PERCENT" | "FIXED" })}
                className="w-full text-sm border border-cream-300 rounded-lg px-2 py-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-hanna-500"
              >
                <option value="PERCENT">Porcentaje (%)</option>
                <option value="FIXED">Monto fijo (S/)</option>
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-cream-700 mb-1">
                {form.type === "PERCENT" ? "% de descuento *" : "Monto S/ *"}
              </label>
              <Input
                type="number"
                min={1}
                max={form.type === "PERCENT" ? 90 : undefined}
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cream-700 mb-1">Compra mínima S/</label>
              <Input
                type="number"
                min={0}
                placeholder="Opcional"
                value={form.minOrder}
                onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cream-700 mb-1">Máx. usos</label>
              <Input
                type="number"
                min={1}
                placeholder="Ilimitado"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-cream-700 mb-1">Vence (opcional)</label>
            <Input
              type="datetime-local"
              value={form.endsAt}
              onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={submit} isLoading={isPending} disabled={!form.code || !form.value}>
              Crear cupón
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
