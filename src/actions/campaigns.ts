"use server";

import {
  getItem,
  putItem,
  updateItem,
  deleteItem,
  scanTable,
  generateId,
  TABLES,
} from "@/lib/dynamo";
import { auth } from "@/lib/auth";
import type { Campaign } from "@/types";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    throw new Error("No autorizado");
  }
  return session.user as { id: string };
}

export interface CampaignInput {
  name: string;
  hero?: {
    title: string;
    subtitle?: string;
    ctaText: string;
    ctaLink: string;
    imageUrl: string;
  } | null;
  discountPercent: number;
  appliesTo: "ALL" | "CATEGORY" | "PRODUCTS";
  categoryId?: string;
  productIds?: string[];
  startsAt: string;
  endsAt: string;
  showCountdown: boolean;
  active: boolean;
  priority: number;
}

function validate(input: CampaignInput): string | null {
  if (!input.name?.trim()) return "Ponle un nombre a la campaña";
  if (!(input.discountPercent >= 0 && input.discountPercent <= 90)) {
    return "El descuento debe estar entre 0 y 90%";
  }
  if (!input.startsAt || !input.endsAt) return "Define inicio y fin";
  if (new Date(input.endsAt) <= new Date(input.startsAt)) return "El fin debe ser posterior al inicio";
  if (input.appliesTo === "CATEGORY" && !input.categoryId) return "Elige la categoría";
  if (input.appliesTo === "PRODUCTS" && !input.productIds?.length) return "Elige al menos un producto";
  if (input.hero) {
    if (!input.hero.title?.trim()) return "El banner necesita un título";
    if (!input.hero.imageUrl?.trim()) return "El banner necesita una imagen";
    if (!input.hero.ctaText?.trim() || !input.hero.ctaLink?.trim()) return "El banner necesita botón y link";
  }
  if (input.discountPercent === 0 && !input.hero) {
    return "Una campaña sin descuento ni banner no hace nada";
  }
  return null;
}

export async function getCampaignsAdmin() {
  try {
    await requireAdmin();
    const all = await scanTable<Campaign>(TABLES.campaigns);
    const campaigns = all.filter((c) => c.id && c.name);
    campaigns.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    return { success: true as const, data: campaigns };
  } catch (error: any) {
    return { success: false as const, error: error.message || "Error al obtener campañas" };
  }
}

export async function createCampaign(input: CampaignInput) {
  try {
    await requireAdmin();
    const invalid = validate(input);
    if (invalid) return { success: false as const, error: invalid };

    const now = new Date().toISOString();
    const campaign: Campaign = {
      id: generateId(),
      name: input.name.trim(),
      hero: input.hero || undefined,
      discountPercent: Math.round(input.discountPercent),
      appliesTo: input.appliesTo,
      categoryId: input.appliesTo === "CATEGORY" ? input.categoryId : undefined,
      productIds: input.appliesTo === "PRODUCTS" ? input.productIds : undefined,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      showCountdown: !!input.showCountdown,
      active: !!input.active,
      priority: input.priority ?? 0,
      createdAt: now,
      updatedAt: now,
    };

    await putItem(TABLES.campaigns, campaign as any);
    return { success: true as const, data: campaign };
  } catch (error: any) {
    console.error("createCampaign error:", error);
    return { success: false as const, error: error.message || "Error al crear la campaña" };
  }
}

export async function toggleCampaign(id: string, active: boolean) {
  try {
    await requireAdmin();
    const existing = await getItem<Campaign>(TABLES.campaigns, { id });
    if (!existing) return { success: false as const, error: "Campaña no encontrada" };
    await updateItem(TABLES.campaigns, { id }, { active, updatedAt: new Date().toISOString() });
    return { success: true as const };
  } catch (error: any) {
    return { success: false as const, error: error.message || "Error al actualizar" };
  }
}

export async function deleteCampaign(id: string) {
  try {
    await requireAdmin();
    await deleteItem(TABLES.campaigns, { id });
    return { success: true as const };
  } catch (error: any) {
    return { success: false as const, error: error.message || "Error al eliminar" };
  }
}
