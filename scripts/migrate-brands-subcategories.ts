/**
 * Migrates products to add brand, subcategorySlug, and attributes fields.
 * Also creates subcategories in DynamoDB.
 * Run: npx tsx scripts/migrate-brands-subcategories.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { CATEGORY_FILTERS } from "../src/lib/category-filters";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: (process.env.HANNA_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID)!,
    secretAccessKey: (process.env.HANNA_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY)!,
  },
});
const dynamo = DynamoDBDocumentClient.from(client, { marshallOptions: { removeUndefinedValues: true } });

function id() { return crypto.randomUUID(); }

// Brand + subcategory assignments for existing 30 products
const PRODUCT_DATA: Record<string, { brand: string; subcategorySlug: string; attributes?: Record<string, string> }> = {
  "audifonos-bluetooth-pro":       { brand: "JBL",        subcategorySlug: "audifonos",          attributes: { connectivity: "Bluetooth 5.3", audio_type: "Over-ear", noise_cancel: "ANC Activa" } },
  "smartwatch-deportivo-x200":     { brand: "Xiaomi",     subcategorySlug: "wearables",          attributes: { connectivity: "Bluetooth 5.0" } },
  "cargador-inalambrico-rapido-15w":{ brand: "Ugreen",    subcategorySlug: "accesorios-tech",    attributes: { connectivity: "USB-C" } },
  "parlante-portatil-waterproof":  { brand: "JBL",        subcategorySlug: "audifonos",          attributes: { connectivity: "Bluetooth 5.0", audio_type: "Parlante" } },
  "hub-usb-c-7-en-1":             { brand: "Ugreen",     subcategorySlug: "accesorios-tech",    attributes: { connectivity: "USB-C" } },

  "lampara-led-inteligente-rgb":   { brand: "Xiaomi",     subcategorySlug: "iluminacion",        attributes: { smart: "WiFi", room: "Dormitorio" } },
  "organizador-escritorio-bambu":  { brand: "Muji",       subcategorySlug: "organizacion",       attributes: { material: "Bambu", room: "Oficina" } },
  "cortina-de-luces-led-3x3m":    { brand: "Philips",    subcategorySlug: "decoracion",         attributes: { room: "Dormitorio" } },
  "difusor-aromas-ultrasonico":    { brand: "Xiaomi",     subcategorySlug: "decoracion",         attributes: { room: "Dormitorio" } },
  "set-utensilios-cocina-silicona":{ brand: "WMF",        subcategorySlug: "cocina",             attributes: { material: "Silicona" } },

  "lentes-sol-polarizados-uv400": { brand: "Ray-Ban",    subcategorySlug: "lentes",             attributes: { gender: "Unisex", material: "Metal" } },
  "mochila-urbana-antirrobo":     { brand: "Samsonite",  subcategorySlug: "bolsos",             attributes: { gender: "Unisex", material: "Nylon" } },
  "reloj-minimalista-acero":      { brand: "Casio",      subcategorySlug: "accesorios-moda",    attributes: { gender: "Hombre", material: "Metal" } },
  "billetera-rfid-cuero-premium": { brand: "Fossil",     subcategorySlug: "accesorios-moda",    attributes: { gender: "Hombre", material: "Cuero genuino" } },
  "zapatillas-running-air-max":   { brand: "Nike",       subcategorySlug: "calzado",            attributes: { gender: "Unisex", shoe_size: "42" } },

  "banda-resistencia-set-x5":     { brand: "Decathlon",  subcategorySlug: "fitness",            attributes: { sport: "Gym", resistance: "Variada" } },
  "botella-termica-750ml":        { brand: "Hydro Flask",subcategorySlug: "accesorios-deporte",  attributes: { sport: "Running", material: "Acero inoxidable" } },
  "guantes-gimnasio-pro":         { brand: "Under Armour",subcategorySlug: "fitness",           attributes: { sport: "Gym", gender: "Unisex" } },
  "rodillera-deportiva-compresion":{ brand: "Nike",       subcategorySlug: "fitness",            attributes: { sport: "Running", gender: "Unisex" } },
  "cuerda-saltar-speed-pro":      { brand: "Rogue",      subcategorySlug: "fitness",            attributes: { sport: "CrossFit" } },

  "set-skincare-coreano-5-pasos": { brand: "COSRX",      subcategorySlug: "skincare",           attributes: { skin_type: "Mixta", concern: "Hidratacion", origin: "Corea del Sur" } },
  "kit-brochas-maquillaje-x12":   { brand: "Morphe",     subcategorySlug: "maquillaje",         attributes: { finish: "Natural" } },
  "mascarillas-faciales-pack-x10":{ brand: "Innisfree",  subcategorySlug: "skincare",           attributes: { skin_type: "Normal", concern: "Hidratacion", origin: "Corea del Sur" } },
  "serum-vitamina-c-30ml":        { brand: "The Ordinary",subcategorySlug: "skincare",          attributes: { skin_type: "Mixta", concern: "Manchas", origin: "Corea del Sur" } },
  "rizador-pestanas-calentado":   { brand: "Etude House",subcategorySlug: "herramientas-belleza",attributes: { origin: "Corea del Sur" } },

  "robot-educativo-programable":  { brand: "LEGO",       subcategorySlug: "stem-robotica",      attributes: { age: "6-8 anos", skill: "Logica" } },
  "set-bloques-magneticos-x100":  { brand: "Playmobil",  subcategorySlug: "construccion",       attributes: { age: "3-5 anos", pieces: "101-500", skill: "Creatividad" } },
  "kit-de-ciencia-y-experimentos":{ brand: "National Geographic",subcategorySlug: "educativos",  attributes: { age: "6-8 anos", skill: "Ciencia" } },
  "pista-carreras-electrica":     { brand: "Hot Wheels",  subcategorySlug: "educativos",        attributes: { age: "6-8 anos", skill: "Motricidad" } },
  "peluche-interactivo-musical":  { brand: "Fisher-Price",subcategorySlug: "peluches",          attributes: { age: "0-2 anos" } },
};

async function main() {
  console.log("=".repeat(50));
  console.log("  HANNA - Brand & Subcategory Migration");
  console.log("=".repeat(50));

  // 1. Create subcategories
  console.log("\n[1/2] Creating subcategories...");
  const { Items: categories } = await dynamo.send(new ScanCommand({ TableName: "Hanna-Categories" }));
  const catMap = new Map<string, string>(); // slug -> id
  for (const cat of categories || []) catMap.set(cat.slug as string, cat.id as string);

  let subCount = 0;
  for (const [catSlug, config] of Object.entries(CATEGORY_FILTERS)) {
    const categoryId = catMap.get(catSlug);
    if (!categoryId) { console.log(`  Warning: category ${catSlug} not found`); continue; }

    for (let i = 0; i < config.subcategories.length; i++) {
      const sub = config.subcategories[i];
      await dynamo.send(new PutCommand({
        TableName: "Hanna-Subcategories",
        Item: {
          id: id(),
          name: sub.name,
          slug: sub.slug,
          categoryId,
          icon: sub.icon || null,
          order: i,
          createdAt: new Date().toISOString(),
        },
      }));
      subCount++;
    }
  }
  console.log(`  ${subCount} subcategories created`);

  // 2. Update products with brand, subcategorySlug, attributes
  console.log("\n[2/2] Updating products with brands...");
  const { Items: products } = await dynamo.send(new ScanCommand({ TableName: "Hanna-Products" }));

  let updated = 0;
  for (const product of products || []) {
    const slug = product.slug as string;
    const data = PRODUCT_DATA[slug];
    if (!data) continue;

    await dynamo.send(new UpdateCommand({
      TableName: "Hanna-Products",
      Key: { id: product.id },
      UpdateExpression: "SET brand = :b, subcategorySlug = :sc, attributes = :attr",
      ExpressionAttributeValues: {
        ":b": data.brand,
        ":sc": data.subcategorySlug,
        ":attr": JSON.stringify(data.attributes || {}),
      },
    }));
    updated++;
  }
  console.log(`  ${updated}/${products?.length || 0} products updated with brands`);

  console.log("\n" + "=".repeat(50));
  console.log("  MIGRATION COMPLETE!");
  console.log("=".repeat(50));
}

main().catch(console.error);
