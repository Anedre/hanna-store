import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * Subida de imágenes de producto a S3. En Amplify el filesystem es efímero,
 * así que TODAS las imágenes reales viven en el bucket (lectura pública
 * solo bajo products/).
 */

const REGION = process.env.HANNA_AWS_REGION || process.env.AWS_REGION || "us-east-1";

const s3 = new S3Client({
  region: REGION,
  ...((process.env.HANNA_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID) && {
    credentials: {
      accessKeyId: (process.env.HANNA_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID)!,
      secretAccessKey: (process.env.HANNA_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY)!,
    },
  }),
});

export function imagesBucket(): string | null {
  return process.env.S3_IMAGES_BUCKET || null;
}

export function publicImageUrl(key: string): string {
  return `https://${imagesBucket()}.s3.amazonaws.com/${key}`;
}

/** Sube un buffer (ya procesado) y devuelve su URL pública. */
export async function uploadProductImage(
  buffer: Buffer,
  contentType: string,
  extension: string
): Promise<string> {
  const bucket = imagesBucket();
  if (!bucket) throw new Error("S3_IMAGES_BUCKET no está configurado");

  const key = `products/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  return publicImageUrl(key);
}
