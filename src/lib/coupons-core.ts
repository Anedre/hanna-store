import { queryByIndex, TABLES } from "@/lib/dynamo";
import type { Coupon } from "@/types";

/**
 * Núcleo de validación de cupones — compartido por checkCoupon (checkout)
 * y createOrder/quoteCart (orden). Una sola fuente de verdad: si difieren,
 * el cliente vería un descuento que la orden luego rechaza.
 */

const round2 = (n: number) => Math.round(n * 100) / 100;

export async function findCouponByCode(codeRaw: string): Promise<Coupon | undefined> {
  const code = codeRaw?.trim().toUpperCase();
  if (!code) return undefined;
  const found = await queryByIndex<Coupon>(TABLES.coupons, "code-index", "code", code, { limit: 1 });
  return found[0];
}

export interface CouponEvaluation {
  valid: boolean;
  reason?: string;
  discount: number;
}

export function evaluateCoupon(coupon: Coupon | undefined, subtotal: number): CouponEvaluation {
  if (!coupon || !coupon.active) return { valid: false, reason: "Cupón no válido", discount: 0 };

  const now = new Date();
  if (coupon.startsAt && new Date(coupon.startsAt) > now) {
    return { valid: false, reason: "Este cupón aún no está vigente", discount: 0 };
  }
  if (coupon.endsAt && new Date(coupon.endsAt) < now) {
    return { valid: false, reason: "Este cupón ya venció", discount: 0 };
  }
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, reason: "Este cupón agotó sus usos", discount: 0 };
  }
  if (coupon.minOrder && subtotal < coupon.minOrder) {
    return {
      valid: false,
      reason: `Este cupón requiere una compra mínima de S/ ${coupon.minOrder.toFixed(2)}`,
      discount: 0,
    };
  }

  const discount =
    coupon.type === "PERCENT"
      ? round2(subtotal * (coupon.value / 100))
      : round2(Math.min(coupon.value, subtotal));

  return { valid: true, discount };
}
