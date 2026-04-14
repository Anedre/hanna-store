import { NextRequest, NextResponse } from "next/server";
import { getFeaturedProducts } from "@/actions/products";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const limit = searchParams.get("limit")
    ? parseInt(searchParams.get("limit")!, 10)
    : 8;

  const result = await getFeaturedProducts(limit);

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 }
    );
  }

  return NextResponse.json(result);
}
