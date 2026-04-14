"use server";

import {
  getItem,
  putItem,
  updateItem,
  queryByIndex,
  scanTable,
  generateId,
  TABLES,
} from "@/lib/dynamo";
import { auth } from "@/lib/auth";
import { SHIPPING } from "@/lib/constants";

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
}

export async function createOrder(data: CreateOrderData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Debes iniciar sesion para realizar un pedido" };
    }

    const { items, shipping, paymentMethod } = data;

    if (!items || items.length === 0) {
      return { success: false, error: "El carrito esta vacio" };
    }

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

    // Calculate totals
    let subtotal = 0;
    const orderItems = items.map((item) => {
      const product = productMap.get(item.id)!;
      const total = product.price * item.quantity;
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
        price: product.price,
        total,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          images,
          price: product.price,
        },
      };
    });

    const shippingCost = subtotal >= SHIPPING.freeThreshold ? 0 : SHIPPING.cost;
    const total = subtotal + shippingCost;

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

    // Generate order number – scan for latest order number
    const allOrders = await scanTable<Record<string, any>>(TABLES.orders);
    let nextNum = 1;
    for (const o of allOrders) {
      if (o.orderNumber) {
        const match = o.orderNumber.match(/HANNA-(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num >= nextNum) nextNum = num + 1;
        }
      }
    }
    const orderNumber = `HANNA-${String(nextNum).padStart(6, "0")}`;

    const now = new Date().toISOString();
    const orderId = generateId();

    // Create order record with items stored as JSON array
    const order = await putItem(TABLES.orders, {
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
    });

    // Decrement stock for each product
    for (const item of items) {
      const product = productMap.get(item.id)!;
      await updateItem(TABLES.products, { id: item.id }, {
        stock: product.stock - item.quantity,
        updatedAt: now,
      });
    }

    // Return order with parsed items
    return {
      success: true,
      data: {
        ...order,
        items: orderItems,
      },
    };
  } catch (error) {
    console.error("createOrder error:", error);
    return { success: false, error: "Error al crear el pedido" };
  }
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
