import Image from "next/image";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";

const POINTS = [
  "Cada producto pasa por nuestras manos antes de publicarse",
  "Stock en Lima: entregamos en días, no en meses",
  "Si algo sale mal, respondemos nosotros — no un marketplace",
];

/** Bloque editorial: la promesa de la marca, con fotografía protagonista. */
export function SplitFeature() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <FadeIn className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-cream-100">
          <Image
            src="https://images.unsplash.com/photo-1618004912476-29818d81ae2e?w=1200&q=75"
            alt="Setup de escritorio curado"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="text-xs font-semibold text-hanna-600 uppercase tracking-[0.18em] mb-3">
            Por qué Hanna
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-cream-900 leading-tight text-balance">
            No vendemos productos. Curamos tu espacio.
          </h2>
          <p className="mt-4 text-cream-600 leading-relaxed max-w-lg">
            Internet está lleno de opciones baratas que llegan tarde y decepcionan.
            Nosotros elegimos poco, lo probamos, y te lo entregamos rápido — para
            que tu escritorio se vea como lo imaginaste.
          </p>

          <ul className="mt-6 space-y-3">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-hanna-50 text-hanna-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-3 w-3" />
                </span>
                <span className="text-sm text-cream-700 leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <Link href="/nosotros">
              <Button variant="outline">
                Conócenos <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
