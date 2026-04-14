import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { scanTable, getItem, updateItem, TABLES } from "@/lib/dynamo";

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const reviews = await scanTable<Record<string, any>>(TABLES.reviews);

    const enriched = [];
    for (const r of reviews) {
      const user = r.userId ? await getItem<Record<string, any>>(TABLES.users, { id: r.userId }) : null;
      const product = r.productId ? await getItem<Record<string, any>>(TABLES.products, { id: r.productId }) : null;
      enriched.push({
        ...r,
        userName: user ? `${user.name} ${user.lastName}` : "Desconocido",
        productName: product?.name || "Producto eliminado",
      } as Record<string, any>);
    }

    enriched.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return NextResponse.json({ success: true, data: enriched });
  } catch {
    return NextResponse.json({ success: false, error: "Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const { productId, id, approved } = await request.json();
    if (!productId || !id || typeof approved !== "boolean") {
      return NextResponse.json({ success: false, error: "Datos invalidos" }, { status: 400 });
    }

    await updateItem(TABLES.reviews, { productId, id }, { approved });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Error al actualizar" }, { status: 500 });
  }
}
