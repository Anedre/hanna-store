import { cache } from "react";
import { scanTable, TABLES } from "@/lib/dynamo";
import type { Campaign, Product, PricedProduct } from "@/types";

/**
 * Resolución de precios con campañas — SOLO en servidor.
 * Los Server Components pasan PricedProduct como props; el cliente nunca
 * calcula descuentos. createOrder/quoteCart recalculan con esta misma lógica:
 * el precio del cliente jamás se confía.
 */

const round2 = (n: number) => Math.round(n * 100) / 100;

export function isCampaignLive(c: Campaign, now = new Date()): boolean {
  if (!c.active) return false;
  const starts = new Date(c.startsAt);
  const ends = new Date(c.endsAt);
  return !isNaN(starts.getTime()) && !isNaN(ends.getTime()) && starts <= now && now <= ends;
}

/**
 * Campañas vigentes, ordenadas por prioridad desc.
 * cache() de React: una sola lectura por request aunque la llamen
 * varios componentes del mismo render.
 */
export const getActiveCampaigns = cache(async (): Promise<Campaign[]> => {
  try {
    const all = await scanTable<Campaign>(TABLES.campaigns);
    return all
      .filter((c) => c.id && isCampaignLive(c))
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  } catch (err) {
    // La tienda nunca se cae por campañas: sin campañas = precios normales
    console.error("getActiveCampaigns error:", err);
    return [];
  }
});

function campaignMatches(c: Campaign, product: Pick<Product, "id" | "categoryId">): boolean {
  if (c.appliesTo === "ALL") return true;
  if (c.appliesTo === "CATEGORY") return !!c.categoryId && c.categoryId === product.categoryId;
  if (c.appliesTo === "PRODUCTS") return !!c.productIds?.includes(product.id);
  return false;
}

/**
 * Aplica la campaña ganadora (mayor priority con descuento > 0) a un producto.
 * Sin stacking: una campaña por producto. El compareAt efectivo es el precio
 * pre-campaña (o el compareAtPrice manual si es mayor).
 */
export function resolvePricing<T extends Product>(product: T, campaigns: Campaign[]): PricedProduct {
  const winner = campaigns.find((c) => (c.discountPercent ?? 0) > 0 && campaignMatches(c, product));

  if (!winner) {
    const discountPercent =
      product.compareAtPrice && product.compareAtPrice > product.price
        ? Math.round((1 - product.price / product.compareAtPrice) * 100)
        : 0;
    return {
      ...product,
      finalPrice: product.price,
      effectiveCompareAt: discountPercent > 0 ? product.compareAtPrice : null,
      discountPercent,
    };
  }

  const finalPrice = round2(product.price * (1 - winner.discountPercent / 100));
  const effectiveCompareAt = Math.max(product.price, product.compareAtPrice ?? 0);

  return {
    ...product,
    finalPrice,
    effectiveCompareAt,
    discountPercent: winner.discountPercent,
    campaignId: winner.id,
    campaignEndsAt: winner.endsAt,
    showCountdown: winner.showCountdown,
  };
}

/** Conveniencia: resuelve una lista completa con una sola lectura de campañas. */
export async function priceProducts<T extends Product>(products: T[]): Promise<PricedProduct[]> {
  const campaigns = await getActiveCampaigns();
  return products.map((p) => resolvePricing(p, campaigns));
}
