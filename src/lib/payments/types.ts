/**
 * Contrato del proveedor de pagos. El checkout y el endpoint /api/checkout/pay
 * hablan SOLO con esta interfaz — cambiar de pasarela (Culqi → Izipay → …)
 * es escribir otra implementación, no tocar el flujo.
 * Montos SIEMPRE en céntimos enteros (S/ 10.50 = 1050).
 */

export interface ChargeInput {
  amountCents: number;
  email: string;
  /** Token emitido por el checkout del proveedor (Culqi: tkn_… | ype_…) */
  sourceId: string;
  description: string;
  metadata?: Record<string, string>;
}

export type ChargeResult =
  | { ok: true; chargeId: string; outcome?: string }
  | {
      ok: false;
      kind: "3ds_required" | "card_error" | "error";
      /** Mensaje apto para mostrar al comprador (Culqi lo envía en español) */
      userMessage: string;
      code?: string;
      declineCode?: string;
    };

export interface RefundResult {
  ok: boolean;
  refundId?: string;
  error?: string;
}
