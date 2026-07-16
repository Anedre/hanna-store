"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from "./CountdownTimer";
import { EASE } from "@/components/motion";

export interface HeroSlide {
  title: string;
  subtitle?: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  /** Solo para campañas con countdown */
  endsAt?: string;
  showCountdown?: boolean;
  discountPercent?: number;
}

/**
 * Hero de portada alimentado por campañas activas (admin) con fallback a un
 * slide de marca. Full-bleed, fotografía protagonista, crossfade suave.
 */
export function CampaignHero({ slides }: { slides: HeroSlide[] }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const slide = slides[index % slides.length];

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6500);
    return () => clearInterval(id);
  }, [slides.length]);

  if (!slide) return null;

  return (
    <section className="relative h-[68vh] min-h-[440px] max-h-[720px] overflow-hidden bg-cream-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={reduced ? false : { opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduced ? undefined : { opacity: 0 }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <Image
            src={slide.imageUrl}
            alt={slide.title}
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover"
          />
          {/* Velo para legibilidad del texto */}
          <div className="absolute inset-0 bg-gradient-to-r from-cream-950/70 via-cream-950/35 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center">
        <motion.div
          key={`copy-${index}`}
          className="max-w-xl text-white"
          initial={reduced ? false : { opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
        >
          {slide.discountPercent ? (
            <span className="inline-block bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase mb-4">
              Hasta −{slide.discountPercent}%
            </span>
          ) : null}

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] text-balance">
            {slide.title}
          </h1>

          {slide.subtitle && (
            <p className="mt-4 text-base sm:text-lg text-white/85 max-w-md leading-relaxed">
              {slide.subtitle}
            </p>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Link href={slide.ctaLink}>
              <Button size="lg" className="shadow-xl">
                {slide.ctaText}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            {slide.showCountdown && slide.endsAt && (
              <div className="flex items-center gap-2 text-sm text-white/85">
                <span>Termina en</span>
                <CountdownTimer endsAt={slide.endsAt} compact className="text-white font-semibold" />
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                i === index % slides.length ? "w-7 bg-white" : "w-3 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
