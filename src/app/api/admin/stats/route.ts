import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  countItems,
  scanTable,
  getItem,
  TABLES,
} from "@/lib/dynamo";

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const [
      totalProducts,
      totalOrders,
      allOrders,
      totalReviews,
      totalMessages,
    ] = await Promise.all([
      countItems(TABLES.products, {
        filterExpression: "#active = :trueVal",
        expressionValues: { ":trueVal": true },
        expressionNames: { "#active": "active" },
      }),
      countItems(TABLES.orders),
      scanTable<Record<string, any>>(TABLES.orders),
      countItems(TABLES.reviews),
      countItems(TABLES.contactMessages, {
        filterExpression: "#r = :falseVal",
        expressionValues: { ":falseVal": false },
        expressionNames: { "#r": "read" },
      }),
    ]);

    // Calculate revenue from paid orders
    const totalRevenue = allOrders
      .filter((o) => o.paymentStatus === "PAID")
      .reduce((sum, o) => sum + (o.total || 0), 0);

    // Count pending orders
    const pendingOrders = allOrders.filter((o) => o.status === "PENDING").length;

    // Recent orders (latest 5)
    allOrders.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );
    const recentOrdersRaw = allOrders.slice(0, 5);

    // Enrich recent orders with user info
    const recentOrders = [];
    for (const order of recentOrdersRaw) {
      let user: { name: string; lastName: string } | undefined;
      if (order.userId) {
        const u = await getItem<Record<string, any>>(TABLES.users, { id: order.userId });
        if (u) user = { name: u.name, lastName: u.lastName };
      }
      recentOrders.push({ ...order, user });
    }

    return NextResponse.json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders,
        totalReviews,
        totalMessages,
        recentOrders,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json({ success: false, error: "Error al obtener estadisticas" }, { status: 500 });
  }
}
