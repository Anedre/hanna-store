import { NextRequest, NextResponse } from "next/server";
import { getUserOrders, createOrder } from "@/actions/orders";

export async function GET() {
  const result = await getUserOrders();

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: result.error === "Debes iniciar sesion" ? 401 : 500 }
    );
  }

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createOrder(body);

    if (!result.success) {
      const status = result.error === "Debes iniciar sesion para realizar un pedido" ? 401 : 400;
      return NextResponse.json(
        { success: false, error: result.error },
        { status }
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
