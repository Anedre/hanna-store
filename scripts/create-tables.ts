/**
 * Crea (idempotente) las tablas DynamoDB nuevas del admin de stock/campañas.
 * Las 8 tablas base existentes NO se tocan — solo se reporta si existen.
 * Run: npm run setup:tables  (o npx tsx scripts/create-tables.ts)
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import {
  DynamoDBClient,
  DescribeTableCommand,
  CreateTableCommand,
  waitUntilTableExists,
  type CreateTableCommandInput,
} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
  region: process.env.HANNA_AWS_REGION || process.env.AWS_REGION || "us-east-1",
  ...((process.env.HANNA_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID) && {
    credentials: {
      accessKeyId: (process.env.HANNA_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID)!,
      secretAccessKey: (process.env.HANNA_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY)!,
    },
  }),
});

const PREFIX = process.env.DYNAMO_PREFIX || "Hanna";

const EXISTING_TABLES = [
  "Users", "Categories", "Subcategories", "Products",
  "Orders", "Reviews", "Newsletter", "ContactMessages",
].map((t) => `${PREFIX}-${t}`);

const NEW_TABLES: CreateTableCommandInput[] = [
  {
    TableName: `${PREFIX}-StockMovements`,
    BillingMode: "PAY_PER_REQUEST",
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "productId", AttributeType: "S" },
      { AttributeName: "createdAt", AttributeType: "S" },
    ],
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    GlobalSecondaryIndexes: [
      {
        IndexName: "product-index",
        KeySchema: [
          { AttributeName: "productId", KeyType: "HASH" },
          { AttributeName: "createdAt", KeyType: "RANGE" },
        ],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
  {
    TableName: `${PREFIX}-PurchaseLots`,
    BillingMode: "PAY_PER_REQUEST",
    AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
  },
  {
    TableName: `${PREFIX}-Campaigns`,
    BillingMode: "PAY_PER_REQUEST",
    AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
  },
  {
    TableName: `${PREFIX}-Coupons`,
    BillingMode: "PAY_PER_REQUEST",
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "code", AttributeType: "S" },
    ],
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    GlobalSecondaryIndexes: [
      {
        IndexName: "code-index",
        KeySchema: [{ AttributeName: "code", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
];

async function tableExists(name: string): Promise<boolean> {
  try {
    await client.send(new DescribeTableCommand({ TableName: name }));
    return true;
  } catch (err: any) {
    if (err.name === "ResourceNotFoundException") return false;
    throw err;
  }
}

async function main() {
  console.log(`Región: ${process.env.HANNA_AWS_REGION || process.env.AWS_REGION || "us-east-1"} · Prefijo: ${PREFIX}\n`);

  console.log("— Tablas base (no se modifican):");
  for (const name of EXISTING_TABLES) {
    const exists = await tableExists(name);
    console.log(`  ${exists ? "✓" : "✗ FALTA"}  ${name}`);
    if (!exists) {
      console.log(`     ⚠ ${name} no existe. Este script no la crea (sus GSIs se definieron fuera del repo).`);
    }
  }

  console.log("\n— Tablas nuevas:");
  for (const def of NEW_TABLES) {
    const name = def.TableName!;
    if (await tableExists(name)) {
      console.log(`  ✓ ${name} ya existe — sin cambios`);
      continue;
    }
    console.log(`  + Creando ${name}...`);
    await client.send(new CreateTableCommand(def));
    await waitUntilTableExists(
      { client, maxWaitTime: 120 },
      { TableName: name }
    );
    console.log(`  ✓ ${name} creada y ACTIVE`);
  }

  console.log("\nListo.");
}

main().catch((err) => {
  console.error("Error:", err.message || err);
  process.exit(1);
});
