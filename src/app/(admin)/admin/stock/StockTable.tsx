"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, History } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/format";
import { adjustStock, type StockRow } from "@/actions/inventory";

export function StockTable({ rows }: { rows: StockRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<StockRow | null>(null);
  const [newStock, setNewStock] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openAdjust(row: StockRow) {
    setSelected(row);
    setNewStock(String(row.stock));
    setNote("");
    setError(null);
  }

  function submitAdjust() {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const res = await adjustStock({
        productId: selected.id,
        newStock: parseInt(newStock, 10),
        note,
      });
      if (!res.success) {
        setError(res.error);
        return;
      }
      setSelected(null);
      router.refresh();
    });
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cream-50 border-b border-cream-200">
              <tr>
                {["Producto", "SKU", "Stock", "Costo prom.", "Precio", "Margen", "Valor stock", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-cream-600 uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-cream-500">
                    No hay productos
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className={`hover:bg-cream-50 transition-colors ${!r.active ? "opacity-50" : ""}`}>
                    <td className="px-4 py-3 text-sm font-medium text-cream-900">
                      {r.name}
                      {!r.active && <span className="ml-2 text-[10px] text-cream-400 uppercase">inactivo</span>}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-cream-500">{r.sku}</td>
                    <td className="px-4 py-3">
                      <Badge variant={r.isLowStock ? "error" : "success"} size="sm">
                        {r.stock} {r.isLowStock && "· bajo"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-cream-700">
                      {r.cost !== null ? formatPrice(r.cost) : <span className="text-cream-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-cream-700">{formatPrice(r.price)}</td>
                    <td className="px-4 py-3 text-sm">
                      {r.marginPercent !== null ? (
                        <span className={r.marginPercent < 20 ? "text-red-600 font-medium" : "text-green-700 font-medium"}>
                          {r.marginPercent}%
                        </span>
                      ) : (
                        <span className="text-cream-400" title="Registra un lote de compra para conocer el margen">sin costo</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-cream-700">{r.stockValue > 0 ? formatPrice(r.stockValue) : "—"}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/stock/movimientos?producto=${r.id}`}
                        className="inline-flex items-center text-xs text-cream-500 hover:text-hanna-600 mr-3"
                        title="Ver movimientos"
                      >
                        <History className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        onClick={() => openAdjust(r)}
                        className="inline-flex items-center gap-1 text-xs text-hanna-600 hover:underline cursor-pointer"
                      >
                        <SlidersHorizontal className="h-3.5 w-3.5" /> Ajustar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={`Ajustar stock — ${selected?.name ?? ""}`} size="sm">
        <div className="space-y-4">
          <p className="text-sm text-cream-500">
            Stock actual: <strong className="text-cream-900">{selected?.stock}</strong>. El ajuste queda
            registrado en el historial de movimientos con tu usuario.
          </p>
          <div>
            <label className="block text-sm font-medium text-cream-700 mb-1">Nuevo stock</label>
            <Input
              type="number"
              min={0}
              step={1}
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-cream-700 mb-1">Motivo (obligatorio)</label>
            <Input
              placeholder="Ej: conteo físico, merma, unidad dañada…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setSelected(null)}>Cancelar</Button>
            <Button onClick={submitAdjust} isLoading={isPending} disabled={!note.trim() || newStock === ""}>
              Guardar ajuste
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
