/**
 * Updates all products and categories with real Unsplash image URLs
 * Run: npx tsx scripts/update-images.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: (process.env.HANNA_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID)!,
    secretAccessKey: (process.env.HANNA_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY)!,
  },
});
const dynamo = DynamoDBDocumentClient.from(client, { marshallOptions: { removeUndefinedValues: true } });

// Real Unsplash images mapped by product slug
const PRODUCT_IMAGES: Record<string, string[]> = {
  "audifonos-bluetooth-pro": [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop",
  ],
  "smartwatch-deportivo-x200": [
    "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop",
  ],
  "cargador-inalambrico-rapido-15w": [
    "https://images.unsplash.com/photo-1591348278863-a8fb3887e2aa?w=800&h=800&fit=crop",
  ],
  "parlante-portatil-waterproof": [
    "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=800&fit=crop",
  ],
  "hub-usb-c-7-en-1": [
    "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800&h=800&fit=crop",
  ],
  "lampara-led-inteligente-rgb": [
    "https://images.unsplash.com/photo-1507473885765-e6ed057ab3fe?w=800&h=800&fit=crop",
  ],
  "organizador-escritorio-bambu": [
    "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&h=800&fit=crop",
  ],
  "cortina-de-luces-led-3x3m": [
    "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&h=800&fit=crop",
  ],
  "difusor-aromas-ultrasonico": [
    "https://images.unsplash.com/photo-1602928321679-560bb453f190?w=800&h=800&fit=crop",
  ],
  "set-utensilios-cocina-silicona": [
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=800&fit=crop",
  ],
  "lentes-sol-polarizados-uv400": [
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=800&fit=crop",
  ],
  "mochila-urbana-antirrobo": [
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=800&h=800&fit=crop",
  ],
  "reloj-minimalista-acero": [
    "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=800&fit=crop",
  ],
  "billetera-rfid-cuero-premium": [
    "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&h=800&fit=crop",
  ],
  "zapatillas-running-air-max": [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=800&fit=crop",
  ],
  "banda-resistencia-set-x5": [
    "https://images.unsplash.com/photo-1598268030450-7a476f602e5e?w=800&h=800&fit=crop",
  ],
  "botella-termica-750ml": [
    "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&h=800&fit=crop",
  ],
  "guantes-gimnasio-pro": [
    "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&h=800&fit=crop",
  ],
  "rodillera-deportiva-compresion": [
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop",
  ],
  "cuerda-saltar-speed-pro": [
    "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=800&h=800&fit=crop",
  ],
  "set-skincare-coreano-5-pasos": [
    "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=800&h=800&fit=crop",
  ],
  "kit-brochas-maquillaje-x12": [
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=800&fit=crop",
  ],
  "mascarillas-faciales-pack-x10": [
    "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&h=800&fit=crop",
  ],
  "serum-vitamina-c-30ml": [
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&h=800&fit=crop",
  ],
  "rizador-pestanas-calentado": [
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=800&fit=crop",
  ],
  "robot-educativo-programable": [
    "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&h=800&fit=crop",
  ],
  "set-bloques-magneticos-x100": [
    "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&h=800&fit=crop",
  ],
  "kit-de-ciencia-y-experimentos": [
    "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=800&fit=crop",
  ],
  "pista-carreras-electrica": [
    "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=800&fit=crop",
  ],
  "peluche-interactivo-musical": [
    "https://images.unsplash.com/photo-1559715541-5daf8a0296d0?w=800&h=800&fit=crop",
  ],
};

const CATEGORY_IMAGES: Record<string, string> = {
  tecnologia: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&h=600&fit=crop",
  hogar: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
  moda: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop",
  deportes: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop",
  belleza: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop",
  juguetes: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800&h=600&fit=crop",
};

async function main() {
  console.log("Updating product images...");

  // Get all products
  const { Items: products } = await dynamo.send(new ScanCommand({ TableName: "Hanna-Products" }));

  let updated = 0;
  for (const product of products || []) {
    const slug = product.slug as string;
    const images = PRODUCT_IMAGES[slug];
    if (images) {
      await dynamo.send(new UpdateCommand({
        TableName: "Hanna-Products",
        Key: { id: product.id },
        UpdateExpression: "SET images = :imgs",
        ExpressionAttributeValues: { ":imgs": JSON.stringify(images) },
      }));
      updated++;
    }
  }
  console.log(`  ${updated}/${products?.length || 0} products updated with real images`);

  console.log("\nUpdating category images...");
  const { Items: categories } = await dynamo.send(new ScanCommand({ TableName: "Hanna-Categories" }));

  for (const cat of categories || []) {
    const slug = cat.slug as string;
    const image = CATEGORY_IMAGES[slug];
    if (image) {
      await dynamo.send(new UpdateCommand({
        TableName: "Hanna-Categories",
        Key: { id: cat.id },
        UpdateExpression: "SET image = :img",
        ExpressionAttributeValues: { ":img": image },
      }));
    }
  }
  console.log(`  ${Object.keys(CATEGORY_IMAGES).length} categories updated`);

  console.log("\nDone!");
}

main().catch(console.error);
