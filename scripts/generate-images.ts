/**
 * Batch image generation script for the HANNA e-commerce store.
 *
 * Generates hero banners, category images, and product images using the
 * Gemini API and saves them to public/images/.
 *
 * Usage:
 *   npx tsx scripts/generate-images.ts              # full run
 *   npx tsx scripts/generate-images.ts --dry-run     # preview only
 *   npx tsx scripts/generate-images.ts --only=hero   # hero only
 *   npx tsx scripts/generate-images.ts --only=categories
 *   npx tsx scripts/generate-images.ts --only=products
 *   npx tsx scripts/generate-images.ts --limit=5     # first N products only
 */

import { config } from "dotenv";
// Load env vars from .env.local and .env
config({ path: ".env.local" });
config({ path: ".env" });

import { PrismaClient } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import {
  generateImage,
  buildHeroPrompt,
  buildCategoryPrompt,
  buildProductPrompt,
  slugify,
} from "../src/lib/gemini";

/* ------------------------------------------------------------------ */
/*  CLI flags                                                         */
/* ------------------------------------------------------------------ */

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const ONLY = args.find((a) => a.startsWith("--only="))?.split("=")[1] ?? null;
const LIMIT = Number(
  args.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? "0"
);

/** Delay in ms between API calls to respect rate limits. */
const REQUEST_DELAY_MS = 2500;

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const prisma = new PrismaClient();

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function saveImage(
  buffer: Buffer,
  relativeDir: string,
  filename: string
): Promise<string> {
  const absoluteDir = path.join(process.cwd(), "public", relativeDir);
  await mkdir(absoluteDir, { recursive: true });
  const absolutePath = path.join(absoluteDir, filename);
  await writeFile(absolutePath, buffer);
  return `${relativeDir}/${filename}`;
}

interface GenerationResult {
  type: string;
  name: string;
  path: string | null;
  error?: string;
}

const results: GenerationResult[] = [];
let successCount = 0;
let failCount = 0;
let skipCount = 0;

/* ------------------------------------------------------------------ */
/*  Generation tasks                                                  */
/* ------------------------------------------------------------------ */

async function generateHeroBanners(): Promise<void> {
  console.log("\n========== HERO BANNERS ==========\n");

  for (let variation = 1; variation <= 2; variation++) {
    const prompt = buildHeroPrompt(variation);
    const filename = `hero-banner-${variation}.png`;
    const label = `Hero Banner #${variation}`;

    console.log(`[${variation}/2] ${label}`);

    if (DRY_RUN) {
      console.log(`  DRY RUN - would generate: ${filename}`);
      console.log(`  Prompt: ${prompt.slice(0, 120)}...`);
      skipCount++;
      results.push({ type: "hero", name: label, path: null });
      continue;
    }

    try {
      const buffer = await generateImage(prompt);

      if (buffer) {
        const savedPath = await saveImage(buffer, "/images/hero", filename);
        console.log(`  Saved: ${savedPath}`);
        successCount++;
        results.push({ type: "hero", name: label, path: savedPath });
      } else {
        console.log(
          `  WARNING: No image returned. The model may not support image generation.`
        );
        console.log(`  Would have generated: ${filename}`);
        console.log(`  Prompt: ${prompt.slice(0, 120)}...`);
        failCount++;
        results.push({
          type: "hero",
          name: label,
          path: null,
          error: "No image returned by model",
        });
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`  ERROR: ${msg}`);
      failCount++;
      results.push({ type: "hero", name: label, path: null, error: msg });
    }

    await sleep(REQUEST_DELAY_MS);
  }
}

