/**
 * Downloads brand logos as SVGs/PNGs to public/images/brands/
 * Uses simple-icons CDN which is reliable and free
 * Run: npx tsx scripts/download-brand-logos.ts
 */
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const BRANDS = [
  { name: "samsung", url: "https://cdn.simpleicons.org/samsung/1428A0" },
  { name: "nike", url: "https://cdn.simpleicons.org/nike/111111" },
  { name: "jbl", url: "https://cdn.simpleicons.org/jbl/FF6600" },
  { name: "xiaomi", url: "https://cdn.simpleicons.org/xiaomi/FF6900" },
  { name: "lego", url: "https://cdn.simpleicons.org/lego/D01012" },
  { name: "sony", url: "https://cdn.simpleicons.org/sony/000000" },
  { name: "adidas", url: "https://cdn.simpleicons.org/adidas/000000" },
  { name: "apple", url: "https://cdn.simpleicons.org/apple/000000" },
  { name: "lg", url: "https://cdn.simpleicons.org/lg/A50034" },
  { name: "puma", url: "https://cdn.simpleicons.org/puma/000000" },
];

async function main() {
  const dir = path.join(process.cwd(), "public", "images", "brands");
  await mkdir(dir, { recursive: true });

  console.log("Downloading brand logos...\n");

  for (const brand of BRANDS) {
    try {
      const res = await fetch(brand.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const svg = await res.text();
      const filePath = path.join(dir, `${brand.name}.svg`);
      await writeFile(filePath, svg);
      console.log(`  ✓ ${brand.name}.svg`);
    } catch (err) {
      console.log(`  ✗ ${brand.name} failed: ${err}`);
    }
  }

  console.log("\nDone!");
}

main();
