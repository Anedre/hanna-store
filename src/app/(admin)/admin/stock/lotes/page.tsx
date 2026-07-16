import Link from "next/link";
import { ArrowLeft, PackagePlus, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLots } from "@/actions/inventory";
import { formatPrice } from "@/lib/format";

export default async function LotesPage() {
  const result = await getLots();
  const lots = result.success ? result.data : [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/stock" className="text-cream-400 hover:text-cream-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-cream-900">Lotes de compra</h1>
            <p className="text-sm text-cream-500 mt-1">
              Cada lote suma stock y recalcula el costo promedio puesto en Lima
            </p>
          </div>
        </div>
        <Link href="/admin/stock/lotes/nuevo">
          <Button size="sm">
            <PackagePlus className="h-4 w-4 mr-1" /> Registrar lote
          </Button>
        </Link>
      </div>

      {!result.success ? (
        <Card className="p-6 text-sm text-red-600">{result.error}</Card>
      ) : lots.length === 0 ? (
        <Card className="p-12 text-center">
          <PackagePlus className="h-10 w-10 text-cream-300 mx-auto mb-3" />
          <p className="text-cream-600 font-medium mb-1">Aún no registras ningún lote</p>
          <p className="text-sm text-cream-500 mb-4">
            Registra tu primera compra (AliExpress, mayorista, etc.) para que el sistema
            calcule tu costo real y tu margen por producto.
          </p>
          <Link href="/admin/stock/lotes/nuevo">
            <Button size="sm">Registrar mi primer lote</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {lots.map((lot) => (
            <Card key={lot.id} className="p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono font-bold text-cream-900">{lot.code}</span>
                  <span className="text-sm text-cream-600">{lot.supplier}</span>
                  {lot.sourceUrl && (
                    <a
                      href={lot.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-hanna-600 inline-flex items-center gap-0.5 hover:underline"
                    >
                      link <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <span className="text-sm text-cream-500">{lot.purchaseDate}</span>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-cream-600 mb-3">
                <span>{lot.items.reduce((s, i) => s + i.qty, 0)} unidades · {lot.items.length} productos</span>
                <span>Mercadería: <strong>{formatPrice(lot.itemsTotal)}</strong></span>
                <span>Extras (flete, etc.): <strong>{formatPrice(lot.extraCosts)}</strong></span>
                <span className="text-cream-900">Total: <strong>{formatPrice(lot.grandTotal)}</strong></span>
              </div>

              <details className="group">
                <summary className="text-xs text-hanna-600 cursor-pointer select-none hover:underline">
                  Ver detalle de items
                </summary>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-cream-500 uppercase border-b border-cream-200">
                        <th className="text-left py-2 pr-4">Producto</th>
                        <th className="text-right py-2 pr-4">Cant.</th>
                        <th className="text-right py-2 pr-4">Costo unit.</th>
                        <th className="text-right py-2">Puesto en Lima</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cream-100">
                      {lot.items.map((it, i) => (
                        <tr key={i}>
                          <td className="py-2 pr-4 text-cream-800">{it.productName}</td>
                          <td className="py-2 pr-4 text-right font-mono">{it.qty}</td>
                          <td className="py-2 pr-4 text-right">{formatPrice(it.unitCost)}</td>
                          <td className="py-2 text-right font-medium text-cream-900">{formatPrice(it.landedUnitCost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {lot.note && <p className="text-xs text-cream-500 mt-2">Nota: {lot.note}</p>}
                </div>
              </details>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
