import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Brand style preamble for all image prompts
const BRAND_PREAMBLE =
  "Modern, clean e-commerce product photography style. Brand colors: teal (#00B4A0) and gold (#C8A040) accents on cream (#F5F0EB) backgrounds. Minimalist composition, soft studio lighting. Target: young Peruvian shoppers. Style: modern, fun, slightly futuristic.";

export type ImageType = "hero" | "category" | "product";

export interface GenerateImageOptions {
  type: ImageType;
  name?: string;
  category?: string;
}

/**
 * Generate an image using the Gemini API.
 *
 * Returns a Buffer of image bytes on success, or null if the model does not
 * support image generation or an error occurs.
 */
export async function generateImage(prompt: string): Promise<Buffer | null> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
    });

    const fullPrompt = `${BRAND_PREAMBLE}\n\n${prompt}`;

    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
    });

    const result = response.response;

    for (const candidate of result.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData) {
          return Buffer.from(part.inlineData.data, "base64");
        }
      }
    }

    // Model responded but did not produce an image
    return null;
  } catch (error) {
    console.error("Gemini image generation error:", error);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Prompt builders                                                   */
/* ------------------------------------------------------------------ */

export function buildHeroPrompt(variation?: number): string {
  const base =
    "Generate a wide banner image (16:9 ratio) for an e-commerce website hero section. Show a curated flat-lay arrangement of diverse international products (tech gadgets, fashion accessories, beauty products, home items) on a clean cream surface. Include subtle teal and gold accent elements. Professional product photography, overhead shot, soft natural lighting. No text or logos.";

  if (variation === 2) {
    return base.replace(
      "overhead shot",
      "slight 30-degree angle shot with shallow depth of field"
    );
  }
  return base;
}

const CATEGORY_PROMPTS: Record<string, string> = {
  Tecnologia:
    "Generate a product photography image of modern tech gadgets (wireless earbuds, smartwatch, portable speaker, phone case) arranged neatly on a cream surface with teal accent lighting. Minimalist, clean composition.",
  Hogar:
    "Generate a product photography image of modern home & kitchen items (smart diffuser, LED strip lights, organizer, mug) arranged artfully on a cream surface with gold accent elements. Warm, inviting feel.",
  Moda:
    "Generate a product photography image of trendy fashion accessories (sunglasses, watch, bag, sneakers) styled on a cream surface with teal and gold accent props. Fashion editorial style.",
  Deportes:
    "Generate a product photography image of fitness and sports equipment (resistance bands, water bottle, yoga mat, running armband) on a cream surface with dynamic teal accent lighting.",
  Belleza:
    "Generate a product photography image of Korean beauty and skincare products (serums, sheet masks, lip tint, brush set) arranged on a cream marble surface with gold accents. Clean, luxurious feel.",
  Juguetes:
    "Generate a product photography image of fun educational toys and games (building blocks, RC car, puzzle, plush toy) on a cream surface with playful teal and gold elements. Bright, cheerful mood.",
};

export function buildCategoryPrompt(categoryName: string): string {
  return (
    CATEGORY_PROMPTS[categoryName] ||
    `Generate a product photography image of ${categoryName} items arranged beautifully on a cream surface with teal and gold accents.`
  );
}

export function buildProductPrompt(
  productName: string,
  category: string
): string {
  return `Generate a single product photo of "${productName}" (a ${category} product). Centered on a clean cream background. Professional studio lighting, sharp focus, slight shadow for depth. E-commerce product listing style. No text, no logos, just the product.`;
}

/**
 * Build the appropriate prompt based on the image type.
 */
export function buildPrompt(options: GenerateImageOptions): string {
  switch (options.type) {
    case "hero":
      return buildHeroPrompt();
    case "category":
      if (!options.name) {
        throw new Error("Category name is required for category images");
      }
      return buildCategoryPrompt(options.name);
    case "product":
      if (!options.name || !options.category) {
        throw new Error(
          "Product name and category are required for product images"
        );
      }
      return buildProductPrompt(options.name, options.category);
    default:
      throw new Error(`Unknown image type: ${options.type}`);
  }
}

/* ------------------------------------------------------------------ */
/*  Utilities                                                         */
/* ------------------------------------------------------------------ */

/** Convert a human-readable name to a filesystem-safe slug. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
