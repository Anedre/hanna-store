import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getItem, updateItem, deleteItem, TABLES } from "@/lib/dynamo";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await getItem<Record<string, any>>(TABLES.products, { id });
    if (!product) {
      return NextResponse.json({ success: false, error: "No encontrado" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: product });
  } catch {
    return NextResponse.json({ success: false, error: "Error" }, { status: 500 });
  }
}

export async function PUT(
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

    const updates: Record<string, any> = { updatedAt: new Date().toISOString() };
    const fields = [
      "name", "description", "shortDescription", "price", "compareAtPrice",
      "sku", "stock", "categoryId", "tags", "weight", "origin", "featured", "active",
    ];

    for (const f of fields) {
      if (body[f] !== undefined) updates[f] = body[f];
    }

    if (body.images !== undefined) {
      updates.images = JSON.stringify(body.images);
    }

    const updated = await updateItem(TABLES.products, { id }, updates);
    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ success: false, error: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    await deleteItem(TABLES.products, { id });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Error al eliminar" }, { status: 500 });
  }
}
