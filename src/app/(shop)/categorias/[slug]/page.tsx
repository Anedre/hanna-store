import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, PackageX } from "lucide-react";
import { getProductsByCategory, getCategoryBySlug } from "@/actions/products";
import { CategoryProductGrid } from "@/components/products/CategoryProductGrid";

interface CategoriaPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CategoriaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getCategoryBySlug(slug);
  const name = result.success && result.data
    ? result.data.name
    : slug.charAt(0).toUpperCase() + slug.slice(1);

  return {
    title: name,
    description: `Explora los mejores productos de ${name} importados con calidad garantizada.`,
  };
}

export default async function CategoriaPage({ params }: CategoriaPageProps) {
  const { slug } = await params;

  // Fetch category info and products in parallel
  const [categoryResult, productsResult] = await Promise.all([
    getCategoryBySlug(slug),
    getProductsByCategory(slug),
  ]);

  // Category not found
  if (!categoryResult.success || !categoryResult.data) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="flex items-center gap-1.5 text-sm text-cream-500 mb-8">
          <Link href="/" className="hover:text-hanna-600 transition-colors">
            Inicio
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            href="/productos"
            className="hover:text-hanna-600 transition-colors"
          >
            Categorias
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-cream-900 font-medium">No encontrada</span>
        </nav>

        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-cream-200 flex items-center justify-center mx-auto mb-4">
            <PackageX className="h-8 w-8 text-cream-500" />
          </div>
          <h1 className="font-display text-3xl font-bold text-cream-900 mb-2">
            Categoria no encontrada
          </h1>
          <p className="text-cream-600 mb-6">
            La categoria que buscas no existe o ha sido eliminada.
          </p>
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 bg-hanna-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-hanna-600 transition-colors"
          >
            Ver todos los productos
          </Link>
        </div>
      </section>
    );
  }

  const category = categoryResult.data;
  const products = productsResult.success && productsResult.data
    ? productsResult.data
    : [];
  const productCount = products.length;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-cream-500 mb-8">
        <Link href="/" className="hover:text-hanna-600 transition-colors">
          Inicio
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href="/productos"
          className="hover:text-hanna-600 transition-colors"
        >
          Categorias
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-cream-900 font-medium">{category.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-cream-900">
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-2 text-cream-600">{category.description}</p>
        )}
        {!category.description && (
          <p className="mt-2 text-cream-600">
            Explora los mejores productos de {category.name.toLowerCase()}{" "}
            importados con calidad garantizada
          </p>
        )}
        <p className="mt-1 text-sm text-cream-500">
          {productCount} {productCount === 1 ? "producto" : "productos"}
        </p>
      </div>

      {/* Product grid */}
      <CategoryProductGrid products={products} />
    </section>
  );
}
