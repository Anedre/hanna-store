import type { ChargeInput, ChargeResult, RefundResult } from "./types";

/**
 * Culqi vía REST (no existe SDK oficial de Node — verificado jul 2026).
 * Docs: docs.culqi.com · misma URL en test y prod (rutea por tipo de llave).
 *
 * Respuestas de POST /v2/charges:
 *  - 201 → cargo exitoso (outcome.type "venta_exitosa")
 *  - 200 + action_code "REVIEW" → el banco exige 3DS (v1: se trata como no-completado)
 *  - 4xx type "card_error" → rechazo, user_message viene en español
 */

const API = "https://api.culqi.com/v2";

export function isCulqiConfigured(): boolean {
  return !!process.env.CULQI_SECRET_KEY;
}

function secretKey(): string {
  const key = process.env.CULQI_SECRET_KEY;
  if (!key) throw new Error("CULQI_SECRET_KEY no configurada");
  return key;
}

export async function createCharge(input: ChargeInput): Promise<ChargeResult> {
  if (!Number.isInteger(input.amountCents) || input.amountCents < 100 || input.amountCents > 999900) {
    return {
      ok: false,
      kind: "error",
      userMessage: "El monto está fuera del rango permitido (S/ 1.00 – S/ 9,999.00)",
    };
  }

  let res: Response;
  try {
    res = await fetch(`${API}/charges`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey()}`,
      },
      body: JSON.stringify({
        amount: input.amountCents,
        currency_code: "PEN",
        email: input.email,
        source_id: input.sourceId,
        description: input.description.slice(0, 80),
        metadata: input.metadata,
      }),
      // Un cargo no debe reintentarse a ciegas (riesgo de doble cobro)
      cache: "no-store",
    });
  } catch (err) {
    console.error("Culqi createCharge network error:", err);
    return { ok: false, kind: "error", userMessage: "No se pudo contactar a la pasarela de pago. Intenta de nuevo." };
  }

  const data = await res.json().catch(() => null);

  if (res.status === 201 && data?.id) {
    return { ok: true, chargeId: data.id, outcome: data.outcome?.type };
  }

  // 200 = requiere autenticación 3DS (Culqi3DS SDK = v2; por ahora, vía alterna)
  if (res.status === 200 && data?.action_code === "REVIEW") {
    return {
      ok: false,
      kind: "3ds_required",
      userMessage:
        "Tu banco requiere una verificación adicional que aún no soportamos. Intenta con otra tarjeta o paga con Yape.",
    };
  }

  console.error("Culqi charge rechazado:", { status: res.status, code: data?.code, decline: data?.decline_code });
  return {
    ok: false,
    kind: data?.type === "card_error" ? "card_error" : "error",
    userMessage: data?.user_message || "No se pudo procesar el pago. Intenta de nuevo.",
    code: data?.code,
    declineCode: data?.decline_code,
  };
}

/** Reembolso (uso manual/administrativo). reason es enum de Culqi. */
export async function refundCharge(
  chargeId: string,
  amountCents: number,
  reason: "duplicado" | "fraudulento" | "solicitud_comprador" = "solicitud_comprador"
): Promise<RefundResult> {
  try {
    const res = await fetch(`${API}/refunds`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey()}`,
      },
      body: JSON.stringify({ charge_id: chargeId, amount: amountCents, reason }),
      cache: "no-store",
    });
    const data = await res.json().catch(() => null);
    if (res.status === 201 && data?.id) return { ok: true, refundId: data.id };
    return { ok: false, error: data?.user_message || data?.merchant_message || `HTTP ${res.status}` };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Error de red" };
  }
}
