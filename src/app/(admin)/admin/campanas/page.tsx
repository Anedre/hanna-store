import { getCampaignsAdmin } from "@/actions/campaigns";
import { getCategories } from "@/actions/products";
import { scanTable, TABLES } from "@/lib/dynamo";
import { Card } from "@/components/ui/card";
import { CampaignsClient } from "./CampaignsClient";

export default async function CampanasPage() {
  const [result, categoriesRes, products] = await Promise.all([
    getCampaignsAdmin(),
    getCategories(),
    scanTable<Record<string, any>>(TABLES.products),
  ]);

  if (!result.success) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-cream-900 mb-4">Campañas</h1>
        <Card className="p-6 text-sm text-red-600">{result.error}</Card>
      </div>
    );
  }

  const categories = categoriesRes.success
    ? (categoriesRes.data as any[]).map((c) => ({ id: c.id as string, name: c.name as string }))
    : [];

  const productOptions = products
    .filter((p) => p.id && p.name && p.active !== false)
    .map((p) => ({ id: p.id as string, name: p.name as string }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <CampaignsClient campaigns={result.data} categories={categories} products={productOptions} />
  );
}
