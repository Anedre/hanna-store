"use server";

import {
  putItem,
  updateItem,
  deleteItem,
  scanTable,
  queryByIndex,
  generateId,
  TABLES,
} from "@/lib/dynamo";
import { auth } from "@/lib/auth";
import { findCouponByCode, evaluateCoupon } from "@/lib/coupons-core";
import type { Coupon } from "@/types";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    throw new Error("No autorizado");
  }
}

const round2 = (n: number) => Math.round(n * 100) / 100;

// ---------------------------------------------------------------------------
// CRUD admin
// ---------------------------------------------------------------------------

export interface CouponInput {
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  minOrder?: number;
  maxUses?: number;
  startsAt?: string;
  endsAt?: string;
  active: boolean;
}

export async function getCouponsAdmin() {
  try {
    await requireAdmin();
    const all = await scanTable<Coupon>(TABLES.coupons);
    const coupons = all.filter((c) => c.id && c.code);
    coupons.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    return { success: true as const, data: coupons };
  } catch (error: any) {
    return { success: false as const, error: error.message || "Error al obtener cupones" };
  }
}

export async function createCoupon(input: CouponInput) {
  try {
    await requireAdmin();

    const code = input.code?.trim().toUpperCase();
    if (!code || !/^[A-Z0-9-]{3,20}$/.test(code)) {
      return { success: false as const, error: "Código inválido (3-20 caracteres, letras/números/guiones)" };
    }
    if (input.type === "PERCENT" && !(input.value > 0 && input.value <= 90)) {
      return { success: false as const, error: "El porcentaje debe estar entre 1 y 90" };
    }
    if (input.type === "FIXED" && !(input.value > 0)) {
      return { success: false as const, error: "El monto fijo debe ser mayor a 0" };
    }

    // Unicidad del código
    const existing = await queryByIndex<Coupon>(TABLES.coupons, "code-index", "code", code, { limit: 1 });
    if (existing.length > 0) {
      return { success: false as const, error: `El código ${code} ya existe` };
    }

    const coupon: Coupon = {
      id: generateId(),
      code,
      type: input.type,
      value: round2(input.value),
      minOrder: input.minOrder && input.minOrder > 0 ? round2(input.minOrder) : undefined,
      maxUses: input.maxUses && input.maxUses > 0 ? Math.round(input.maxUses) : undefined,
      usedCount: 0,
      startsAt: input.startsAt || undefined,
      endsAt: input.endsAt || undefined,
      active: !!input.active,
      createdAt: new Date().toISOString(),
    };

    await putItem(TABLES.coupons, coupon as any);
    return { success: true as const, data: coupon };
  } catch (error: any) {
    console.error("createCoupon error:", error);
    return { success: false as const, error: error.message || "Error al crear el cupón" };
  }
}

export async function toggleCoupon(id: string, active: boolean) {
  try {
    await requireAdmin();
    await updateItem(TABLES.coupons, { id }, { active });
    return { success: true as const };
  } catch (error: any) {
    return { success: false as const, error: error.message || "Error al actualizar" };
  }
}

export async function deleteCoupon(id: string) {
  try {
    await requireAdmin();
    await deleteItem(TABLES.coupons, { id });
    return { success: true as const };
  } catch (error: any) {
    return { success: false as const, error: error.message || "Error al eliminar" };
  }
}

// ---------------------------------------------------------------------------
// Validación pública (checkout)
// ---------------------------------------------------------------------------

export interface CouponCheck {
  valid: boolean;
  reason?: string;
  coupon?: { code: string; type: "PERCENT" | "FIXED"; value: number };
  discount?: number;
}

/**
 * Valida un cupón contra un subtotal (que ya incluye precios de campaña).
 * NO consume el uso — eso ocurre transaccionalmente al crear la orden.
 */
export async function checkCoupon(codeRaw: string, subtotal: number): Promise<CouponCheck> {
  const code = codeRaw?.trim().toUpperCase();
  if (!code) return { valid: false, reason: "Ingresa un código" };

  try {
    const coupon = await findCouponByCode(code);
    const evaluation = evaluateCoupon(coupon, subtotal);

    if (!evaluation.valid) return { valid: false, reason: evaluation.reason };

    return {
      valid: true,
      coupon: { code: coupon!.code, type: coupon!.type, value: coupon!.value },
      discount: evaluation.discount,
    };
  } catch (err) {
    console.error("checkCoupon error:", err);
    return { valid: false, reason: "No se pudo validar el cupón" };
  }
}
