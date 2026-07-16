"use server";

import {
  getItem,
  queryByIndex,
  scanTable,
  generateId,
  TABLES,
  transactWrite,
  atomicIncrement,
  putItemIfNotExists,
  batchWrite,
  type TransactItem,
} from "@/lib/dynamo";
import { auth } from "@/lib/auth";
import { SHIPPING } from "@/lib/constants";
import { getActiveCampaigns, resolvePricing } from "@/lib/pricing";
import { findCouponByCode, evaluateCoupon } from "@/lib/coupons-core";

// ---------------------------------------------------------------------------
// createOrder
// ---------------------------------------------------------------------------

interface CartItemInput {
  id: string;
  quantity: number;
}

interface ShippingData {
  name: string;
  lastName: string;
  dni: string;
  phone: string;
  email: string;
  address: string;
  district: string;
  city: string;
  postalCode?: string;
  notes?: string;
}

interface CreateOrderData {
  items: CartItemInput[];
  shipping: ShippingData;
  paymentMethod: string;
  couponCode?: string;
}

/**
 * Cotización autoritativa del carrito: precios de campaña + cupón,
 * calculados SIEMPRE en servidor. El checkout la muestra; createOrder
 * recalcula idéntico — el precio del cliente nunca se confía.
 */
export async function quoteCart(items: CartItemInput[], couponCode?: string) {
  try {
    if (!items?.length) return { success: false as const, error: "El carrito esta vacio" };

    const campaigns = await getActiveCampaigns();
    const lines: { id: string; name: string; quantity: number; unitPrice: number; total: number }[] = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await getItem<Record<string, any>>(TABLES.products, { id: item.id });
      if (!product || !product.active) {
        return { success: false as const, error: "Algunos productos ya no estan disponibles" };
      }
      const priced = resolvePricing(product as any, campaigns);
      const total = Math.round(priced.finalPrice * item.quantity * 100) / 100;
      lines.push({ id: item.id, name: product.name, quantity: item.quantity, unitPrice: priced.finalPrice, total });
      subtotal += total;
    }
    subtotal = Math.round(subtotal * 100) / 100;

    let discount = 0;
    let couponApplied: string | undefined;
    let couponError: string | undefined;
    if (couponCode) {
      const coupon = await findCouponByCode(couponCode);
      const evaluation = evaluateCoupon(coupon, subtotal);
      if (evaluation.valid) {
        discount = evaluation.discount;
        couponApplied = coupon!.code;
      } else {
        couponError = evaluation.reason;
      }
    }

    const afterDiscount = Math.max(0, subtotal - discount);
    const shippingCost = afterDiscount >= SHIPPING.freeThreshold ? 0 : SHIPPING.cost;
    const total = Math.round((afterDiscount + shippingCost) * 100) / 100;

    return {
      success: true as const,
      data: { lines, subtotal, discount, couponApplied, couponError, shippingCost, total },
    };
  } catch (error) {
    console.error("quoteCart error:", error);
    return { success: false as const, error: "Error al cotizar el carrito" };
  }
}

