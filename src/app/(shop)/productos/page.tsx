import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getCategories } from "@/actions/products";
import { CATEGORY_THEMES } from "@/lib/category-themes";
import { AllProductsClient } from "@/components/products/AllProductsClient";

export const metadata: Metadata = {
  title: "Productos",
  description:
    "Explora nuestro catalogo completo de productos internacionales importados. Tecnologia, moda, hogar y mas.",
};

interface ProductosPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function ProductosPage({ searchParams }: ProductosPageProps) {
  const params = await searchParams;
  const catResult = await getCategories();
  const categories = catResult.success ? catResult.data || [] : [];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-10 sm:py-14" style={{ background: "linear-gradient(135deg, #003b35 0%, #00B4A0 60%, #C8A040 100%)" }}>
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/4" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-white/60 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-white/90">Todos los Productos</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
            Todos los Productos
          </h1>
          <p className="text-white/70 text-sm mt-2 max-w-lg">
            Explora nuestro catalogo completo de productos importados. Filtra por categoria, marca y precio.
          </p>
        </div>
      </section>

      {/* Category quick nav */}
      <section className="bg-white border-b border-cream-200 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-none pb-1">
            {CATEGORY_THEMES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categorias/${cat.slug}`}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-cream-50 border border-cream-200 hover:border-hanna-300 hover:bg-hanna-50 transition-all shrink-0 group"
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-sm font-medium text-cream-700 group-hover:text-hanna-600 transition-colors whitespace-nowrap">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Main content: sidebar + grid */}
      <AllProductsClient initialParams={params} categories={categories as any[]} />
    </div>
  );
}
