"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, Flame, Zap, Star, Truck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { avatarFromName } from "@/lib/avatars";

interface Slide {
  id: number;
  badge: string;
  title: string;
  highlight: string;
  subtitle: string;
  cta: string;
  ctaHref: string;
  ctaSecondary?: string;
  ctaSecondaryHref?: string;
  image: string;
  bgColor: string;
  overlayColor: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    badge: "Oferta de Temporada",
    title: "Los Mejores Productos",
    highlight: "del Mundo, a tu Puerta",
    subtitle: "Importamos directamente de fabrica. Tecnologia, moda, hogar y mas con los mejores precios del Peru.",
    cta: "Explorar Tienda",
    ctaHref: "/productos",
    ctaSecondary: "Nuevos Ingresos",
    ctaSecondaryHref: "/productos?sortBy=createdAt",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=900&fit=crop",
    bgColor: "#0a2f2a",
    overlayColor: "rgba(0, 180, 160, 0.4)",
  },
  {
    id: 2,
    badge: "Tecnologia",
    title: "Gadgets que Cambian",
    highlight: "tu Vida",
    subtitle: "Audifonos, smartwatches, cargadores y accesorios tech de las mejores marcas internacionales.",
    cta: "Ver Tecnologia",
    ctaHref: "/categorias/tecnologia",
    image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1600&h=900&fit=crop",
    bgColor: "#0f0f2e",
    overlayColor: "rgba(99, 102, 241, 0.35)",
  },
  {
    id: 3,
    badge: "Belleza Coreana",
    title: "Skincare & Belleza",
    highlight: "Premium",
    subtitle: "Rutina de cuidado facial coreana. Serums, mascarillas y sets completos importados de Seul.",
    cta: "Ver Belleza",
    ctaHref: "/categorias/belleza",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600&h=900&fit=crop",
    bgColor: "#2a0a20",
    overlayColor: "rgba(236, 72, 153, 0.3)",
  },
  {
    id: 4,
    badge: "Hasta 50% OFF",
    title: "Ofertas que No Puedes",
    highlight: "Perder",
    subtitle: "Descuentos exclusivos en cientos de productos. Envio gratis en compras mayores a S/150.",
    cta: "Ver Ofertas",
    ctaHref: "/productos?sortBy=price_asc",
    ctaSecondary: "Ver Todo",
    ctaSecondaryHref: "/productos",
    image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1600&h=900&fit=crop",
    bgColor: "#2a0a0a",
    overlayColor: "rgba(239, 68, 68, 0.3)",
  },
];

const AUTOPLAY_MS = 5000;

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent((p) => (p + 1) % SLIDES.length), []);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused, next]);

  const slide = SLIDES[current];

  return (
    <section
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slide */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="relative min-h-[500px] sm:min-h-[550px] lg:min-h-[600px]"
          style={{ backgroundColor: slide.bgColor }}
        >
          {/* Background image */}
          <div className="absolute inset-0">
            <Image
              src={slide.image}
              alt=""
              fill
              className="object-cover"
              priority={current === 0}
              sizes="100vw"
            />
            {/* Color overlay */}
            <div className="absolute inset-0" style={{ background: slide.overlayColor }} />
            {/* Dark gradient for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center py-16 sm:py-20 lg:py-24">
            <div className="max-w-2xl">
              <motion.span
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white bg-white/20 backdrop-blur-sm border border-white/20 mb-5"
              >
                <Flame className="h-3.5 w-3.5 text-gold-400" />
                {slide.badge}
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-[1.1] tracking-tight"
              >
                {slide.title}{" "}
                <span className="text-hanna-400">{slide.highlight}</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="mt-5 text-base sm:text-lg text-white/75 leading-relaxed max-w-xl"
              >
                {slide.subtitle}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.4 }}
                className="mt-7 flex flex-wrap gap-3"
              >
                <Link href={slide.ctaHref}>
                  <Button size="lg" className="bg-hanna-500 hover:bg-hanna-600 text-white shadow-lg shadow-hanna-900/30 text-base px-8">
                    {slide.cta} <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </Link>
                {slide.ctaSecondary && slide.ctaSecondaryHref && (
                  <Link href={slide.ctaSecondaryHref}>
                    <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-base">
                      {slide.ctaSecondary}
                    </Button>
                  </Link>
                )}
              </motion.div>

              {/* Trust badges inline */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55, duration: 0.4 }}
                className="mt-6 flex flex-wrap items-center gap-4 sm:gap-5"
              >
                {[
                  { icon: Truck, text: "Envio a todo Peru" },
                  { icon: Zap, text: "100% Originales" },
                  { icon: Star, text: "4.9 calificacion" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-1.5">
                    <item.icon className="h-3.5 w-3.5 text-hanna-400" />
                    <span className="text-[11px] sm:text-xs text-white/60 font-medium">{item.text}</span>
                  </div>
                ))}
              </motion.div>

              {/* Social proof (first slide) */}
              {current === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8 flex items-center gap-4"
                >
                  <div className="flex -space-x-2">
                    {["Maria Gutierrez", "Carlos Mendoza", "Ana Rodriguez"].map((n) => (
                      <img key={n} src={avatarFromName(n)} alt="" className="w-8 h-8 rounded-full border-2 border-white/50" />
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />)}
                    </div>
                    <span className="text-xs text-white/60">+10,000 clientes satisfechos</span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Trust badges removed from right side — now inline below CTAs */}
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-colors cursor-pointer"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-colors cursor-pointer"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              i === current
                ? "w-8 h-2.5 bg-hanna-400"
                : "w-2.5 h-2.5 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>

      {/* Progress bar */}
      {!paused && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-20">
          <motion.div
            key={current}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: AUTOPLAY_MS / 1000, ease: "linear" }}
            className="h-full bg-hanna-400"
          />
        </div>
      )}
    </section>
  );
}
