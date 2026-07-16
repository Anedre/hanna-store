import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Whitelist explícita: las imágenes propias viven en /public (no requieren
    // remotePatterns); Unsplash/Picsum se usan para demo hasta tener fotos reales.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      // Placeholder de productos sin imagen (ProductCard / checkout)
      { protocol: "https", hostname: "placehold.co" },
      // Fotos de producto (S3)
      { protocol: "https", hostname: "hanna-store-images-djqmal6209nu2.s3.amazonaws.com" },
    ],
  },
};

export default nextConfig;
