import { NextRequest, NextResponse } from "next/server";
import { getProductReviews, submitReview } from "@/actions/reviews";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json(
      { success: false, error: "productId es requerido" },
      { status: 400 }
    );
  }

  const result = await getProductReviews(productId);

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
    const body = await request.json();
    const { productId, rating, comment } = body;

    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { success: false, error: "productId, rating y comment son requeridos" },
        { status: 400 }
      );
    }

    const result = await submitReview(productId, rating, comment);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