async function generateCategoryImages(): Promise<void> {
  console.log("\n========== CATEGORY IMAGES ==========\n");

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  console.log(`Found ${categories.length} categories\n`);

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    const prompt = buildCategoryPrompt(cat.name);
    const filename = `${slugify(cat.name)}.png`;
    const label = cat.name;

    console.log(`[${i + 1}/${categories.length}] ${label}`);

    if (DRY_RUN) {
      console.log(`  DRY RUN - would generate: ${filename}`);
      console.log(`  Prompt: ${prompt.slice(0, 120)}...`);
      skipCount++;
      results.push({ type: "category", name: label, path: null });
      continue;
    }

    try {
      const buffer = await generateImage(prompt);

      if (buffer) {
        const savedPath = await saveImage(
          buffer,
          "/images/categories",
          filename
        );
        console.log(`  Saved: ${savedPath}`);
        successCount++;
        results.push({ type: "category", name: label, path: savedPath });
      } else {
        console.log(
          `  WARNING: No image returned. The model may not support image generation.`
        );
        console.log(`  Would have generated: ${filename}`);
        failCount++;
        results.push({
          type: "category",
          name: label,
          path: null,
          error: "No image returned by model",
        });
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`  ERROR: ${msg}`);
      failCount++;
      results.push({ type: "category", name: label, path: null, error: msg });
    }

    if (i < categories.length - 1) {
      await sleep(REQUEST_DELAY_MS);
    }
  }
}

async function generateProductImages(): Promise<void> {
  console.log("\n========== PRODUCT IMAGES ==========\n");

  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { name: "asc" },
  });

  const subset = LIMIT > 0 ? products.slice(0, LIMIT) : products;
  const total = subset.length;

  console.log(
    `Found ${products.length} products` +
      (LIMIT > 0 ? ` (limited to first ${LIMIT})` : "") +
      `\n`
  );

  for (let i = 0; i < total; i++) {
    const product = subset[i];
    const prompt = buildProductPrompt(product.name, product.category.name);
    const filename = `${slugify(product.name)}.png`;
    const label = product.name;

    console.log(`[${i + 1}/${total}] ${label}`);

    if (DRY_RUN) {
      console.log(`  DRY RUN - would generate: ${filename}`);
      console.log(`  Prompt: ${prompt.slice(0, 120)}...`);
      skipCount++;
      results.push({ type: "product", name: label, path: null });
      continue;
    }

    try {
      const buffer = await generateImage(prompt);

      if (buffer) {
        const savedPath = await saveImage(
          buffer,
          "/images/products",
          filename
        );
        console.log(`  Saved: ${savedPath}`);
        successCount++;
        results.push({ type: "product", name: label, path: savedPath });
      } else {
        console.log(
          `  WARNING: No image returned. The model may not support image generation.`
        );
        console.log(`  Would have generated: ${filename}`);
        failCount++;
        results.push({
          type: "product",
          name: label,
          path: null,
          error: "No image returned by model",
        });
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`  ERROR: ${msg}`);
      failCount++;
      results.push({ type: "product", name: label, path: null, error: msg });
    }

    if (i < total - 1) {
      await sleep(REQUEST_DELAY_MS);
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Main                                                              */
/* ------------------------------------------------------------------ */

async function main(): Promise<void> {
  console.log("=".repeat(50));
  console.log("  HANNA - Batch Image Generation");
  console.log("=".repeat(50));

  if (DRY_RUN) {
    console.log("\n  MODE: DRY RUN (no API calls will be made)\n");
  }

  if (!DRY_RUN && !process.env.GEMINI_API_KEY) {
    console.error(
      "\nERROR: GEMINI_API_KEY is not set. " +
        "Add it to .env.local or set it as an environment variable.\n"
    );
    process.exit(1);
  }

  if (ONLY) {
    console.log(`  FILTER: generating only "${ONLY}" images\n`);
  }

  if (LIMIT > 0) {
    console.log(`  LIMIT: generating at most ${LIMIT} product images\n`);
  }

  const shouldRun = (target: string) => !ONLY || ONLY === target;

  if (shouldRun("hero")) {
    await generateHeroBanners();
  }

  if (shouldRun("categories")) {
    await generateCategoryImages();
  }

  if (shouldRun("products")) {
    await generateProductImages();
  }

  // ---------- Summary ----------
  console.log("\n" + "=".repeat(50));
  console.log("  SUMMARY");
  console.log("=".repeat(50));

  if (DRY_RUN) {
    console.log(`\n  Dry run complete. ${skipCount} images would be generated.`);
  } else {
    console.log(`\n  Succeeded: ${successCount}`);
    console.log(`  Failed:    ${failCount}`);
  }

  console.log(`  Total:     ${results.length}\n`);

  if (failCount > 0) {
    console.log("  Failed items:");
    for (const r of results.filter((r) => r.error)) {
      console.log(`    - [${r.type}] ${r.name}: ${r.error}`);
    }
    console.log();
  }
}

main()
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
