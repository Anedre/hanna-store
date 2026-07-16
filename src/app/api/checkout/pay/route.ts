import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateItem, TABLES } from "@/lib/dynamo";
import { createOrder, cancelOrderRestock } from "@/actions/orders";
import { createCharge, isCulqiConfigured } from "@/lib/payments/culqi";

/**
 * Pago online (Culqi). Flujo orden-primero:
 *   1. createOrder — PENDING; reserva stock + consume cupón transaccionalmente
 *   2. createCharge con el TOTAL DE LA ORDEN (server) — nunca el monto del cliente
 *   3. éxito → PAID + chargeId + CONFIRMED · fallo → autocancelación (repone stock)
 * Sin cargos huérfanos: si no hay orden no hay cargo; si el cargo falla, la orden muere.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Debes iniciar sesion" }, { status: 401 });
    }

    if (!isCulqiConfigured()) {
      return NextResponse.json(
        { success: false, error: "El pago online no está habilitado todavía" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { items, shipping, couponCode, tokenId } = body ?? {};
    if (!tokenId || typeof tokenId !== "string" || !/^(tkn|ype)_/.test(tokenId)) {
      return NextResponse.json({ success: false, error: "Token de pago inválido" }, { status: 400 });
    }

    // 1. Orden (reserva stock / cupón). paymentMethod refleja el medio real.
    const method = tokenId.startsWith("ype_") ? "yape" : "card";
    const orderRes = await createOrder({ items, shipping, paymentMethod: method, couponCode });
    if (!orderRes.success || !orderRes.data) {
      return NextResponse.json({ success: false, error: orderRes.error }, { status: 400 });
    }
    const order = orderRes.data as Record<string, any>;

    // 2. Cargo por el total de la orden
    const charge = await createCharge({
      amountCents: Math.round(order.total * 100),
      email: shipping?.email || (session.user as any).email || "cliente@hanna.pe",
      sourceId: tokenId,
      description: `Pedido ${order.orderNumber} — Hanna Store`,
      metadata: { orderId: order.id, orderNumber: order.orderNumber },
    });

    if (!charge.ok) {
      // 3b. Autocancelar: repone stock y marca pago fallido
      await cancelOrderRestock(order.id, {
        note: `Pago fallido (${charge.kind}${charge.declineCode ? `: ${charge.declineCode}` : ""}) — ${order.orderNumber}`,
        paymentStatus: "FAILED",
      });
      return NextResponse.json(
        { success: false, error: charge.userMessage, kind: charge.kind },
        { status: 402 }
      );
    }

    // 3a. Pagado
    await updateItem(TABLES.orders, { id: order.id }, {
      paymentStatus: "PAID",
      status: "CONFIRMED",
      chargeId: charge.chargeId,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json(
      { success: true, data: { orderNumber: order.orderNumber, chargeId: charge.chargeId, paid: true } },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/checkout/pay error:", err);
    return NextResponse.json({ success: false, error: "Error al procesar el pago" }, { status: 500 });
  }
}
