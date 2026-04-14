import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getProductsByCategory } from "@/actions/products";
import { ProductDetail } from "@/components/products/ProductDetail";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProductoDetallePageProps {
  params: Promise<{ slug: string }>;
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: ProductoDetallePageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProductBySlug(slug);

  if (!result.success || !result.data) {
    return {
      title: "Producto no encontrado",
      description: "El producto que buscas no existe.",
    };
  }

  const product = result.data;
  const image = product.images[0] || undefined;

  return {
    title: product.name,
    description:
      product.shortDescription || product.description?.slice(0, 160) || "",
    openGraph: {
      title: product.name,
      description: product.shortDescription || "",
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

// ---------------------------------------------------------------------------
// Page (Server Component)
// ---------------------------------------------------------------------------

export default async function ProductoDetallePage({
  params,
}: ProductoDetallePageProps) {
  const { slug } = await params;

  // Fetch product
  const result = await getProductBySlug(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const product = result.data;

  // Fetch related products from the same category (exclude current product)
  let relatedProducts: typeof product[] = [];
  if (product.category) {
    const relatedResult = await getProductsByCategory(
      product.category.slug,
      5
    );
    if (relatedResult.success && relatedResult.data) {
      relatedProducts = (relatedResult.data as typeof product[]).filter(
        (p) => p.id !== product.id
      ).slice(0, 4);
    }
  }

  return (
    <ProductDetail product={product} relatedProducts={relatedProducts} />
  );
}
