"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { CATEGORY_THEMES } from "@/lib/category-themes";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

export function CategoryShowcase() {
  const cats = CATEGORY_THEMES;

  return (
    <section className="py-14 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-cream-900">
            Explora por Categoria
          </h2>
          <p className="text-cream-500 text-sm mt-2">
            Productos curados para cada estilo de vida
          </p>
        </motion.div>

        {/* Bento Grid: 2 grandes arriba, 4 medianos abajo */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {cats.map((cat, i) => {
            // First 2 are large (span 2 cols on lg), rest are normal
            const isLarge = i < 2;

            return (
              <motion.div
                key={cat.slug}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-30px" }}
                variants={fadeIn}
                className={isLarge ? "lg:col-span-2" : ""}
              >
                <Link href={`/categorias/${cat.slug}`} className="group block">
                  <div
                    className={`relative overflow-hidden rounded-2xl ${
                      isLarge ? "aspect-[2/1] sm:aspect-[2.2/1]" : "aspect-[1/1] sm:aspect-[4/3]"
                    }`}
                  >
                    {/* Image */}
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes={isLarge ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 1024px) 50vw, 25vw"}
                    />

                    {/* Overlay */}
                    <div
                      className="absolute inset-0 transition-opacity duration-300"
                      style={{
                        background: `linear-gradient(to top, ${cat.accentColor}dd 0%, ${cat.accentColor}66 40%, transparent 100%)`,
                      }}
                    />
                    <div className="absolute inset-0 bg-black/15 group-hover:bg-black/5 transition-colors duration-300" />

                    {/* Content - anchored to bottom */}
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
                      <span
                        className="inline-block px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold text-white uppercase tracking-wider mb-2"
                        style={{ backgroundColor: cat.accentColor }}
                      >
                        {cat.name}
                      </span>

                      <h3 className={`font-display font-extrabold text-white leading-tight ${
                        isLarge ? "text-xl sm:text-2xl lg:text-3xl" : "text-base sm:text-lg"
                      }`}>
                        {cat.tagline}
                      </h3>

                      {isLarge && (
                        <p className="text-white/70 text-xs sm:text-sm mt-1.5 max-w-sm line-clamp-2">
                          {cat.description}
                        </p>
                      )}

                      <div className="flex items-center gap-1.5 mt-2 sm:mt-3 text-white/80 text-xs sm:text-sm font-semibold group-hover:text-white group-hover:gap-2.5 transition-all">
                        Explorar
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