export async function createOrder(data: CreateOrderData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Debes iniciar sesion para realizar un pedido" };
    }

    const { items, shipping, paymentMethod, couponCode } = data;

    if (!items || items.length === 0) {
      return { success: false, error: "El carrito esta vacio" };
    }

    const campaigns = await getActiveCampaigns();

    // Fetch products & validate stock
    const products: Record<string, any>[] = [];
    for (const item of items) {
      const product = await getItem<Record<string, any>>(TABLES.products, { id: item.id });
      if (product && product.active) {
        products.push(product);
      }
    }

    if (products.length !== items.length) {
      return { success: false, error: "Algunos productos ya no estan disponibles" };
    }

    // Map for quick lookup
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Validate stock
    for (const item of items) {
      const product = productMap.get(item.id);
      if (!product) {
        return { success: false, error: `Producto no encontrado: ${item.id}` };
      }
      if (product.stock < item.quantity) {
        return {
          success: false,
          error: `Stock insuficiente para "${product.name}". Disponible: ${product.stock}`,
        };
      }
    }

    // Calculate totals — precio efectivo con campañas, resuelto en servidor
    let subtotal = 0;
    const orderItems = items.map((item) => {
      const product = productMap.get(item.id)!;
      const priced = resolvePricing(product as any, campaigns);
      const unitPrice = priced.finalPrice;
      const total = Math.round(unitPrice * item.quantity * 100) / 100;
      subtotal += total;

      // Parse product images for the order item snapshot
      let images: string[] = [];
      try {
        images = typeof product.images === "string" ? JSON.parse(product.images) : product.images ?? [];
      } catch {
        images = [];
      }

      return {
        id: generateId(),
        productId: product.id,
        quantity: item.quantity,
        price: unitPrice,
        total,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          images,
          price: unitPrice,
        },
      };
    });
    subtotal = Math.round(subtotal * 100) / 100;

    // Cupón: validar con la MISMA lógica del checkout; el uso se consume
    // dentro de la transacción (condición anti-agotamiento)
    let discount = 0;
    let appliedCouponId: string | undefined;
    let appliedCouponCode: string | undefined;
    if (couponCode) {
      const coupon = await findCouponByCode(couponCode);
      const evaluation = evaluateCoupon(coupon, subtotal);
      if (!evaluation.valid) {
        return { success: false, error: evaluation.reason || "Cupón no válido" };
      }
      discount = evaluation.discount;
      appliedCouponId = coupon!.id;
      appliedCouponCode = coupon!.code;
    }

    const afterDiscount = Math.max(0, subtotal - discount);
    const shippingCost = afterDiscount >= SHIPPING.freeThreshold ? 0 : SHIPPING.cost;
    const total = Math.round((afterDiscount + shippingCost) * 100) / 100;

    // Build shipping address string
    const shippingAddress = [
      `${shipping.name} ${shipping.lastName}`,
      `DNI: ${shipping.dni}`,
      shipping.address,
      `${shipping.district}, ${shipping.city}`,
      shipping.postalCode ? `CP: ${shipping.postalCode}` : "",
      `Tel: ${shipping.phone}`,
      `Email: ${shipping.email}`,
    ]
      .filter(Boolean)
      .join("\n");

    // Número de orden vía contador atómico (sin scan, sin race condition)
    const orderNumber = await nextOrderNumber();

    const now = new Date().toISOString();
    const orderId = generateId();

    const orderRecord: Record<string, any> = {
      id: orderId,
      orderNumber,
      userId: session.user.id,
      status: "PENDING",
      subtotal,
      shippingCost,
      total,
      shippingAddress,
      paymentMethod,
      paymentStatus: "PENDING",
      notes: shipping.notes || null,
      items: JSON.stringify(orderItems),
      createdAt: now,
      updatedAt: now,
    };
    if (appliedCouponCode) {
      orderRecord.couponCode = appliedCouponCode;
      orderRecord.discount = discount;
    }

    // Transacción todo-o-nada: crear orden + descontar stock de cada producto.
    // La ConditionExpression garantiza que nunca se vende sin stock, incluso
    // con compras concurrentes.
    const tx: TransactItem[] = [
      {
        Put: {
          TableName: TABLES.orders,
          Item: orderRecord,
          ConditionExpression: "attribute_not_exists(id)",
        },
      },
      ...items.map((item) => ({
        Update: {
          TableName: TABLES.products,
          Key: { id: item.id },
          UpdateExpression: "SET stock = stock - :q, updatedAt = :now",
          ConditionExpression: "stock >= :q",
          ExpressionAttributeValues: { ":q": item.quantity, ":now": now },
        },
      })),
    ];

    // Consumo del cupón dentro de la misma transacción (anti-agotamiento)
    if (appliedCouponId) {
      tx.push({
        Update: {
          TableName: TABLES.coupons,
          Key: { id: appliedCouponId },
          UpdateExpression: "ADD usedCount :one",
          ConditionExpression: "active = :true AND (attribute_not_exists(maxUses) OR usedCount < maxUses)",
          ExpressionAttributeValues: { ":one": 1, ":true": true },
        },
      });
    }

    try {
      await transactWrite(tx);
    } catch (err: any) {
      if (err.name === "TransactionCanceledException") {
        // Reasons[0] = Put de la orden; Reasons[1..N] = productos; Reasons[N+1] = cupón
        const reasons: any[] = err.CancellationReasons ?? [];
        const failedIdx = reasons.findIndex((r) => r?.Code === "ConditionalCheckFailed");
        if (failedIdx > 0 && failedIdx <= items.length) {
          const failed = productMap.get(items[failedIdx - 1].id);
          return {
            success: false,
            error: `Stock insuficiente para "${failed?.name ?? "un producto"}". Intenta con menos unidades.`,
          };
        }
        if (failedIdx === items.length + 1) {
          return { success: false, error: "El cupón se agotó justo antes de completar tu compra." };
        }
      }
      throw err;
    }

    // Movimientos SALE (log de auditoría, best-effort: su pérdida no corrompe stock)
    try {
      const movements = [];
      for (const item of items) {
        const fresh = await getItem<Record<string, any>>(TABLES.products, { id: item.id });
        const product = productMap.get(item.id)!;
        movements.push({
          id: generateId(),
          productId: item.id,
          productName: product.name,
          type: "SALE",
          quantity: -item.quantity,
          stockAfter: fresh?.stock ?? product.stock - item.quantity,
          reference: orderId,
          note: `Pedido ${orderNumber}`,
          createdBy: session.user.id,
          createdAt: now,
        });
      }
      await batchWrite(TABLES.stockMovements, movements);
    } catch (err) {
      console.error("createOrder: fallo al escribir movimientos SALE (no crítico):", err);
    }

    // Return order with parsed items
    return {
      success: true,
      data: {
        ...orderRecord,
        items: orderItems,
      },
    };
  } catch (error) {
    console.error("createOrder error:", error);
    return { success: false, error: "Error al crear el pedido" };
  }
}

