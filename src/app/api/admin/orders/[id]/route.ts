import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getItem, updateItem, TABLES } from "@/lib/dynamo";
import { cancelOrderRestock } from "@/actions/orders";

const VALID_STATUS = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
const VALID_PAYMENT = ["PENDING", "PAID", "FAILED", "REFUNDED"];
const VALID_CARRIERS = ["OLVA", "SHALOM", "OTRO"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const order = await getItem<Record<string, any>>(TABLES.orders, { id });
    if (!order || !order.orderNumber) {
      return NextResponse.json({ success: false, error: "Pedido no encontrado" }, { status: 404 });
    }

    const now = new Date().toISOString();
    const updates: Record<string, any> = { updatedAt: now };

    if (body.paymentStatus && VALID_PAYMENT.includes(body.paymentStatus)) {
      updates.paymentStatus = body.paymentStatus;
    }
    if (body.carrier !== undefined) {
      if (body.carrier && !VALID_CARRIERS.includes(body.carrier)) {
        return NextResponse.json({ success: false, error: "Courier inválido" }, { status: 400 });
      }
      updates.carrier = body.carrier || null;
    }
    if (body.trackingCode !== undefined) {
      updates.trackingCode = body.trackingCode || null;
    }

    const newStatus: string | undefined =
      body.status && VALID_STATUS.includes(body.status) && body.status !== order.status
        ? body.status
        : undefined;

    // --- Cancelación: delega en la lógica transaccional compartida ---
    if (newStatus === "CANCELLED") {
      const result = await cancelOrderRestock(id);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      // Cambios cosméticos restantes (courier/tracking/pago) después del tx
      const extra = { ...updates };
      delete extra.updatedAt;
      if (Object.keys(extra).length > 0) {
        await updateItem(TABLES.orders, { id }, updates);
      }
      const updated = await getItem<Record<string, any>>(TABLES.orders, { id });
      return NextResponse.json({ success: true, data: updated });
    }

    // --- Camino normal ---
    if (newStatus) {
      updates.status = newStatus;
      if (newStatus === "SHIPPED" && !order.shippedAt) updates.shippedAt = now;
      if (newStatus === "DELIVERED" && !order.deliveredAt) updates.deliveredAt = now;
    }

    const updated = await updateItem(TABLES.orders, { id }, updates);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("PATCH /api/admin/orders/[id] error:", err);
    return NextResponse.json({ success: false, error: "Error al actualizar" }, { status: 500 });
  }
}
