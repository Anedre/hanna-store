import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { scanTable, getItem, TABLES } from "@/lib/dynamo";

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const orders = await scanTable<Record<string, any>>(TABLES.orders);

    // Sort by createdAt desc
    orders.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );

    // Enrich with user info and parse items
    const enriched = [];
    for (const order of orders) {
      // Fetch user
      let user: { name: string; lastName: string; email: string } | undefined;
      if (order.userId) {
        const u = await getItem<Record<string, any>>(TABLES.users, { id: order.userId });
        if (u) user = { name: u.name, lastName: u.lastName, email: u.email };
      }

      // Parse items from JSON
      let items: any[] = [];
      try {
        items = typeof order.items === "string" ? JSON.parse(order.items) : order.items ?? [];
      } catch {
        items = [];
      }

      enriched.push({ ...order, user, items });
    }

    return NextResponse.json({ success: true, data: enriched });
  } catch {
    return NextResponse.json({ success: false, error: "Error" }, { status: 500 });
  }
}
