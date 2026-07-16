"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPurchaseLot } from "@/actions/inventory";
import { formatPrice } from "@/lib/format";

interface ProductOption {
  id: string;
  name: string;
  sku: string;
  stock: number;
  cost: number | null;
}

interface RowState {
  productId: string;
  qty: string;
  unitCost: string;
}

const emptyRow = (): RowState => ({ productId: "", qty: "", unitCost: "" });

export function NewLotForm({ products }: { products: ProductOption[] }) {
  const router = useRouter();
  const [supplier, setSupplier] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [extraCosts, setExtraCosts] = useState("");
  const [note, setNote] = useState("");
  const [rows, setRows] = useState<RowState[]>([emptyRow()]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  // Espejo del cálculo del servidor para preview en vivo
  const preview = useMemo(() => {
    const parsed = rows
      .filter((r) => r.productId && Number(r.qty) > 0 && r.unitCost !== "")
      .map((r) => ({
        productId: r.productId,
        qty: Number(r.qty),
        unitCost: Number(r.unitCost),
      }));
    const extras = Number(extraCosts) || 0;
    const itemsTotal = parsed.reduce((s, it) => s + it.qty * it.unitCost, 0);
    const totalUnits = parsed.reduce((s, it) => s + it.qty, 0);

    const landed = new Map<string, number>();
    for (const it of parsed) {
      const lineValue = it.qty * it.unitCost;
      const lineExtra = itemsTotal > 0 ? extras * (lineValue / itemsTotal) : totalUnits > 0 ? extras * (it.qty / totalUnits) : 0;
      landed.set(it.productId, Math.round((it.unitCost + lineExtra / it.qty) * 100) / 100);
    }
    return { itemsTotal, extras, grandTotal: itemsTotal + extras, landed, totalUnits };
  }, [rows, extraCosts]);

  function updateRow(i: number, patch: Partial<RowState>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function submit() {
    setError(null);
    const items = rows
      .filter((r) => r.productId)
      .map((r) => ({
        productId: r.productId,
        qty: parseInt(r.qty, 10),
        unitCost: Number(r.unitCost),
      }));

    startTransition(async () => {
      const res = await createPurchaseLot({
        supplier,
        sourceUrl: sourceUrl || undefined,
        purchaseDate,
        extraCosts: Number(extraCosts) || 0,
        note: note || undefined,
        items,
      });
      if (!res.success) {
        setError(res.error);
        return;
      }
      router.push("/admin/stock/lotes");
      router.refresh();
    });
  }

  const usedIds = new Set(rows.map((r) => r.productId).filter(Boolean));

  return (
    <div className="space-y-4">
      <Card className="p-5 space-y-4">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-cream-700 mb-1">Proveedor *</label>
            <Input
              placeholder="Ej: AliExpress — Tienda XYZ, Mayorista Lima…"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-cream-700 mb-1">Fecha de compra</label>
            <Input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-cream-700 mb-1">Link del pedido (opcional)</label>
            <Input placeholder="https://…" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-cream-700 mb-1">
              Extras del lote (S/)
            </label>
            <Input
              type="number"
              min={0}
              step="0.01"
              placeholder="Flete + tributos + otros"
              value={extraCosts}
              onChange={(e) => setExtraCosts(e.target.value)}
            />
            <p className="text-[11px] text-cream-400 mt-1">Se prorratean entre los items por valor</p>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-cream-900">Items del lote</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRows((prev) => [...prev, emptyRow()])}
            disabled={rows.length >= 40}
          >
            <Plus className="h-4 w-4 mr-1" /> Agregar item
          </Button>
        </div>

        <div className="space-y-2">
          <div className="hidden sm:grid grid-cols-[1fr_90px_120px_120px_36px] gap-2 text-[11px] text-cream-500 uppercase font-semibold px-1">
            <span>Producto</span>
            <span>Cantidad</span>
            <span>Costo unit. S/</span>
            <span className="text-right">Puesto en Lima</span>
            <span />
          </div>
          {rows.map((row, i) => {
            const landedCost = row.productId ? preview.landed.get(row.productId) : undefined;
            return (
              <div key={i} className="grid grid-cols-2 sm:grid-cols-[1fr_90px_120px_120px_36px] gap-2 items-center">
                <select
                  value={row.productId}
                  onChange={(e) => updateRow(i, { productId: e.target.value })}
                  className="col-span-2 sm:col-span-1 text-sm border border-cream-300 rounded-lg px-2 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-hanna-500"
                >
                  <option value="">— Elegir producto —</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id} disabled={usedIds.has(p.id) && row.productId !== p.id}>
                      {p.name} {p.sku ? `(${p.sku})` : ""} · stock {p.stock}
                    </option>
                  ))}
                </select>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  placeholder="Cant."
                  value={row.qty}
                  onChange={(e) => updateRow(i, { qty: e.target.value })}
                />
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Costo"
                  value={row.unitCost}
                  onChange={(e) => updateRow(i, { unitCost: e.target.value })}
                />
                <span className="text-sm text-right font-medium text-cream-900">
                  {landedCost !== undefined ? formatPrice(landedCost) : "—"}
                </span>
                <button
                  onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
                  disabled={rows.length === 1}
                  className="text-cream-400 hover:text-red-500 disabled:opacity-30 cursor-pointer justify-self-end"
                  title="Quitar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="border-t border-cream-200 mt-4 pt-4 flex flex-wrap gap-x-8 gap-y-1 text-sm">
          <span className="text-cream-600">
            Unidades: <strong className="text-cream-900">{preview.totalUnits}</strong>
          </span>
          <span className="text-cream-600">
            Mercadería: <strong className="text-cream-900">{formatPrice(preview.itemsTotal)}</strong>
          </span>
          <span className="text-cream-600">
            Extras: <strong className="text-cream-900">{formatPrice(preview.extras)}</strong>
          </span>
          <span className="text-cream-600">
            Total del lote: <strong className="text-hanna-600">{formatPrice(preview.grandTotal)}</strong>
          </span>
        </div>
      </Card>

      <Card className="p-5">
        <label className="block text-sm font-medium text-cream-700 mb-1">Nota (opcional)</label>
        <Input placeholder="Ej: primer lote de validación" value={note} onChange={(e) => setNote(e.target.value)} />
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => router.push("/admin/stock/lotes")}>
          Cancelar
        </Button>
        <Button
          onClick={submit}
          isLoading={isPending}
          disabled={!supplier.trim() || preview.totalUnits === 0}
        >
          Guardar lote y aplicar al stock
        </Button>
      </div>
    </div>
  );
}
