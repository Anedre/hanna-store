import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { scanTable, TABLES } from "@/lib/dynamo";
import { auth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { NewLotForm } from "./NewLotForm";

export default async function NuevoLotePage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return <Card className="p-6 text-sm text-red-600">No autorizado</Card>;
  }

  const products = await scanTable<Record<string, any>>(TABLES.products);
  const options = products
    .filter((p) => p.id && p.name)
    .map((p) => ({
      id: p.id as string,
      name: p.name as string,
      sku: (p.sku as string) ?? "",
      stock: (p.stock as number) ?? 0,
      cost: typeof p.cost === "number" ? (p.cost as number) : null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/stock/lotes" className="text-cream-400 hover:text-cream-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-cream-900">Registrar lote de compra</h1>
          <p className="text-sm text-cream-500 mt-1">
            Al guardar: suma stock, prorratea los extras y recalcula el costo promedio. Los lotes
            no se editan después (correcciones = ajuste manual de stock).
          </p>
        </div>
      </div>

      <NewLotForm products={options} />
    </div>
  );
}
