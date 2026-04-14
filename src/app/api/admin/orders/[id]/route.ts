import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateItem, TABLES } from "@/lib/dynamo";

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

    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (body.status) {
      updates.status = body.status;
    }
    if (body.paymentStatus) {
      updates.paymentStatus = body.paymentStatus;
    }

    const order = await updateItem(TABLES.orders, { id }, updates);

    return NextResponse.json({ success: true, data: order });
  } catch {
    return NextResponse.json({ success: false, error: "Error al actualizar" }, { status: 500 });
  }
}
