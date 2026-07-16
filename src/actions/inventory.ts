"use server";

import {
  getItem,
  scanTable,
  queryByIndex,
  generateId,
  atomicIncrement,
  putItemIfNotExists,
  transactWrite,
  TABLES,
  type TransactItem,
} from "@/lib/dynamo";
import { auth } from "@/lib/auth";
import type { StockMovement, PurchaseLot, PurchaseLotItem } from "@/types";

// ---------------------------------------------------------------------------
// Guard
// ---------------------------------------------------------------------------

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    throw new Error("No autorizado");
  }
  return session.user as { id: string; name?: string };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

// ---------------------------------------------------------------------------
// Resumen de stock
// ---------------------------------------------------------------------------

export interface StockRow {
  id: string;
  name: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  cost: number | null;
  price: number;
  /** % margen sobre precio de venta (null si no hay costo) */
  marginPercent: number | null;
  /** stock × costo */
  stockValue: number;
  active: boolean;
}

export async function getStockOverview() {
  try {
    await requireAdmin();
    const products = await scanTable<Record<string, any>>(TABLES.products);

    const rows: StockRow[] = products.map((p) => {
      const threshold = p.lowStockThreshold ?? 5;
      const cost = typeof p.cost === "number" ? p.cost : null;
      return {
        id: p.id,
        name: p.name,
        sku: p.sku ?? "",
        stock: p.stock ?? 0,
        lowStockThreshold: threshold,
        isLowStock: (p.stock ?? 0) <= threshold,
        cost,
        price: p.price ?? 0,
        marginPercent:
          cost !== null && p.price > 0 ? round2(((p.price - cost) / p.price) * 100) : null,
        stockValue: cost !== null ? round2((p.stock ?? 0) * cost) : 0,
        active: p.active !== false,
      };
    });

    rows.sort((a, b) => Number(b.isLowStock) - Number(a.isLowStock) || a.name.localeCompare(b.name));

    const totals = {
      totalUnits: rows.reduce((s, r) => s + r.stock, 0),
      totalValue: round2(rows.reduce((s, r) => s + r.stockValue, 0)),
      lowStockCount: rows.filter((r) => r.isLowStock && r.active).length,
      productCount: rows.length,
    };

    return { success: true as const, data: { rows, totals } };
  } catch (error: any) {
    console.error("getStockOverview error:", error);
    return { success: false as const, error: error.message || "Error al obtener stock" };
  }
}

// ---------------------------------------------------------------------------
// Movimientos
// ---------------------------------------------------------------------------

export async function getMovements(options?: { productId?: string; limit?: number }) {
  try {
    await requireAdmin();
    const limit = options?.limit ?? 200;

    let movements: StockMovement[];
    if (options?.productId) {
      movements = await queryByIndex<StockMovement>(
        TABLES.stockMovements,
        "product-index",
        "productId",
        options.productId,
        { scanForward: false, limit }
      );
    } else {
      movements = await scanTable<StockMovement>(TABLES.stockMovements);
      movements.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      movements = movements.slice(0, limit);
    }

    return { success: true as const, data: movements };
  } catch (error: any) {
    console.error("getMovements error:", error);
    return { success: false as const, error: error.message || "Error al obtener movimientos" };
  }
}

// ---------------------------------------------------------------------------
// Ajuste manual de stock
// ---------------------------------------------------------------------------

