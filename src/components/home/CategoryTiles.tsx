import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion";
import type { Category } from "@/types";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=900&q=75",
  "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=900&q=75",
  "https://images.unsplash.com/photo-1616627561950-9f746e330187?w=900&q=75",
  "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=900&q=75",
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=75",
  "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=900&q=75",
];

export function CategoryTiles({ categories }: { categories: (Category & { _count?: { products: number } })[] }) {
  const visible = categories.filter((c) => (c._count?.products ?? 0) > 0).slice(0, 6);
  if (visible.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <FadeIn>
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold text-hanna-600 uppercase tracking-[0.18em] mb-2">
              Explora
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-cream-900 text-balance">
              Compra por categoría
            </h2>
          </div>
          <Link
            href="/productos"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-hanna-600 hover:underline shrink-0"
          >
            Ver todo <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </FadeIn>

      <StaggerGroup className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((cat, i) => (
          <StaggerItem key={cat.id} className={i === 0 ? "col-span-2 lg:col-span-1 lg:row-span-2" : ""}>
            <Link
              href={`/categorias/${cat.slug}`}
              className={`group relative block overflow-hidden rounded-2xl bg-cream-100 ${
                i === 0 ? "aspect-[16/10] lg:aspect-[3/4] lg:h-full" : "aspect-[16/10]"
              }`}
            >
              <Image
                src={cat.image || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]}
                alt={cat.name}
                fill
                sizes="(max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cream-950/65 via-transparent to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 flex items-end justify-between">
                <div>
                  <h3 className="font-display font-semibold text-white text-lg leading-tight">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-white/75 mt-0.5">
                    {cat._count?.products ?? 0} productos
                  </p>
                </div>
                <span className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <ArrowUpRight className="h-4 w-4 text-white" />
                </span>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
