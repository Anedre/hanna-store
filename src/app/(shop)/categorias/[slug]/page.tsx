import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, PackageX } from "lucide-react";
import { getProducts, getCategoryBySlug } from "@/actions/products";
import { getCategoryFilters } from "@/lib/category-filters";
import { CATEGORY_THEMES } from "@/lib/category-themes";
import { CategorySidebar } from "@/components/products/CategorySidebar";
import { SubcategoryNav } from "@/components/products/SubcategoryNav";
import { FilteredProductGrid } from "@/components/products/FilteredProductGrid";

interface CategoriaPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: CategoriaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getCategoryBySlug(slug);
  const name =
    result.success && result.data
      ? result.data.name
      : slug.charAt(0).toUpperCase() + slug.slice(1);

  return {
    title: name,
    description: `Explora los mejores productos de ${name} importados con calidad garantizada.`,
  };
}

export default async function CategoriaPage({
  params,
  searchParams: searchParamsPromise,
}: CategoriaPageProps) {
  const { slug } = await params;
  const searchParams = await searchParamsPromise;

  // Get current sub from URL
  const subcategorySlug =
    typeof searchParams.sub === "string" ? searchParams.sub : undefined;

  // Fetch category info
  const categoryResult = await getCategoryBySlug(slug);

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

  // Get theme and filter config
  const theme = CATEGORY_THEMES.find((t) => t.slug === slug);
  const filterConfig = getCategoryFilters(slug);

  // Fetch initial products (server-side, no filters applied beyond subcategory)
  const initialResult = await getProducts({
    categorySlug: slug,
    subcategorySlug,
    perPage: 12,
    page: 1,
  });

  const initialProducts =
    initialResult.success && initialResult.data
      ? initialResult.data.products
      : [];
  const initialTotal =
    initialResult.success && initialResult.data
      ? initialResult.data.total
      : 0;
  const initialTotalPages =
    initialResult.success && initialResult.data
      ? initialResult.data.totalPages
      : 0;

  return (
    <section>
      {/* Hero Banner */}
      {theme && (
        <div
          className={`relative bg-gradient-to-r ${theme.gradient} overflow-hidden`}
        >
          <div className="absolute inset-0 opacity-20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={theme.image}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <nav className="flex items-center gap-1.5 text-sm text-white/60 mb-4">
              <Link
                href="/"
                className="hover:text-white/90 transition-colors"
              >
                Inicio
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link
                href="/productos"
                className="hover:text-white/90 transition-colors"
              >
                Categorias
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-white font-medium">{category.name}</span>
            </nav>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">
              {theme.tagline}
            </h1>
            <p className="text-white/80 max-w-xl text-sm sm:text-base">
              {theme.description}
            </p>
          </div>
        </div>
      )}

      {/* Breadcrumb fallback (no theme) */}
      {!theme && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <nav className="flex items-center gap-1.5 text-sm text-cream-500 mb-6">
            <Link
              href="/"
              className="hover:text-hanna-600 transition-colors"
            >
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
            <span className="text-cream-900 font-medium">
              {category.name}
            </span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-cream-900 mb-2">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-cream-600">{category.description}</p>
          )}
        </div>
      )}

      {/* Subcategory Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {filterConfig && filterConfig.subcategories.length > 0 && (
          <SubcategoryNav
            subcategories={filterConfig.subcategories}
            activeSlug={subcategorySlug}
          />
        )}
      </div>

      {/* Main Content: Sidebar + Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex gap-8">
          {/* Sidebar */}
          <CategorySidebar
            categorySlug={slug}
            subcategorySlug={subcategorySlug}
          />

          {/* Product Grid */}
          <FilteredProductGrid
            categorySlug={slug}
            initialProducts={initialProducts}
            initialTotal={initialTotal}
            initialTotalPages={initialTotalPages}
          />
        </div>
      </div>
    </section>
  );
}
