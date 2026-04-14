import { NextResponse } from "next/server";
import { getCategories } from "@/actions/products";

export async function GET() {
  const result = await getCategories();

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 }
    );
  }

  return NextResponse.json(result);
}
