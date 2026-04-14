import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";
import {
  generateImage,
  buildPrompt,
  slugify,
  type ImageType,
} from "@/lib/gemini";

interface RequestBody {
  type: ImageType;
  name?: string;
  category?: string;
}

const VALID_TYPES: ImageType[] = ["hero", "category", "product"];

export async function POST(request: NextRequest) {
  try {
    // ---------- Auth: admin only ----------
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado. Se requiere rol de administrador." },
        { status: 401 }
      );
    }

    // ---------- Validate body ----------
    const body: RequestBody = await request.json();

    if (!body.type || !VALID_TYPES.includes(body.type)) {
      return NextResponse.json(
        {
          error: `Tipo invalido. Valores permitidos: ${VALID_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (body.type === "category" && !body.name) {
      return NextResponse.json(
        { error: "El campo 'name' es requerido para imagenes de categoria." },
        { status: 400 }
      );
    }

    if (body.type === "product" && (!body.name || !body.category)) {
      return NextResponse.json(
        {
          error:
            "Los campos 'name' y 'category' son requeridos para imagenes de producto.",
        },
        { status: 400 }
      );
    }

    // ---------- Check API key ----------
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY no esta configurada en el servidor." },
        { status: 500 }
      );
    }

    // ---------- Build prompt & generate ----------
    const prompt = buildPrompt({
      type: body.type,
      name: body.name,
      category: body.category,
    });

    const imageBuffer = await generateImage(prompt);

    if (!imageBuffer) {
      return NextResponse.json(
        {
          error:
            "No se pudo generar la imagen. El modelo puede no soportar generacion de imagenes o el prompt fue rechazado.",
          prompt,
        },
        { status: 422 }
      );
    }

    // ---------- Determine output path ----------
    const slug = body.name ? slugify(body.name) : `hero-${Date.now()}`;
    const subDir = body.type === "hero" ? "hero" : `${body.type}s`;
    // e.g. public/images/hero/, public/images/categories/, public/images/products/
    const relativeDir = `/images/${subDir}`;
    const absoluteDir = path.join(process.cwd(), "public", relativeDir);

    await mkdir(absoluteDir, { recursive: true });

    const filename = `${slug}.png`;
    const absolutePath = path.join(absoluteDir, filename);
    const publicPath = `${relativeDir}/${filename}`;

    await writeFile(absolutePath, imageBuffer);

    return NextResponse.json({
      success: true,
      path: publicPath,
      filename,
      type: body.type,
    });
  } catch (error) {
    console.error("Error in /api/generate-image:", error);

    const message =
      error instanceof Error ? error.message : "Error interno del servidor";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
