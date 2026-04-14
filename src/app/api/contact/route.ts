import { NextRequest, NextResponse } from "next/server";
import { sendContactMessage } from "@/actions/contact";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await sendContactMessage(body);

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