// ---------------------------------------------------------------------------
// cancelOrderRestock — cancela una orden y repone stock (transaccional)
// ---------------------------------------------------------------------------

/**
 * Cancela una orden reponiendo el stock de sus items en una sola transacción,
 * con guard anti doble-reposición (condición status <> CANCELLED).
 * La usan: el PATCH del admin, y /api/checkout/pay cuando un cargo falla.
 *
 * Permisos: ADMIN puede cancelar cualquier orden; el dueño solo la suya y
 * solo si sigue PENDING (evita que un comprador reponga stock de algo ya enviado).
 */
export async function cancelOrderRestock(
  orderId: string,
  options?: { note?: string; paymentStatus?: "PENDING" | "PAID" | "FAILED" | "REFUNDED" }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false as const, error: "No autorizado" };
    const isAdmin = (session.user as any).role === "ADMIN";

    const order = await getItem<Record<string, any>>(TABLES.orders, { id: orderId });
    if (!order || !order.orderNumber) return { success: false as const, error: "Pedido no encontrado" };

    if (!isAdmin) {
      if (order.userId !== session.user.id) return { success: false as const, error: "No autorizado" };
      if (order.status !== "PENDING") {
        return { success: false as const, error: "Solo se pueden cancelar pedidos pendientes" };
      }
    }

    if (order.status === "CANCELLED") {
      return { success: true as const, data: { alreadyCancelled: true } };
    }

    let items: any[] = [];
    try {
      items = typeof order.items === "string" ? JSON.parse(order.items) : order.items ?? [];
    } catch {
      items = [];
    }

    const now = new Date().toISOString();
    const values: Record<string, any> = {
      ":cancelled": "CANCELLED",
      ":now": now,
    };
    let setExpr = "SET #st = :cancelled, updatedAt = :now";
    const names: Record<string, string> = { "#st": "status" };
    if (options?.paymentStatus) {
      setExpr += ", paymentStatus = :ps";
      values[":ps"] = options.paymentStatus;
    }

    const tx: TransactItem[] = [
      {
        Update: {
          TableName: TABLES.orders,
          Key: { id: orderId },
          UpdateExpression: setExpr,
          ConditionExpression: "#st <> :cancelled",
          ExpressionAttributeNames: names,
          ExpressionAttributeValues: values,
        },
      },
      ...items
        .filter((it) => it.productId && it.quantity > 0)
        .map((it) => ({
          Update: {
            TableName: TABLES.products,
            Key: { id: it.productId },
            UpdateExpression: "SET updatedAt = :now ADD stock :q",
            ExpressionAttributeValues: { ":now": now, ":q": it.quantity },
          },
        })),
    ];

    try {
      await transactWrite(tx);
    } catch (err: any) {
      if (err.name === "TransactionCanceledException") {
        // Otro proceso la canceló primero — el stock ya fue repuesto una vez
        return { success: true as const, data: { alreadyCancelled: true } };
      }
      throw err;
    }

    // Movimientos CANCEL_RESTOCK (auditoría, best-effort)
    try {
      const movements = [];
      for (const it of items) {
        if (!it.productId || !(it.quantity > 0)) continue;
        const fresh = await getItem<Record<string, any>>(TABLES.products, { id: it.productId });
        movements.push({
          id: generateId(),
          productId: it.productId,
          productName: it.product?.name ?? fresh?.name ?? "Producto",
          type: "CANCEL_RESTOCK",
          quantity: it.quantity,
          stockAfter: fresh?.stock ?? 0,
          reference: orderId,
          note: options?.note ?? `Cancelación de ${order.orderNumber}`,
          createdBy: session.user.id,
          createdAt: now,
        });
      }
      if (movements.length) await batchWrite(TABLES.stockMovements, movements);
    } catch (err) {
      console.error("cancelOrderRestock: fallo en movimientos (no crítico):", err);
    }

    return { success: true as const, data: { alreadyCancelled: false } };
  } catch (error: any) {
    console.error("cancelOrderRestock error:", error);
    return { success: false as const, error: "Error al cancelar el pedido" };
  }
}

