import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { auth } from "@/lib/auth";
import { uploadProductImage, imagesBucket } from "@/lib/s3";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic"];

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    if (!imagesBucket()) {
      return NextResponse.json(
        { success: false, error: "S3_IMAGES_BUCKET no configurado en el servidor" },
        { status: 500 }
      );
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "Falta el archivo" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ success: false, error: "Máximo 8MB por imagen" }, { status: 400 });
    }
    if (file.type && !ACCEPTED.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Formato no soportado (usa JPG, PNG, WebP o HEIC)" },
        { status: 400 }
      );
    }

    const input = Buffer.from(await file.arrayBuffer());

    // Normalizar: rotación EXIF + máx 1200px + webp (peso ~10x menor que el original de celular)
    const processed = await sharp(input)
      .rotate()
      .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    const url = await uploadProductImage(processed, "image/webp", "webp");
    return NextResponse.json({ success: true, url });
  } catch (err: any) {
    console.error("POST /api/admin/upload error:", err);
    const denied = err?.name === "AccessDenied" || err?.Code === "AccessDenied";
    return NextResponse.json(
      {
        success: false,
        error: denied
          ? "El usuario IAM no tiene permiso s3:PutObject sobre el bucket (revisar policy)"
          : "Error al subir la imagen",
      },
      { status: 500 }
    );
  }
}
