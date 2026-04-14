import sharp from "sharp";
import path from "path";
import fs from "fs";

async function main() {
  const inputPath = path.join(process.cwd(), "public", "logo.jpeg");
  const outputPath = path.join(process.cwd(), "public", "logo.png");

  if (!fs.existsSync(inputPath)) {
    console.error("Logo not found at:", inputPath);
    process.exit(1);
  }

  console.log("Processing logo...");

  // Read the image
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  console.log(`Original: ${metadata.width}x${metadata.height}`);

  // Get raw pixel data
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Remove the cream/light background
  // The background color is approximately #F5F0EB (245, 240, 235)
  // We'll make any pixel that's close to white/cream transparent
  const threshold = 30; // How close to the background color to remove
  const bgR = 245, bgG = 240, bgB = 235;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Calculate distance from background color
    const dist = Math.sqrt(
      Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2)
    );

    if (dist < threshold) {
      // Make transparent
      data[i + 3] = 0;
    } else if (dist < threshold + 15) {
      // Soft edge - partial transparency
      const alpha = Math.round(((dist - threshold) / 15) * 255);
      data[i + 3] = Math.min(data[i + 3], alpha);
    }
  }

  // Save as PNG with transparency
  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .trim() // Auto-crop transparent edges
    .resize(500, null, { withoutEnlargement: false }) // Make it bigger
    .png({ quality: 95 })
    .toFile(outputPath);

  const outputStats = fs.statSync(outputPath);
  const outputMeta = await sharp(outputPath).metadata();
  console.log(`Output: ${outputMeta.width}x${outputMeta.height} (${Math.round(outputStats.size / 1024)}KB)`);
  console.log(`Saved to: ${outputPath}`);
  console.log("Done! Logo background removed and saved as PNG.");
}

main().catch(console.error);
