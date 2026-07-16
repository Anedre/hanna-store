"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Megaphone, Image as ImageIcon, Timer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { createCampaign, toggleCampaign, deleteCampaign } from "@/actions/campaigns";
import type { Campaign } from "@/types";

interface Option { id: string; name: string }

const selectCls =
  "w-full text-sm border border-cream-300 rounded-lg px-2 py-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-hanna-500";

function toLocalInput(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function CampaignsClient({
  campaigns,
  categories,
  products,
}: {
  campaigns: Campaign[];
  categories: Option[];
  products: Option[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    name: "",
    discountPercent: "",
    appliesTo: "ALL" as "ALL" | "CATEGORY" | "PRODUCTS",
    categoryId: "",
    productIds: [] as string[],
    startsAt: toLocalInput(0),
    endsAt: toLocalInput(7),
    showCountdown: true,
    withHero: true,
    heroTitle: "",
    heroSubtitle: "",
    heroCtaText: "Ver ofertas",
    heroCtaLink: "/ofertas",
    heroImageUrl: "",
    priority: "10",
  });

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await createCampaign({
        name: form.name,
        discountPercent: Number(form.discountPercent) || 0,
        appliesTo: form.appliesTo,
        categoryId: form.appliesTo === "CATEGORY" ? form.categoryId : undefined,
        productIds: form.appliesTo === "PRODUCTS" ? form.productIds : undefined,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
        showCountdown: form.showCountdown,
        active: true,
        priority: Number(form.priority) || 0,
        hero: form.withHero
          ? {
              title: form.heroTitle,
              subtitle: form.heroSubtitle || undefined,
              ctaText: form.heroCtaText,
              ctaLink: form.heroCtaLink,
              imageUrl: form.heroImageUrl,
            }
          : null,
      });
      if (!res.success) {
        setError(res.error);
        return;
      }
      setShowForm(false);
      router.refresh();
    });
  }

  function toggle(c: Campaign) {
    startTransition(async () => {
      await toggleCampaign(c.id, !c.active);
      router.refresh();
    });
  }

  function remove(c: Campaign) {
    if (!window.confirm(`¿Eliminar la campaña "${c.name}"?`)) return;
    startTransition(async () => {
      await deleteCampaign(c.id);
      router.refresh();
    });
  }

  function scopeLabel(c: Campaign) {
    if (c.appliesTo === "ALL") return "Toda la tienda";
    if (c.appliesTo === "CATEGORY") {
      return `Categoría: ${categories.find((x) => x.id === c.categoryId)?.name ?? "?"}`;
    }
    return `${c.productIds?.length ?? 0} producto(s)`;
  }

  const now = new Date();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-cream-900">Campañas</h1>
          <p className="text-sm text-cream-500 mt-1">
            Banners de portada, descuentos con precio tachado y countdown — todo desde aquí.
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1" /> Nueva campaña
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card className="p-12 text-center">
          <Megaphone className="h-10 w-10 text-cream-300 mx-auto mb-3" />
          <p className="text-cream-600 font-medium mb-1">Sin campañas todavía</p>
          <p className="text-sm text-cream-500">
            Crea tu primera campaña: un banner en portada, un % de descuento, o ambos.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {campaigns.map((c) => {
            const live = c.active && new Date(c.startsAt) <= now && now <= new Date(c.endsAt);
            const ended = new Date(c.endsAt) < now;
            return (
              <Card key={c.id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-semibold text-cream-900">{c.name}</span>
                      {live ? (
                        <Badge variant="success" size="sm">En vivo</Badge>
                      ) : ended ? (
                        <Badge variant="default" size="sm">Terminada</Badge>
                      ) : c.active ? (
                        <Badge variant="info" size="sm">Programada</Badge>
                      ) : (
                        <Badge variant="warning" size="sm">Pausada</Badge>
                      )}
                      {c.hero && (
                        <span className="inline-flex items-center gap-1 text-xs text-cream-500">
                          <ImageIcon className="h-3 w-3" /> banner
                        </span>
                      )}
                      {c.showCountdown && (
                        <span className="inline-flex items-center gap-1 text-xs text-cream-500">
                          <Timer className="h-3 w-3" /> countdown
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-cream-500 mt-1">
                      {c.discountPercent > 0 ? <strong className="text-hanna-600">−{c.discountPercent}%</strong> : "Sin descuento"}
                      {" · "}{scopeLabel(c)}
                      {" · "}
                      {new Date(c.startsAt).toLocaleDateString("es-PE")} → {new Date(c.endsAt).toLocaleDateString("es-PE")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button onClick={() => toggle(c)} className="text-xs text-hanna-600 hover:underline cursor-pointer">
                      {c.active ? "Pausar" : "Activar"}
                    </button>
                    <button onClick={() => remove(c)} className="text-cream-400 hover:text-red-500 cursor-pointer">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Nueva campaña" size="lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-cream-700 mb-1">Nombre *</label>
              <Input
                placeholder="Ej: Semana del Setup"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cream-700 mb-1">Descuento %</label>
              <Input
                type="number" min={0} max={90} placeholder="0 = solo banner"
                value={form.discountPercent}
                onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-cream-700 mb-1">Empieza</label>
              <Input type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-cream-700 mb-1">Termina</label>
              <Input type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-cream-700 mb-1">Aplica a</label>
              <select
                value={form.appliesTo}
                onChange={(e) => setForm({ ...form, appliesTo: e.target.value as any })}
                className={selectCls}
              >
                <option value="ALL">Toda la tienda</option>
                <option value="CATEGORY">Una categoría</option>
                <option value="PRODUCTS">Productos específicos</option>
              </select>
            </div>
            {form.appliesTo === "CATEGORY" && (
              <div>
                <label className="block text-sm font-medium text-cream-700 mb-1">Categoría</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className={selectCls}
                >
                  <option value="">— Elegir —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {form.appliesTo === "PRODUCTS" && (
            <div>
              <label className="block text-sm font-medium text-cream-700 mb-1">
                Productos ({form.productIds.length} seleccionados)
              </label>
              <div className="max-h-40 overflow-y-auto border border-cream-200 rounded-lg p-2 space-y-1">
                {products.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-sm text-cream-700 cursor-pointer hover:bg-cream-50 rounded px-1 py-0.5">
                    <input
                      type="checkbox"
                      checked={form.productIds.includes(p.id)}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          productIds: e.target.checked
                            ? [...form.productIds, p.id]
                            : form.productIds.filter((id) => id !== p.id),
                        })
                      }
                    />
                    {p.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <label className="flex items-center gap-2 text-sm text-cream-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.showCountdown}
                onChange={(e) => setForm({ ...form, showCountdown: e.target.checked })}
              />
              Mostrar countdown
            </label>
            <label className="flex items-center gap-2 text-sm text-cream-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.withHero}
                onChange={(e) => setForm({ ...form, withHero: e.target.checked })}
              />
              Banner en portada
            </label>
          </div>

          {form.withHero && (
            <div className="border border-cream-200 rounded-xl p-4 space-y-3 bg-cream-50/50">
              <p className="text-xs font-semibold text-cream-500 uppercase">Banner de portada</p>
              <Input
                placeholder="Título del banner *"
                value={form.heroTitle}
                onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
              />
              <Input
                placeholder="Subtítulo (opcional)"
                value={form.heroSubtitle}
                onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
              />
              <div className="grid sm:grid-cols-2 gap-3">
                <Input
                  placeholder="Texto del botón"
                  value={form.heroCtaText}
                  onChange={(e) => setForm({ ...form, heroCtaText: e.target.value })}
                />
                <Input
                  placeholder="Link del botón (/ofertas)"
                  value={form.heroCtaLink}
                  onChange={(e) => setForm({ ...form, heroCtaLink: e.target.value })}
                />
              </div>
              <Input
                placeholder="URL de imagen (Unsplash o /images/...)"
                value={form.heroImageUrl}
                onChange={(e) => setForm({ ...form, heroImageUrl: e.target.value })}
              />
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={submit} isLoading={isPending} disabled={!form.name}>
              Crear campaña
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
