import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
  BatchWriteCommand,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";

// ---------------------------------------------------------------------------
// Client singleton
// ---------------------------------------------------------------------------
const client = new DynamoDBClient({
  region: process.env.HANNA_AWS_REGION || process.env.AWS_REGION || "us-east-1",
  ...((process.env.HANNA_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID) && {
    credentials: {
      accessKeyId: (process.env.HANNA_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID)!,
      secretAccessKey: (process.env.HANNA_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY)!,
    },
  }),
});

export const dynamo = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

// ---------------------------------------------------------------------------
// Table names
// ---------------------------------------------------------------------------
const PREFIX = process.env.DYNAMO_PREFIX || "Hanna";
export const TABLES = {
  users: `${PREFIX}-Users`,
  categories: `${PREFIX}-Categories`,
  subcategories: `${PREFIX}-Subcategories`,
  products: `${PREFIX}-Products`,
  orders: `${PREFIX}-Orders`,
  reviews: `${PREFIX}-Reviews`,
  newsletter: `${PREFIX}-Newsletter`,
  contactMessages: `${PREFIX}-ContactMessages`,
  stockMovements: `${PREFIX}-StockMovements`,
  purchaseLots: `${PREFIX}-PurchaseLots`,
  campaigns: `${PREFIX}-Campaigns`,
  coupons: `${PREFIX}-Coupons`,
} as const;

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------
export async function getItem<T>(table: string, key: Record<string, any>): Promise<T | null> {
  const { Item } = await dynamo.send(new GetCommand({ TableName: table, Key: key }));
  return (Item as T) || null;
}

export async function putItem(table: string, item: Record<string, any>) {
  await dynamo.send(new PutCommand({ TableName: table, Item: item }));
  return item;
}

export async function updateItem(
  table: string,
  key: Record<string, any>,
  updates: Record<string, any>
) {
  const expressions: string[] = [];
  const names: Record<string, string> = {};
  const values: Record<string, any> = {};

  Object.entries(updates).forEach(([k, v], i) => {
    const nameKey = `#f${i}`;
    const valKey = `:v${i}`;
    expressions.push(`${nameKey} = ${valKey}`);
    names[nameKey] = k;
    values[valKey] = v;
  });

  const { Attributes } = await dynamo.send(
    new UpdateCommand({
      TableName: table,
      Key: key,
      UpdateExpression: `SET ${expressions.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ReturnValues: "ALL_NEW",
    })
  );
  return Attributes;
}

export async function deleteItem(table: string, key: Record<string, any>) {
  await dynamo.send(new DeleteCommand({ TableName: table, Key: key }));
}

export async function queryByIndex<T>(
  table: string,
  indexName: string,
  keyName: string,
  keyValue: any,
  options?: { limit?: number; scanForward?: boolean; filterExpression?: string; expressionValues?: Record<string, any>; expressionNames?: Record<string, string> }
): Promise<T[]> {
  const params: any = {
    TableName: table,
    IndexName: indexName,
    KeyConditionExpression: "#pk = :pkval",
    ExpressionAttributeNames: { "#pk": keyName, ...options?.expressionNames },
    ExpressionAttributeValues: { ":pkval": keyValue, ...options?.expressionValues },
    ScanIndexForward: options?.scanForward ?? true,
  };
  if (options?.limit) params.Limit = options.limit;
  if (options?.filterExpression) params.FilterExpression = options.filterExpression;

  const { Items } = await dynamo.send(new QueryCommand(params));
  return (Items as T[]) || [];
}

export async function scanTable<T>(
  table: string,
  options?: { limit?: number; filterExpression?: string; expressionValues?: Record<string, any>; expressionNames?: Record<string, string> }
): Promise<T[]> {
  const params: any = { TableName: table };
  if (options?.limit) params.Limit = options.limit;
  if (options?.filterExpression) params.FilterExpression = options.filterExpression;
  if (options?.expressionValues) params.ExpressionAttributeValues = options.expressionValues;
  if (options?.expressionNames) params.ExpressionAttributeNames = options.expressionNames;

  const { Items } = await dynamo.send(new ScanCommand(params));
  return (Items as T[]) || [];
}

export async function countItems(
  table: string,
  options?: { filterExpression?: string; expressionValues?: Record<string, any>; expressionNames?: Record<string, string> }
): Promise<number> {
  const params: any = { TableName: table, Select: "COUNT" };
  if (options?.filterExpression) params.FilterExpression = options.filterExpression;
  if (options?.expressionValues) params.ExpressionAttributeValues = options.expressionValues;
  if (options?.expressionNames) params.ExpressionAttributeNames = options.expressionNames;

  const { Count } = await dynamo.send(new ScanCommand(params));
  return Count || 0;
}

export async function batchWrite(table: string, items: Record<string, any>[]) {
  // DynamoDB limits to 25 items per batch
  const batches = [];
  for (let i = 0; i < items.length; i += 25) {
    batches.push(items.slice(i, i + 25));
  }

  for (const batch of batches) {
    await dynamo.send(
      new BatchWriteCommand({
        RequestItems: {
          [table]: batch.map((item) => ({
            PutRequest: { Item: item },
          })),
        },
      })
    );
  }
}

// ---------------------------------------------------------------------------
// Atomic helpers
// ---------------------------------------------------------------------------

/** Incremento atómico (ADD). Crea el atributo en 0+by si no existe. Devuelve el nuevo valor. */
export async function atomicIncrement(
  table: string,
  key: Record<string, any>,
  field: string,
  by = 1
): Promise<number> {
  const { Attributes } = await dynamo.send(
    new UpdateCommand({
      TableName: table,
      Key: key,
      UpdateExpression: "ADD #f :by",
      ExpressionAttributeNames: { "#f": field },
      ExpressionAttributeValues: { ":by": by },
      ReturnValues: "ALL_NEW",
    })
  );
  return (Attributes?.[field] as number) ?? 0;
}

/** Put condicional: solo escribe si el item no existe. Devuelve true si escribió. */
export async function putItemIfNotExists(table: string, item: Record<string, any>): Promise<boolean> {
  try {
    await dynamo.send(
      new PutCommand({
        TableName: table,
        Item: item,
        ConditionExpression: "attribute_not_exists(id)",
      })
    );
    return true;
  } catch (err: any) {
    if (err.name === "ConditionalCheckFailedException") return false;
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------
export type TransactItem = NonNullable<
  ConstructorParameters<typeof TransactWriteCommand>[0]["TransactItems"]
>[number];

/**
 * Escritura transaccional (todo-o-nada). DynamoDB permite hasta 100 items.
 * Úsalo cuando varias escrituras deben ser atómicas (p.ej. crear orden +
 * descontar stock + consumir cupón). Lanza TransactionCanceledException
 * si alguna ConditionExpression falla.
 */
export async function transactWrite(items: TransactItem[]) {
  if (items.length === 0) return;
  if (items.length > 100) {
    throw new Error(`transactWrite: máximo 100 items por transacción (recibidos ${items.length})`);
  }
  await dynamo.send(new TransactWriteCommand({ TransactItems: items }));
}

// ---------------------------------------------------------------------------
// ID generator
// ---------------------------------------------------------------------------
export function generateId(): string {
  return crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