export async function adjustStock(input: { productId: string; newStock: number; note: string }) {
  try {
    const user = await requireAdmin();
    const { productId, newStock, note } = input;

    if (!Number.isInteger(newStock) || newStock < 0) {
      return { success: false as const, error: "El stock debe ser un entero ≥ 0" };
    }
    if (!note?.trim()) {
      return { success: false as const, error: "Indica el motivo del ajuste" };
    }

    const product = await getItem<Record<string, any>>(TABLES.products, { id: productId });
    if (!product) return { success: false as const, error: "Producto no encontrado" };

    const delta = newStock - (product.stock ?? 0);
    if (delta === 0) return { success: true as const, data: { unchanged: true } };

    const now = new Date().toISOString();
    const movement: StockMovement = {
      id: generateId(),
      productId,
      productName: product.name,
      type: "ADJUSTMENT",
      quantity: delta,
      stockAfter: newStock,
      note: note.trim(),
      createdBy: user.id,
      createdAt: now,
    };

    // Lock optimista (stock = valor leído) para que stockAfter sea exacto
    const tx: TransactItem[] = [
      {
        Update: {
          TableName: TABLES.products,
          Key: { id: productId },
          UpdateExpression: "SET stock = :new, updatedAt = :now",
          ConditionExpression: "stock = :old",
          ExpressionAttributeValues: { ":new": newStock, ":old": product.stock ?? 0, ":now": now },
        },
      },
      { Put: { TableName: TABLES.stockMovements, Item: movement as any } },
    ];

    try {
      await transactWrite(tx);
    } catch (err: any) {
      if (err.name === "TransactionCanceledException") {
        return {
          success: false as const,
          error: "El stock cambió mientras editabas (¿venta simultánea?). Recarga e intenta de nuevo.",
        };
      }
      throw err;
    }

    return { success: true as const, data: movement };
  } catch (error: any) {
    console.error("adjustStock error:", error);
    return { success: false as const, error: error.message || "Error al ajustar stock" };
  }
}

// ---------------------------------------------------------------------------
// Lotes de compra
// ---------------------------------------------------------------------------

export async function getLots() {
  try {
    await requireAdmin();
    const all = await scanTable<PurchaseLot>(TABLES.purchaseLots);
    const lots = all.filter((l) => l.code); // excluye {id:"__counter"}
    lots.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    return { success: true as const, data: lots };
  } catch (error: any) {
    console.error("getLots error:", error);
    return { success: false as const, error: error.message || "Error al obtener lotes" };
  }
}

export interface CreateLotInput {
  supplier: string;
  sourceUrl?: string;
  purchaseDate: string;
  extraCosts: number;
  note?: string;
  items: { productId: string; qty: number; unitCost: number }[];
}

/**
 * Registra un lote de compra recibido:
 * 1. Prorratea extraCosts entre líneas por valor → landedUnitCost ("puesto en Lima")
 * 2. Suma stock y recalcula costo promedio ponderado de cada producto
 * 3. Todo-o-nada: lote + productos + movimientos PURCHASE en una transacción
 * Los lotes son inmutables una vez aplicados (correcciones = ajuste manual).
 */
