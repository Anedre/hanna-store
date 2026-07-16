import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMovements } from "@/actions/inventory";
import { formatPrice } from "@/lib/format";

const TYPE_MAP: Record<string, { label: string; variant: "success" | "info" | "warning" | "gold" }> = {
  PURCHASE: { label: "Compra", variant: "success" },
  SALE: { label: "Venta", variant: "info" },
  ADJUSTMENT: { label: "Ajuste", variant: "warning" },
  CANCEL_RESTOCK: { label: "Reposición", variant: "gold" },
};

export default async function MovimientosPage({
  searchParams,
}: {
  searchParams: Promise<{ producto?: string }>;
}) {
  const { producto } = await searchParams;
  const result = await getMovements({ productId: producto });

  const movements = result.success ? result.data : [];
  const productName = producto && movements[0]?.productName;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/stock" className="text-cream-400 hover:text-cream-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-cream-900">Movimientos de stock</h1>
          <p className="text-sm text-cream-500 mt-1">
            {producto ? (
              <>
                Filtrado: <strong>{productName ?? producto}</strong> ·{" "}
                <Link href="/admin/stock/movimientos" className="text-hanna-600 underline">
                  ver todos
                </Link>
              </>
            ) : (
              `Últimos ${movements.length} movimientos (compras, ventas, ajustes y reposiciones)`
            )}
          </p>
        </div>
      </div>

      {!result.success ? (
        <Card className="p-6 text-sm text-red-600">{result.error}</Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream-50 border-b border-cream-200">
                <tr>
                  {["Fecha", "Producto", "Tipo", "Cantidad", "Stock después", "Costo unit.", "Referencia"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-cream-600 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-cream-500">
                      Sin movimientos todavía. Se registran automáticamente al vender, registrar lotes o ajustar stock.
                    </td>
                  </tr>
                ) : (
                  movements.map((m) => {
                    const t = TYPE_MAP[m.type] ?? TYPE_MAP.ADJUSTMENT;
                    return (
                      <tr key={m.id} className="hover:bg-cream-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-cream-500 whitespace-nowrap">
                          {new Date(m.createdAt).toLocaleString("es-PE", {
                            day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-cream-900">{m.productName}</td>
                        <td className="px-4 py-3">
                          <Badge variant={t.variant} size="sm">{t.label}</Badge>
                        </td>
                        <td className={`px-4 py-3 text-sm font-mono font-semibold ${m.quantity >= 0 ? "text-green-700" : "text-red-600"}`}>
                          {m.quantity >= 0 ? `+${m.quantity}` : m.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-cream-700">{m.stockAfter}</td>
                        <td className="px-4 py-3 text-sm text-cream-700">
                          {typeof m.unitCost === "number" ? formatPrice(m.unitCost) : "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-cream-500 max-w-[220px] truncate" title={m.note}>
                          {m.note ?? "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