/**
 * Número de orden secuencial HANNA-000001 con contador atómico en el item
 * {id:"__counter"} de la tabla Orders. La primera vez migra desde el máximo
 * existente (put condicional: si dos procesos compiten, solo uno inicializa).
 */
async function nextOrderNumber(): Promise<string> {
  const counter = await getItem<Record<string, any>>(TABLES.orders, { id: "__counter" });
  if (!counter) {
    const allOrders = await scanTable<Record<string, any>>(TABLES.orders);
    let max = 0;
    for (const o of allOrders) {
      const match = o.orderNumber?.match?.(/HANNA-(\d+)/);
      if (match) max = Math.max(max, parseInt(match[1], 10));
    }
    await putItemIfNotExists(TABLES.orders, { id: "__counter", seq: max });
  }
  const seq = await atomicIncrement(TABLES.orders, { id: "__counter" }, "seq");
  return `HANNA-${String(seq).padStart(6, "0")}`;
}

// ---------------------------------------------------------------------------
// getUserOrders
// ---------------------------------------------------------------------------

export async function getUserOrders() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Debes iniciar sesion" };
    }

    const orders = await queryByIndex<Record<string, any>>(
      TABLES.orders,
      "user-index",
      "userId",
      session.user.id
    );

    // Sort by createdAt desc
    orders.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );

    // Parse items JSON and enrich product images
    const mapped = orders.map((order) => {
      let items: any[] = [];
      try {
        items = typeof order.items === "string" ? JSON.parse(order.items) : order.items ?? [];
      } catch {
        items = [];
      }

      // Ensure product images are arrays
      items = items.map((item: any) => ({
        ...item,
        product: item.product
          ? {
              ...item.product,
              images: Array.isArray(item.product.images)
                ? item.product.images
                : (() => {
                    try {
                      return JSON.parse(item.product.images);
                    } catch {
                      return [];
                    }
                  })(),
            }
          : item.product,
      }));

      return { ...order, items };
    });

    return { success: true, data: mapped };
  } catch (error) {
    console.error("getUserOrders error:", error);
    return { success: false, error: "Error al obtener los pedidos" };
  }
}

// ---------------------------------------------------------------------------
// getOrderById
// ---------------------------------------------------------------------------

export async function getOrderById(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Debes iniciar sesion" };
    }

    const order = await getItem<Record<string, any>>(TABLES.orders, { id });

    if (!order) {
      return { success: false, error: "Pedido no encontrado" };
    }

    // Verify the order belongs to the user (or user is admin)
    if (order.userId !== session.user.id && (session.user as any).role !== "ADMIN") {
      return { success: false, error: "No tienes permiso para ver este pedido" };
    }

    // Parse items JSON
    let items: any[] = [];
    try {
      items = typeof order.items === "string" ? JSON.parse(order.items) : order.items ?? [];
    } catch {
      items = [];
    }

    // Enrich with current product data if product snapshot is missing
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.product && item.productId) {
        const product = await getItem<Record<string, any>>(TABLES.products, { id: item.productId });
        if (product) {
          let images: string[] = [];
          try {
            images = typeof product.images === "string" ? JSON.parse(product.images) : product.images ?? [];
          } catch {
            images = [];
          }
          items[i] = { ...item, product: { ...product, images } };
        }
      } else if (item.product) {
        // Ensure images is an array
        const p = item.product;
        if (typeof p.images === "string") {
          try {
            p.images = JSON.parse(p.images);
          } catch {
            p.images = [];
          }
        }
      }
    }

    return { success: true, data: { ...order, items } };
  } catch (error) {
    console.error("getOrderById error:", error);
    return { success: false, error: "Error al obtener el pedido" };
  }
}
