import { NextRequest, NextResponse } from "next/server";
import { subscribeNewsletter } from "@/actions/newsletter";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "El email es requerido" },
        { status: 400 }
      );
    }

    const result = await subscribeNewsletter(email);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { success: false, error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
