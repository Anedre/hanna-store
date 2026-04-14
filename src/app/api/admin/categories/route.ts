import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { scanTable, putItem, deleteItem, queryByIndex, TABLES, generateId } from "@/lib/dynamo";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const categories = await scanTable<Record<string, any>>(TABLES.categories);
    const products = await scanTable<Record<string, any>>(TABLES.products, {
      filterExpression: "#active = :t",
      expressionValues: { ":t": true },
      expressionNames: { "#active": "active" },
    });

    const counts = new Map<string, number>();
    for (const p of products) {
      counts.set(p.categoryId, (counts.get(p.categoryId) || 0) + 1);
    }

    const enriched = categories.map((c) => ({
      ...c,
      productCount: counts.get(c.id as string) || 0,
    })) as (Record<string, any> & { productCount: number })[];

    enriched.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));

    return NextResponse.json({ success: true, data: enriched });
  } catch {
    return NextResponse.json({ success: false, error: "Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ success: false, error: "Nombre requerido" }, { status: 400 });
    }

    const slug = slugify(body.name);
    const existing = await queryByIndex(TABLES.categories, "slug-index", "slug", slug, { limit: 1 });
    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: "Ya existe una categoria con ese nombre" }, { status: 400 });
    }

    const category = await putItem(TABLES.categories, {
      id: generateId(),
      name: body.name,
      slug,
      description: body.description || null,
      image: body.image || null,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, data: category });
  } catch {
    return NextResponse.json({ success: false, error: "Error al crear categoria" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const { id } = await request.json();
    const products = await queryByIndex(TABLES.products, "category-index", "categoryId", id, { limit: 1 });
    if (products.length > 0) {
      return NextResponse.json({ success: false, error: "No se puede eliminar: tiene productos asociados" }, { status: 400 });
    }

    await deleteItem(TABLES.categories, { id });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Error al eliminar" }, { status: 500 });
  }
}
