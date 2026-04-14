import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getItem, updateItem, TABLES } from "@/lib/dynamo";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const user = await getItem<Record<string, any>>(TABLES.users, { id: session.user.id });
    if (!user) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado" }, { status: 404 });
    }

    const { password, ...safeUser } = user;
    return NextResponse.json({ success: true, data: safeUser });
  } catch {
    return NextResponse.json({ success: false, error: "Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const allowed = ["name", "lastName", "email", "phone", "address", "city", "district", "postalCode"];
    const updates: Record<string, any> = { updatedAt: new Date().toISOString() };

    for (const key of allowed) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    const updated = await updateItem(TABLES.users, { id: session.user.id }, updates);
    if (updated) {
      const { password, ...safeUser } = updated as Record<string, any>;
      return NextResponse.json({ success: true, data: safeUser });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Error al actualizar perfil" }, { status: 500 });
  }
}
