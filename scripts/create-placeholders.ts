/**
 * Creates beautiful brand-colored placeholder images for the HANNA store
 * using sharp. No API key needed - generates gradient SVGs rendered to PNG.
 */
import sharp from "sharp";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

const BRAND = {
  teal: "#00B4A0",
  tealDark: "#009E8C",
  tealLight: "#4DDCCA",
  gold: "#C8A040",
  goldLight: "#EDC45A",
  cream: "#F5F0EB",
  dark: "#1A3B35",
};

function heroSVG(variation: number): string {
  const gradients = [
    { c1: BRAND.tealDark, c2: BRAND.teal, c3: BRAND.gold },
    { c1: BRAND.dark, c2: BRAND.tealDark, c3: BRAND.goldLight },
  ];
  const g = gradients[variation % 2];
  return `<svg width="1920" height="600" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${g.c1}"/>
        <stop offset="50%" stop-color="${g.c2}"/>
        <stop offset="100%" stop-color="${g.c3}"/>
      </linearGradient>
      <radialGradient id="glow1" cx="20%" cy="30%">
        <stop offset="0%" stop-color="white" stop-opacity="0.12"/>
        <stop offset="100%" stop-color="white" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="glow2" cx="80%" cy="70%">
        <stop offset="0%" stop-color="${BRAND.gold}" stop-opacity="0.15"/>
        <stop offset="100%" stop-color="${BRAND.gold}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1920" height="600" fill="url(#bg)"/>
    <rect width="1920" height="600" fill="url(#glow1)"/>
    <rect width="1920" height="600" fill="url(#glow2)"/>
    <circle cx="300" cy="150" r="200" fill="white" opacity="0.04"/>
    <circle cx="1600" cy="450" r="300" fill="${BRAND.gold}" opacity="0.06"/>
    <circle cx="960" cy="300" r="150" fill="white" opacity="0.03"/>
  </svg>`;
}

function categorySVG(name: string, icon: string): string {
  return `<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cbg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${BRAND.teal}" stop-opacity="0.1"/>
        <stop offset="100%" stop-color="${BRAND.gold}" stop-opacity="0.1"/>
      </linearGradient>
      <radialGradient id="cglow" cx="50%" cy="40%">
        <stop offset="0%" stop-color="${BRAND.teal}" stop-opacity="0.15"/>
        <stop offset="100%" stop-color="transparent"/>
      </radialGradient>
    </defs>
    <rect width="800" height="800" fill="${BRAND.cream}"/>
    <rect width="800" height="800" fill="url(#cbg)"/>
    <rect width="800" height="800" fill="url(#cglow)"/>
    <circle cx="400" cy="350" r="150" fill="${BRAND.teal}" opacity="0.08"/>
    <text x="400" y="380" font-family="Arial, sans-serif" font-size="120" fill="${BRAND.teal}" text-anchor="middle" opacity="0.6">${icon}</text>
    <text x="400" y="520" font-family="Arial, sans-serif" font-size="40" font-weight="bold" fill="${BRAND.dark}" text-anchor="middle" opacity="0.7">${name}</text>
  </svg>`;
}

function productSVG(name: string, color: string): string {
  return `<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pbg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${BRAND.cream}"/>
        <stop offset="100%" stop-color="white"/>
      </linearGradient>
      <radialGradient id="pshadow" cx="50%" cy="60%">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.12"/>
        <stop offset="100%" stop-color="transparent"/>
      </radialGradient>
    </defs>
    <rect width="800" height="800" fill="url(#pbg)"/>
    <rect width="800" height="800" fill="url(#pshadow)"/>
    <rect x="200" y="200" width="400" height="400" rx="30" fill="${color}" opacity="0.1"/>
    <rect x="220" y="220" width="360" height="360" rx="25" fill="white" opacity="0.6"/>
    <text x="400" y="420" font-family="Arial, sans-serif" font-size="24" fill="${BRAND.dark}" text-anchor="middle" opacity="0.5" textLength="320" lengthAdjust="spacingAndGlyphs">${name.length > 25 ? name.slice(0, 25) + "..." : name}</text>
  </svg>`;
}

async function svgToPng(svg: string, outputPath: string, width?: number) {
  const buffer = Buffer.from(svg);
  let pipeline = sharp(buffer);
  if (width) pipeline = pipeline.resize(width);
  await pipeline.png({ quality: 90 }).toFile(outputPath);
}

async function main() {
  console.log("=".repeat(50));
  console.log("  HANNA - Placeholder Image Generator");
  console.log("=".repeat(50));

  // Create directories
  const dirs = ["public/images/hero", "public/images/categories", "public/images/products"];
  for (const d of dirs) {
    await mkdir(path.join(process.cwd(), d), { recursive: true });
  }

  // Hero banners
  console.log("\n========== HERO BANNERS ==========\n");
  for (let i = 0; i < 2; i++) {
    const file = path.join(process.cwd(), `public/images/hero/hero-banner-${i + 1}.png`);
    await svgToPng(heroSVG(i), file, 1920);
    console.log(`  [${i + 1}/2] Generated hero-banner-${i + 1}.png`);
  }

  // Categories
  console.log("\n========== CATEGORY IMAGES ==========\n");
  const categoryIcons: Record<string, string> = {
    tecnologia: "💻",
    hogar: "🏠",
    moda: "👗",
    deportes: "⚽",
    belleza: "✨",
    juguetes: "🎮",
  };
  const categories = await prisma.category.findMany();
  for (const cat of categories) {
    const icon = categoryIcons[cat.slug] || "📦";
    const file = path.join(process.cwd(), `public/images/categories/${cat.slug}.png`);
    await svgToPng(categorySVG(cat.name, icon), file, 800);
    console.log(`  Generated ${cat.slug}.png`);
  }

  // Products
  console.log("\n========== PRODUCT IMAGES ==========\n");
  const products = await prisma.product.findMany({
    include: { category: true },
  });

  const categoryColors: Record<string, string> = {
    tecnologia: BRAND.teal,
    hogar: BRAND.gold,
    moda: "#E88BB3",
    deportes: "#5B8DEF",
    belleza: "#D4A5FF",
    juguetes: "#FF9F43",
  };

  let count = 0;
  for (const prod of products) {
    const color = categoryColors[prod.category?.slug || ""] || BRAND.teal;
    const slug = prod.slug;
    const file = path.join(process.cwd(), `public/images/products/${slug}.png`);
    await svgToPng(productSVG(prod.name, color), file, 800);
    count++;
    if (count % 5 === 0) console.log(`  Generated ${count}/${products.length} product images...`);
  }
  console.log(`  Generated all ${count} product images.`);

  // Update product records to use local images
  console.log("\n========== UPDATING DATABASE ==========\n");
  for (const prod of products) {
    const localImage = `/images/products/${prod.slug}.png`;
    await prisma.product.update({
      where: { id: prod.id },
      data: { images: JSON.stringify([localImage]) },
    });
  }
  console.log(`  Updated ${products.length} products with local image paths.`);

  // Update categories
  for (const cat of categories) {
    await prisma.category.update({
      where: { id: cat.id },
      data: { image: `/images/categories/${cat.slug}.png` },
    });
  }
  console.log(`  Updated ${categories.length} categories with local image paths.`);

  console.log("\n" + "=".repeat(50));
  console.log("  DONE! All placeholder images created.");
  console.log("  When Gemini API is ready, run:");
  console.log("    npx tsx scripts/generate-images.ts");
  console.log("=".repeat(50));

  await prisma.$disconnect();
}

main().catch(console.error);