export async function createPurchaseLot(input: CreateLotInput) {
  try {
    const user = await requireAdmin();
    const { supplier, sourceUrl, purchaseDate, note } = input;
    const extraCosts = round2(Number(input.extraCosts) || 0);

    if (!supplier?.trim()) return { success: false as const, error: "Indica el proveedor" };
    if (!input.items?.length) return { success: false as const, error: "Agrega al menos un producto" };
    if (input.items.length > 40) {
      return { success: false as const, error: "Máximo 40 productos por lote (límite transaccional)" };
    }
    for (const it of input.items) {
      if (!Number.isInteger(it.qty) || it.qty <= 0) {
        return { success: false as const, error: "Las cantidades deben ser enteros > 0" };
      }
      if (!(it.unitCost >= 0)) {
        return { success: false as const, error: "Los costos unitarios deben ser ≥ 0" };
      }
    }

    // Cargar productos y validar existencia
    const products = new Map<string, Record<string, any>>();
    for (const it of input.items) {
      if (products.has(it.productId)) {
        return { success: false as const, error: "Hay un producto repetido en el lote" };
      }
      const p = await getItem<Record<string, any>>(TABLES.products, { id: it.productId });
      if (!p) return { success: false as const, error: `Producto no encontrado: ${it.productId}` };
      products.set(it.productId, p);
    }

    // Prorrateo de extras por valor de línea (si el valor total es 0, por unidad)
    const itemsTotal = round2(input.items.reduce((s, it) => s + it.qty * it.unitCost, 0));
    const totalUnits = input.items.reduce((s, it) => s + it.qty, 0);

    const lotItems: PurchaseLotItem[] = input.items.map((it) => {
      const lineValue = it.qty * it.unitCost;
      const lineExtra = itemsTotal > 0 ? extraCosts * (lineValue / itemsTotal) : extraCosts * (it.qty / totalUnits);
      const landedUnitCost = round2(it.unitCost + lineExtra / it.qty);
      return {
        productId: it.productId,
        productName: products.get(it.productId)!.name,
        qty: it.qty,
        unitCost: round2(it.unitCost),
        landedUnitCost,
      };
    });

    // Código secuencial LOTE-001
    await putItemIfNotExists(TABLES.purchaseLots, { id: "__counter", seq: 0 });
    const seq = await atomicIncrement(TABLES.purchaseLots, { id: "__counter" }, "seq");
    const code = `LOTE-${String(seq).padStart(3, "0")}`;

    const now = new Date().toISOString();
    const lot: PurchaseLot = {
      id: generateId(),
      code,
      supplier: supplier.trim(),
      sourceUrl: sourceUrl?.trim() || undefined,
      purchaseDate: purchaseDate || now.slice(0, 10),
      items: lotItems,
      extraCosts,
      itemsTotal,
      grandTotal: round2(itemsTotal + extraCosts),
      note: note?.trim() || undefined,
      createdBy: user.id,
      createdAt: now,
    };

    // Transacción: lote + (stock/costo por producto) + movimientos PURCHASE.
    // Lock optimista sobre stock leído → stockAfter y promedio exactos.
    const tx: TransactItem[] = [
      { Put: { TableName: TABLES.purchaseLots, Item: lot as any } },
    ];

    for (const li of lotItems) {
      const p = products.get(li.productId)!;
      const oldStock: number = p.stock ?? 0;
      const oldCost: number | null = typeof p.cost === "number" ? p.cost : null;
      const newStock = oldStock + li.qty;
      // Promedio ponderado; si no había costo previo, el costo pasa a ser el del lote
      const newCost =
        oldCost === null || oldStock === 0
          ? li.landedUnitCost
          : round2((oldStock * oldCost + li.qty * li.landedUnitCost) / newStock);

      tx.push({
        Update: {
          TableName: TABLES.products,
          Key: { id: li.productId },
          UpdateExpression: "SET stock = :new, cost = :cost, updatedAt = :now",
          ConditionExpression: "stock = :old",
          ExpressionAttributeValues: {
            ":new": newStock,
            ":cost": newCost,
            ":old": oldStock,
            ":now": now,
          },
        },
      });

      const movement: StockMovement = {
        id: generateId(),
        productId: li.productId,
        productName: li.productName,
        type: "PURCHASE",
        quantity: li.qty,
        stockAfter: newStock,
        unitCost: li.landedUnitCost,
        reference: lot.id,
        note: `Lote ${code} · ${supplier.trim()}`,
        createdBy: user.id,
        createdAt: now,
      };
      tx.push({ Put: { TableName: TABLES.stockMovements, Item: movement as any } });
    }

    try {
      await transactWrite(tx);
    } catch (err: any) {
      if (err.name === "TransactionCanceledException") {
        return {
          success: false as const,
          error: "El stock de un producto cambió durante el registro (¿venta simultánea?). Vuelve a intentar.",
        };
      }
      throw err;
    }

    return { success: true as const, data: lot };
  } catch (error: any) {
    console.error("createPurchaseLot error:", error);
    return { success: false as const, error: error.message || "Error al registrar el lote" };
  }
}
