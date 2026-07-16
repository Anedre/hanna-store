import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { CountdownTimer } from "./CountdownTimer";
import type { Campaign } from "@/types";

/**
 * Franja de oferta activa. Solo se renderiza si hay una campaña EN VIVO con
 * descuento — nada de countdowns falsos.
 */
export function OffersStrip({ campaign }: { campaign: Campaign | null }) {
  if (!campaign || campaign.discountPercent <= 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-2xl bg-cream-950 text-white px-5 sm:px-8 py-6 flex flex-wrap items-center gap-x-8 gap-y-4">
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-hanna-500/20 blur-3xl" aria-hidden />
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-10 h-10 rounded-xl bg-hanna-500/20 text-hanna-300 flex items-center justify-center shrink-0">
            <Flame className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="font-display font-semibold leading-tight truncate">{campaign.name}</p>
            <p className="text-sm text-white/70">
              Hasta <strong className="text-hanna-300">−{campaign.discountPercent}%</strong>
              {campaign.appliesTo === "ALL" ? " en toda la tienda" : " en productos seleccionados"}
            </p>
          </div>
        </div>

        {campaign.showCountdown && (
          <div className="flex items-center gap-2 text-sm text-white/80">
            <span>Termina en</span>
            <CountdownTimer endsAt={campaign.endsAt} compact className="text-white font-semibold" />
          </div>
        )}

        <Link
          href="/ofertas"
          className="ml-auto inline-flex items-center gap-1.5 bg-white text-cream-950 font-semibold text-sm rounded-xl px-4 py-2.5 hover:bg-cream-100 transition-colors"
        >
          Ver ofertas <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
