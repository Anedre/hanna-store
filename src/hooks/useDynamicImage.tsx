"use client";

import { useState, useEffect, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface UseDynamicImageOptions {
  /** Search keyword for the image */
  query: string;
  /** Desired width (default: 800) */
  width?: number;
  /** Desired height (default: 600) */
  height?: number;
  /** Image provider */
  provider?: "unsplash" | "picsum" | "placeholder";
  /** Fallback color while loading (CSS color) */
  placeholderColor?: string;
  /** Whether to load immediately (default: true) */
  enabled?: boolean;
}

interface UseDynamicImageReturn {
  /** The resolved image URL (or placeholder gradient while loading) */
  src: string;
  /** Whether the image is still loading */
  isLoading: boolean;
  /** Whether the image loaded successfully */
  isLoaded: boolean;
  /** Any error that occurred */
  error: string | null;
  /** Manually refetch a new image */
  refetch: () => void;
  /** CSS background style ready to use */
  backgroundStyle: React.CSSProperties;
  /** Blur data URL for next/image placeholder */
  blurDataURL: string;
}

// ---------------------------------------------------------------------------
// Tiny SVG blur placeholder generator
// ---------------------------------------------------------------------------
function generateBlurPlaceholder(color1: string, color2: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="30">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}"/>
      <stop offset="100%" stop-color="${color2}"/>
    </linearGradient></defs>
    <rect width="40" height="30" fill="url(#g)"/>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// ---------------------------------------------------------------------------
// Image URL builders per provider
// ---------------------------------------------------------------------------
function buildImageUrl(
  query: string,
  width: number,
  height: number,
  provider: "unsplash" | "picsum" | "placeholder",
  seed?: number
): string {
  const q = encodeURIComponent(query.toLowerCase().replace(/\s+/g, ","));
  const s = seed ?? Math.floor(Math.random() * 1000);

  switch (provider) {
    case "unsplash":
      // Unsplash Source API (free, no key needed, keyword-based)
      return `https://source.unsplash.com/${width}x${height}/?${q}&sig=${s}`;

    case "picsum":
      // Lorem Picsum (free, random high-quality photos)
      return `https://picsum.photos/seed/${q}-${s}/${width}/${height}`;

    case "placeholder":
    default:
      // Local gradient-based placeholder
      return "";
  }
}

// ---------------------------------------------------------------------------
// Preload image utility
// ---------------------------------------------------------------------------
function preloadImage(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!src) {
      reject(new Error("No source URL"));
      return;
    }
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => reject(new Error(`Failed to load: ${src}`));
    img.src = src;
  });
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useDynamicImage(
  options: UseDynamicImageOptions
): UseDynamicImageReturn {
  const {
    query,
    width = 800,
    height = 600,
    provider = "picsum",
    placeholderColor = "#00B4A0",
    enabled = true,
  } = options;

  const [src, setSrc] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seed, setSeed] = useState(
    () => Math.floor(Math.random() * 1000)
  );

  const blurDataURL = generateBlurPlaceholder(placeholderColor, "#C8A040");

  const gradientFallback = `linear-gradient(135deg, ${placeholderColor} 0%, #C8A040 100%)`;

  const fetchImage = useCallback(async () => {
    if (!enabled || !query) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsLoaded(false);

    try {
      const url = buildImageUrl(query, width, height, provider, seed);
      if (!url) throw new Error("No URL for provider");

      const loadedSrc = await preloadImage(url);
      setSrc(loadedSrc);
      setIsLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setSrc("");
    } finally {
      setIsLoading(false);
    }
  }, [query, width, height, provider, seed, enabled]);

  useEffect(() => {
    fetchImage();
  }, [fetchImage]);

  const refetch = useCallback(() => {
    setSeed(Math.floor(Math.random() * 10000));
  }, []);

  const backgroundStyle: React.CSSProperties = isLoaded && src
    ? { backgroundImage: `url(${src})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: gradientFallback };

  return {
    src: isLoaded && src ? src : "",
    isLoading,
    isLoaded,
    error,
    refetch,
    backgroundStyle,
    blurDataURL,
  };
}

// ---------------------------------------------------------------------------
// Companion component: <StockImage />
// ---------------------------------------------------------------------------
export function StockImage({
  query,
  width = 800,
  height = 600,
  alt,
  className,
  provider = "picsum",
}: {
  query: string;
  width?: number;
  height?: number;
  alt?: string;
  className?: string;
  provider?: "unsplash" | "picsum" | "placeholder";
}) {
  const { src, isLoading, backgroundStyle, blurDataURL } = useDynamicImage({
    query,
    width,
    height,
    provider,
  });

  if (isLoading || !src) {
    return (
      <div
        className={"animate-pulse rounded-xl " + (className || "")}
        style={{
          ...backgroundStyle,
          width: width,
          height: height,
          maxWidth: "100%",
        }}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt || query}
      width={width}
      height={height}
      className={"rounded-xl object-cover " + (className || "")}
      loading="lazy"
      style={{ maxWidth: "100%" }}
    />
  );
}
