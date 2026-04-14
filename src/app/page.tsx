"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ChevronRight,
  Clock,
  Flame,
  ShieldCheck,
  Truck,
  Award,
  BadgePercent,
  Headphones,
  Star,
  Zap,
  Send,
  Quote,
  Check,
  MapPin,
  Timer,
  Package,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { avatarFromName } from "@/lib/avatars";
import { formatPrice, calcDiscount } from "@/lib/format";
import { useCartStore } from "@/stores/cart-store";
import { CATEGORIES, SHIPPING } from "@/lib/constants";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import type { Product } from "@/types";

/* ===== Animation variants ===== */
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

/* ===== Promo Countdown Hook ===== */
function useCountdown(hours: number) {
  const [time, setTime] = useState({ h: hours, m: 0, s: 0 });
  useEffect(() => {
    const end = Date.now() + hours * 3600000;
    const tick = () => {
      const diff = Math.max(0, end - Date.now());
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [hours]);
  return time;
}

/* ===== Testimonials ===== */
const TESTIMONIALS = [
  { name: "Maria Gutierrez", city: "Lima", rating: 5, comment: "Excelente servicio. Mis productos llegaron en perfecto estado y mucho antes de lo esperado. Totalmente recomendado." },
  { name: "Carlos Mendoza", city: "Arequipa", rating: 5, comment: "La calidad de los productos es increible. He pedido varias veces y siempre quedo satisfecho con la atencion al cliente." },
  { name: "Ana Rodriguez", city: "Trujillo", rating: 4, comment: "Muy buena experiencia de compra. Los precios son competitivos y el envio fue rapido. Volvere a comprar sin duda." },
];

/* ===== Category icon map ===== */
const CAT_ICONS: Record<string, React.ElementType> = {
  Cpu: require("lucide-react").Cpu,
  Home: require("lucide-react").House,
  Shirt: require("lucide-react").Shirt,
  Dumbbell: require("lucide-react").Dumbbell,
  Sparkles: require("lucide-react").Sparkles,
  Gamepad2: require("lucide-react").Gamepad2,
};

/* ===== Mini ProductCard for homepage ===== */
function HomeProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const images = typeof product.images === "string"
    ? JSON.parse(product.images)
    : product.images || [];
  const img = images[0] || "/images/products/placeholder.png";
  const discount = product.compareAtPrice
    ? calcDiscount(product.price, product.compareAtPrice)
    : 0;

  return (
    <Link href={`/productos/${product.slug}`} className="group block">
      <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-cream-300/50 hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-square bg-cream-100 overflow-hidden">
          <Image
            src={img}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, 25vw"
          />
          {discount > 0 && (
            <span className="absolute top-3 left-3 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-lg">
              -{discount}%
            </span>
          )}
          {product.featured && (
            <span className="absolute top-3 right-3 px-2 py-0.5 bg-gold-500 text-white text-xs font-bold rounded-lg flex items-center gap-1">
              <Flame className="h-3 w-3" /> Hot
            </span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              addItem({
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                image: img,
                quantity: 1,
                maxStock: product.stock,
              });
            }}
            className="absolute bottom-3 right-3 bg-hanna-500 text-white p-2.5 rounded-xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:bg-hanna-600 cursor-pointer"
          >
            <Package className="h-4 w-4" />
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-[11px] font-semibold text-hanna-500 uppercase tracking-wider mb-1">
            {product.category?.name}
          </p>
          <h3 className="font-display font-semibold text-sm text-cream-900 line-clamp-2 leading-snug group-hover:text-hanna-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 mt-2">
            <StarRating rating={product.averageRating || 0} size="sm" />
            <span className="text-[11px] text-cream-400">({product.reviewCount || 0})</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-display font-bold text-lg text-cream-900">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-cream-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ==================================================================
   HOME PAGE
   ================================================================== */
export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const countdown = useCountdown(12);

  const [nlEmail, setNlEmail] = useState("");
  const [nlStatus, setNlStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [nlLoading, setNlLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [featRes, allRes] = await Promise.all([
          fetch("/api/products/featured"),
          fetch("/api/products?perPage=8&sortBy=createdAt"),
        ]);
        const feat = await featRes.json();
        const all = await allRes.json();
        if (feat.success) setProducts(feat.data || []);
        if (all.success) setNewArrivals(all.data?.products || []);
      } catch { /* silent */ }
      setLoading(false);
    }
    load();
  }, []);

  async function handleNl(e: FormEvent) {
    e.preventDefault();
    setNlLoading(true);
    setNlStatus(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: nlEmail }),
      });
      const json = await res.json();
      if (json.success) {
        setNlStatus({ type: "success", message: "Te has suscrito correctamente!" });
        setNlEmail("");
      } else {
        setNlStatus({ type: "error", message: json.error || "Error al suscribirte" });
      }
    } catch {
      setNlStatus({ type: "error", message: "Error de conexion" });
    }
    setNlLoading(false);
  }

  return (
    <>
      <Navbar />

      {/* ===== ANNOUNCEMENT BAR ===== */}
      <div className="bg-cream-900 text-white py-2 overflow-hidden">
        <div className="flex animate-[scroll_25s_linear_infinite] whitespace-nowrap gap-12 px-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-12 shrink-0">
              <span className="flex items-center gap-2 text-xs font-medium">
                <Truck className="h-3.5 w-3.5 text-hanna-400" />
                Envio GRATIS en pedidos +S/150
              </span>
              <span className="flex items-center gap-2 text-xs font-medium">
                <ShieldCheck className="h-3.5 w-3.5 text-hanna-400" />
                Productos 100% Originales
              </span>
              <span className="flex items-center gap-2 text-xs font-medium">
                <Zap className="h-3.5 w-3.5 text-gold-400" />
                Nuevos productos cada semana
              </span>
              <span className="flex items-center gap-2 text-xs font-medium">
                <Headphones className="h-3.5 w-3.5 text-hanna-400" />
                Atencion al cliente 24/7
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== HERO CAROUSEL ===== */}
      <HeroCarousel />

      {/* ===== CATEGORY SHOWCASE (with personality) ===== */}
      <CategoryShowcase />

      {/* ===== FLASH DEAL BANNER ===== */}
      <section className="bg-cream-900 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-500 text-white px-3 py-1.5 rounded-lg font-display font-bold text-sm flex items-center gap-1.5">
              <Zap className="h-4 w-4" /> OFERTAS FLASH
            </div>
            <p className="text-cream-300 text-sm hidden sm:block">
              Descuentos de hasta <span className="text-gold-400 font-bold">50% OFF</span> en productos seleccionados
            </p>
          </div>
          <div className="flex items-center gap-2 text-white">
            <Clock className="h-4 w-4 text-gold-400" />
            <span className="text-sm font-medium">Termina en:</span>
            <div className="flex gap-1.5">
              {[
                { val: countdown.h, label: "h" },
                { val: countdown.m, label: "m" },
                { val: countdown.s, label: "s" },
              ].map((t) => (
                <span key={t.label} className="bg-white/10 px-2 py-1 rounded-lg text-sm font-mono font-bold">
                  {String(t.val).padStart(2, "0")}{t.label}
                </span>
              ))}
            </div>
          </div>
          <Link href="/productos?sortBy=price_asc" className="text-hanna-400 text-sm font-medium hover:text-hanna-300 transition-colors flex items-center gap-1">
            Ver ofertas <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS GRID ===== */}
      <section className="py-12 sm:py-16 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-cream-900 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-hanna-500" />
                Productos Destacados
              </h2>
              <p className="text-cream-500 text-sm mt-1">Lo mas vendido esta semana</p>
            </div>
            <Link href="/productos" className="text-hanna-600 text-sm font-semibold hover:text-hanna-700 flex items-center gap-1 transition-colors">
              Ver todo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-cream-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-cream-200 rounded w-1/3" />
                    <div className="h-4 bg-cream-200 rounded w-3/4" />
                    <div className="h-5 bg-cream-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
            >
              {products.slice(0, 8).map((p, i) => (
                <motion.div key={p.id} variants={fadeInUp} custom={i}>
                  <HomeProductCard product={p} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ===== TRUST STRIP ===== */}
      <section className="bg-cream-900 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            {[
              { icon: Truck, title: "Envio a Todo el Peru", desc: "Rapido y seguro" },
              { icon: ShieldCheck, title: "Pago 100% Seguro", desc: "Yape, Plin, Tarjeta" },
              { icon: Award, title: "100% Originales", desc: "Garantia de autenticidad" },
              { icon: BadgePercent, title: "Mejores Precios", desc: "Directo de fabrica" },
            ].map((b) => (
              <div key={b.title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <b.icon className="h-5 w-5 text-hanna-400" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-xs sm:text-sm text-white">{b.title}</h3>
                  <p className="text-[11px] text-cream-400">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== NEW ARRIVALS ===== */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-cream-900 flex items-center gap-2">
                <Zap className="h-6 w-6 text-gold-500" />
                Nuevos Ingresos
              </h2>
              <p className="text-cream-500 text-sm mt-1">Recien llegados de importacion</p>
            </div>
            <Link href="/productos?sortBy=createdAt" className="text-hanna-600 text-sm font-semibold hover:text-hanna-700 flex items-center gap-1 transition-colors">
              Ver todo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {newArrivals.slice(0, 8).map((p, i) => (
              <motion.div key={p.id} variants={fadeInUp} custom={i}>
                <HomeProductCard product={p} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-14 sm:py-20 bg-cream-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10 items-center">
            {/* Left: heading + stats */}
            <div className="lg:col-span-2">
              <span className="inline-block px-3 py-1 rounded-full bg-gold-100 text-gold-700 text-xs font-bold uppercase tracking-wider mb-4">
                Testimonios
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-cream-900 leading-tight">
                Lo que dicen nuestros clientes
              </h2>
              <div className="flex items-center gap-2 mt-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-gold-400 text-gold-400" />
                  ))}
                </div>
                <span className="text-sm font-semibold text-cream-900">4.9</span>
                <span className="text-sm text-cream-500">de 5 estrellas</span>
              </div>
              <p className="mt-3 text-cream-600 text-sm leading-relaxed">
                Miles de clientes en todo el Peru confian en nosotros para sus compras internacionales.
              </p>
              <div className="flex items-center gap-3 mt-6">
                <div className="flex -space-x-3">
                  {["Maria Gutierrez", "Carlos Mendoza", "Ana Rodriguez", "Jorge Castillo", "Lucia Fernandez"].map((n) => (
                    <img key={n} src={avatarFromName(n)} alt="" className="w-9 h-9 rounded-full border-2 border-white" />
                  ))}
                </div>
                <span className="text-sm font-semibold text-cream-700">+10,000 clientes</span>
              </div>
            </div>

            {/* Right: testimonial cards */}
            <div className="lg:col-span-3 grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className={i === 2 ? "sm:col-span-2 lg:col-span-2" : ""}
                >
                  <div className="bg-white rounded-2xl p-5 border border-cream-200 h-full hover:shadow-lg hover:border-hanna-200 transition-all duration-300">
                    <StarRating rating={t.rating} size="sm" />
                    <p className="mt-3 text-sm text-cream-700 leading-relaxed">
                      &ldquo;{t.comment}&rdquo;
                    </p>
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-cream-100">
                      <img
                        src={avatarFromName(t.name)}
                        alt={t.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-display font-semibold text-sm text-cream-900">{t.name}</p>
                        <p className="text-xs text-cream-400 flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {t.city}
                          <Check className="h-3 w-3 text-hanna-500 ml-1" /> Verificada
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <section className="relative py-16 sm:py-20 overflow-hidden" style={{ background: "linear-gradient(135deg, #003b35 0%, #00B4A0 50%, #C8A040 100%)" }}>
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-white/5 translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 sm:p-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/20 mb-6">
              <Send className="h-4 w-4 text-gold-300" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Newsletter</span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
              No te pierdas ninguna<br />
              <span className="text-gold-300">oferta exclusiva</span>
            </h2>

            <p className="mt-3 text-white/70 text-sm sm:text-base max-w-md mx-auto">
              Suscribete y recibe descuentos de hasta 50%, nuevos productos y promociones directamente en tu correo.
            </p>

            <form onSubmit={handleNl} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Tu correo electronico"
                required
                value={nlEmail}
                onChange={(e) => setNlEmail(e.target.value)}
                className="flex-1 px-5 py-3.5 rounded-xl bg-white text-cream-900 placeholder:text-cream-400 border-0 focus:outline-none focus:ring-2 focus:ring-gold-400 text-sm shadow-lg"
              />
              <button
                type="submit"
                disabled={nlLoading}
                className="px-8 py-3.5 bg-gold-500 text-white font-display font-bold rounded-xl hover:bg-gold-600 transition-colors shadow-lg shadow-gold-900/30 cursor-pointer disabled:opacity-60 text-sm whitespace-nowrap"
              >
                {nlLoading ? "Enviando..." : "Suscribirme"}
              </button>
            </form>

            {nlStatus && (
              <p className={`mt-4 text-sm ${nlStatus.type === "success" ? "text-green-300" : "text-red-300"}`}>
                {nlStatus.message}
              </p>
            )}

            <p className="mt-4 text-[11px] text-white/40">
              Sin spam. Puedes darte de baja en cualquier momento.
            </p>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
      <CartDrawer />

      {/* Scrolling announcement animation */}
      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </>
  );
}
