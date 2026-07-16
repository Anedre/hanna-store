import Link from "next/link";
import { Boxes, PackagePlus, History, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getStockOverview } from "@/actions/inventory";
import { formatPrice } from "@/lib/format";
import { StockTable } from "./StockTable";

export default async function AdminStockPage() {
  const result = await getStockOverview();

  if (!result.success) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-cream-900 mb-4">Stock</h1>
        <Card className="p-6 text-sm text-red-600">{result.error}</Card>
      </div>
    );
  }

  const { rows, totals } = result.data;

  const kpis = [
    { label: "Productos", value: String(totals.productCount) },
    { label: "Unidades en stock", value: String(totals.totalUnits) },
    { label: "Valor del inventario", value: formatPrice(totals.totalValue), hint: "a costo promedio" },
    {
      label: "Stock bajo",
      value: String(totals.lowStockCount),
      alert: totals.lowStockCount > 0,
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-cream-900">Stock</h1>
          <p className="text-sm text-cream-500 mt-1">
            Inventario, costos promedio y márgenes reales
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/stock/movimientos">
            <Button variant="outline" size="sm">
              <History className="h-4 w-4 mr-1" /> Movimientos
            </Button>
          </Link>
          <Link href="/admin/stock/lotes">
            <Button variant="outline" size="sm">
              <Boxes className="h-4 w-4 mr-1" /> Lotes
            </Button>
          </Link>
          <Link href="/admin/stock/lotes/nuevo">
            <Button size="sm">
              <PackagePlus className="h-4 w-4 mr-1" /> Registrar lote
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <Card key={k.label} className={`p-5 ${k.alert ? "border-red-300 bg-red-50" : ""}`}>
            <p className="text-xs font-medium text-cream-500 uppercase tracking-wider flex items-center gap-1">
              {k.alert && <AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
              {k.label}
            </p>
            <p className={`font-display font-bold text-2xl mt-1 ${k.alert ? "text-red-600" : "text-cream-900"}`}>
              {k.value}
            </p>
            {k.hint && <p className="text-[11px] text-cream-400 mt-0.5">{k.hint}</p>}
          </Card>
        ))}
      </div>

      <StockTable rows={rows} />
    </div>
  );
}
