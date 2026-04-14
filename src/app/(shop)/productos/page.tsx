import type { Metadata } from "next";
import { ProductCatalog } from "@/components/products/ProductCatalog";

export const metadata: Metadata = {
  title: "Productos",
  description:
    "Explora nuestro catalogo completo de productos internacionales importados. Tecnologia, moda, hogar y mas.",
};

interface ProductosPageProps {
  searchParams: Promise<{
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
    sortBy?: string;
    page?: string;
  }>;
}

export default async function ProductosPage({ searchParams }: ProductosPageProps) {
  const params = await searchParams;
  return <ProductCatalog initialParams={params} />;
}
