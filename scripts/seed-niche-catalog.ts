/**
 * Migra el catálogo demo al nicho real (setup de escritorio minimal).
 * Idempotente — se puede correr varias veces.
 *
 * 1. Desactiva los productos fake del seed original (no los borra: los
 *    pedidos históricos los referencian)
 * 2. Des-aprueba las reseñas seed (testimonios fake = publicidad engañosa)
 * 3. Crea 4 categorías del nicho
 * 4. Crea los 5 SKU del plan de negocio como BORRADORES (active=false,
 *    stock 0, sin fotos) listos para llenar cuando lleguen las muestras
 *
 * Run: npm run seed:niche
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  UpdateCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.HANNA_AWS_REGION || process.env.AWS_REGION || "us-east-1",
  ...((process.env.HANNA_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID) && {
    credentials: {
      accessKeyId: (process.env.HANNA_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID)!,
      secretAccessKey: (process.env.HANNA_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY)!,
    },
  }),
});
const dynamo = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

const PREFIX = process.env.DYNAMO_PREFIX || "Hanna";
const T = {
  products: `${PREFIX}-Products`,
  categories: `${PREFIX}-Categories`,
  reviews: `${PREFIX}-Reviews`,
};

const now = new Date().toISOString();
const id = () => crypto.randomUUID();

const NICHE_CATEGORIES = [
  {
    slug: "deskmats",
    name: "Deskmats",
    description: "Alfombrillas de escritorio que definen tu espacio",
    image: "https://images.unsplash.com/photo-1616627561950-9f746e330187?w=900&q=75",
  },
  {
    slug: "iluminacion",
    name: "Iluminación",
    description: "Luz que cuida tus ojos y transforma tu setup",
    image: "https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=900&q=75",
  },
  {
    slug: "organizacion",
    name: "Organización",
    description: "Cables invisibles, escritorio despejado",
    image: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=900&q=75",
  },
  {
    slug: "soportes",
    name: "Soportes",
    description: "Cada cosa a su altura correcta",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=900&q=75",
  },
];

// Los 5 SKU del plan de negocio (lote de validación) — precios de venta del plan
const DRAFT_PRODUCTS = (categoryIds: Record<string, string>) => [
  {
    sku: "HANNA-DM-001",
    slug: "deskmat-minimal-90x40",
    name: "Deskmat Minimal 90×40",
    price: 59,
    categoryId: categoryIds["deskmats"],
    shortDescription: "Alfombrilla XL de tela con base antideslizante, borde cosido. Colores lisos.",
    tags: "deskmat,alfombrilla,escritorio,setup,minimal",
  },
  {
    sku: "HANNA-IL-001",
    slug: "barra-luz-monitor-usb",
    name: "Barra de Luz para Monitor USB",
    price: 109,
    categoryId: categoryIds["iluminacion"],
    shortDescription: "Luz asimétrica que ilumina tu escritorio sin reflejos en pantalla. USB, sin apps.",
    tags: "luz,monitor,lampara,setup,escritorio",
  },
  {
    sku: "HANNA-OR-001",
    slug: "kit-organizacion-cables",
    name: "Kit de Organización de Cables",
    price: 35,
    categoryId: categoryIds["organizacion"],
    shortDescription: "Clips, canaletas y sujetadores seleccionados para un escritorio sin cables a la vista.",
    tags: "cables,organizador,clips,escritorio",
  },
  {
    sku: "HANNA-SO-001",
    slug: "soporte-celular-aluminio",
    name: "Soporte de Celular de Aluminio",
    price: 35,
    categoryId: categoryIds["soportes"],
    shortDescription: "Soporte plegable de aluminio, ángulo ajustable, peso pluma.",
    tags: "soporte,celular,aluminio,escritorio",
  },
  {
    sku: "HANNA-OR-002",
    slug: "gancho-audifonos-aluminio",
    name: "Gancho de Audífonos de Aluminio",
    price: 39,
    categoryId: categoryIds["organizacion"],
    shortDescription: "Cuelga tus audífonos bajo el escritorio. Adhesivo 3M, aluminio sólido.",
    tags: "gancho,audifonos,headphones,escritorio",
  },
];

async function scanAll(table: string) {
  const items: Record<string, any>[] = [];
  let key: Record<string, any> | undefined;
  do {
    const res = await dynamo.send(new ScanCommand({ TableName: table, ExclusiveStartKey: key }));
    items.push(...((res.Items as Record<string, any>[]) ?? []));
    key = res.LastEvaluatedKey;
  } while (key);
  return items;
}

async function main() {
  console.log(`Prefijo: ${PREFIX}\n`);

  // 1. Desactivar productos fake (todo lo que no sea SKU HANNA-*)
  const products = await scanAll(T.products);
  let deactivated = 0;
  for (const p of products) {
    if (!p.id || !p.sku) continue;
    if (p.sku.startsWith("HANNA-")) continue; // nuestros borradores
    if (p.active === false) continue; // ya inactivo
    await dynamo.send(new UpdateCommand({
      TableName: T.products,
      Key: { id: p.id },
      UpdateExpression: "SET active = :f, featured = :f, updatedAt = :now",
      ExpressionAttributeValues: { ":f": false, ":now": now },
    }));
    deactivated++;
  }
  console.log(`✓ ${deactivated} productos demo desactivados (conservados por historial)`);

  // 2. Des-aprobar reseñas seed
  const reviews = await scanAll(T.reviews);
  let unapproved = 0;
  for (const r of reviews) {
    if (!r.id || !r.productId || r.approved !== true) continue;
    // La tabla Reviews tiene clave compuesta: productId (HASH) + id (RANGE)
    await dynamo.send(new UpdateCommand({
      TableName: T.reviews,
      Key: { productId: r.productId, id: r.id },
      UpdateExpression: "SET approved = :f",
      ExpressionAttributeValues: { ":f": false },
    }));
    unapproved++;
  }
  console.log(`✓ ${unapproved} reseñas seed des-aprobadas (testimonios fake fuera)`);

  // 3. Categorías del nicho (idempotente por slug)
  const categories = await scanAll(T.categories);
  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  const categoryIds: Record<string, string> = {};
  for (const cat of NICHE_CATEGORIES) {
    const existing = bySlug.get(cat.slug);
    if (existing) {
      categoryIds[cat.slug] = existing.id;
      console.log(`  = categoría ${cat.name} ya existe`);
      continue;
    }
    const catId = id();
    await dynamo.send(new PutCommand({
      TableName: T.categories,
      Item: { id: catId, ...cat, parentId: null, createdAt: now, updatedAt: now },
    }));
    categoryIds[cat.slug] = catId;
    console.log(`  + categoría ${cat.name} creada`);
  }

  // 4. Borradores de producto (idempotente por SKU)
  const existingSkus = new Set(products.map((p) => p.sku));
  let drafts = 0;
  for (const draft of DRAFT_PRODUCTS(categoryIds)) {
    if (existingSkus.has(draft.sku)) {
      console.log(`  = borrador ${draft.sku} ya existe`);
      continue;
    }
    await dynamo.send(new PutCommand({
      TableName: T.products,
      Item: {
        id: id(),
        ...draft,
        description:
          "BORRADOR — pendiente de fotos reales y descripción final. " +
          "Activar desde el admin cuando llegue la muestra validada.",
        compareAtPrice: null,
        stock: 0,
        cost: null,
        lowStockThreshold: 5,
        images: [],
        brand: "HANNA",
        origin: "China",
        weight: null,
        featured: false,
        active: false,
        createdAt: now,
        updatedAt: now,
      },
    }));
    drafts++;
    console.log(`  + borrador ${draft.sku} · ${draft.name} (S/ ${draft.price})`);
  }

  console.log(`\nListo: ${drafts} borradores nuevos. Actívalos desde /admin/productos cuando tengan foto real y stock.`);
}

main().catch((e) => {
  console.error("Error:", e.message || e);
  process.exit(1);
});
