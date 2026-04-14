import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/actions/products";
import { auth } from "@/lib/auth";
import { putItem, generateId, TABLES } from "@/lib/dynamo";
import { slugify } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const params = {
    categorySlug: searchParams.get("category") || undefined,
    minPrice: searchParams.get("minPrice")
      ? parseFloat(searchParams.get("minPrice")!)
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? parseFloat(searchParams.get("maxPrice")!)
      : undefined,
    search: searchParams.get("search") || undefined,
    sortBy: searchParams.get("sortBy") || undefined,
    page: searchParams.get("page")
      ? parseInt(searchParams.get("page")!, 10)
      : 1,
    perPage: searchParams.get("perPage")
      ? parseInt(searchParams.get("perPage")!, 10)
      : 12,
  };

  const result = await getProducts(params);

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 }
    );
  }

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const slug = slugify(body.name);
    const now = new Date().toISOString();
    const id = generateId();

    const product = await putItem(TABLES.products, {
      id,
      name: body.name,
      slug,
      description: body.description,
      shortDescription: body.shortDescription,
      price: body.price,
      compareAtPrice: body.compareAtPrice || null,
      sku: body.sku,
      stock: body.stock || 0,
      images: JSON.stringify(body.images || []),
      categoryId: body.categoryId,
      tags: body.tags || "",
      weight: body.weight || null,
      origin: body.origin || "Internacional",
      featured: body.featured || false,
      active: body.active !== false,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear el producto" },
      { status: 500 }
    );
  }
}
