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

      {/* ===== HERO SECTION (Product-forward like references) ===== */}
      <section className="relative bg-gradient-to-br from-cream-100 via-white to-hanna-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Offer */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <Badge variant="gold" size="md" className="mb-4">
                <Flame className="h-3.5 w-3.5 mr-1" /> Oferta de Temporada
              </Badge>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-cream-900 leading-[1.1] tracking-tight">
                Los Mejores Productos<br />
                <span className="text-gradient">del Mundo</span>, a tu Puerta
              </h1>
              <p className="mt-5 text-cream-600 text-lg leading-relaxed max-w-lg">
                Importamos directamente de fabrica. Tecnologia, moda, hogar y mas
                con garantia de autenticidad y los mejores precios del Peru.
              </p>

              {/* CTA */}
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/productos">
                  <Button size="lg" className="shadow-lg shadow-hanna-200">
                    Explorar Tienda <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
                <Link href="/productos?sortBy=createdAt">
                  <Button size="lg" variant="outline">
                    Nuevos Ingresos
                  </Button>
                </Link>
              </div>

              {/* Trust row */}
              <div className="mt-8 flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {["Maria Gutierrez", "Carlos Mendoza", "Ana Rodriguez"].map((n) => (
                      <img
                        key={n}
                        src={avatarFromName(n)}
                        alt=""
                        className="w-8 h-8 rounded-full border-2 border-white"
                      />
                    ))}
                  </div>
                  <div className="text-xs">
                    <div className="flex items-center gap-0.5 text-gold-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                    <span className="text-cream-500">+10,000 clientes felices</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Featured product highlight */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-3xl p-6 shadow-2xl shadow-cream-300/60 border border-cream-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full flex items-center gap-1">
                    <Timer className="h-3 w-3" />
                    Oferta termina en {String(countdown.h).padStart(2, "0")}:{String(countdown.m).padStart(2, "0")}:{String(countdown.s).padStart(2, "0")}
                  </span>
                  <Badge variant="success" size="md">Envio Gratis</Badge>
                </div>
                {products[0] ? (
                  <Link href={`/productos/${products[0].slug}`} className="block group">
                    <div className="relative aspect-[4/3] bg-cream-50 rounded-2xl overflow-hidden mb-4">
                      <Image
                        src={
                          (typeof products[0].images === "string"
                            ? JSON.parse(products[0].images)
                            : products[0].images)?.[0] || "/images/products/placeholder.png"
                        }
                        alt={products[0].name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <h2 className="font-display font-bold text-xl text-cream-900 group-hover:text-hanna-600 transition-colors">
                      {products[0].name}
                    </h2>
                    <p className="text-sm text-cream-500 mt-1 line-clamp-1">{products[0].shortDescription}</p>
                    <div className="flex items-baseline gap-3 mt-3">
                      <span className="font-display font-extrabold text-2xl text-hanna-600">
                        {formatPrice(products[0].price)}
                      </span>
                      {products[0].compareAtPrice && (
                        <span className="text-sm text-cream-400 line-through">
                          {formatPrice(products[0].compareAtPrice)}
                        </span>
                      )}
                      {products[0].compareAtPrice && (
                        <span className="text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded-md">
                          Ahorra {formatPrice(products[0].compareAtPrice - products[0].price)}
                        </span>
                      )}
                    </div>
                  </Link>
                ) : (
                  <div className="aspect-[4/3] bg-cream-100 rounded-2xl animate-pulse" />
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES BAR ===== */}
      <section className="bg-white border-y border-cream-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto gap-3 scrollbar-none pb-1">
            {CATEGORIES.map((cat) => {
              const Icon = CAT_ICONS[cat.icon];
              return (
                <Link
                  key={cat.slug}
                  href={`/categorias/${cat.slug}`}
                  className="flex flex-col items-center gap-2 min-w-[80px] group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-cream-50 border border-cream-200 flex items-center justify-center group-hover:bg-hanna-50 group-hover:border-hanna-200 transition-all duration-200">
                    {Icon && <Icon className="h-6 w-6 text-cream-500 group-hover:text-hanna-500 transition-colors" />}
                  </div>
                  <span className="text-xs font-medium text-cream-600 group-hover:text-hanna-600 transition-colors whitespace-nowrap">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

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

      {/* ===== TRUST BADGES ===== */}
      <section className="bg-white py-10 border-y border-cream-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: "Envio a Todo el Peru", desc: "Rapido y seguro a tu puerta" },
              { icon: ShieldCheck, title: "Pago 100% Seguro", desc: "Yape, Plin, Transferencia, Tarjeta" },
              { icon: Award, title: "Productos Originales", desc: "Garantia de autenticidad" },
              { icon: BadgePercent, title: "Mejores Precios", desc: "Directo de fabrica, sin intermediarios" },
            ].map((b) => (
              <div key={b.title} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-hanna-50 flex items-center justify-center shrink-0">
                  <b.icon className="h-6 w-6 text-hanna-600" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-sm text-cream-900">{b.title}</h3>
                  <p className="text-xs text-cream-500">{b.desc}</p>
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
      <section className="py-12 sm:py-16 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-cream-900">
              +10,000 Clientes Satisfechos
            </h2>
            <div className="flex items-center justify-center gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-gold-400 text-gold-400" />
              ))}
              <span className="text-sm text-cream-500 ml-2">4.9 de 5 estrellas</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <Card className="p-5 h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={avatarFromName(t.name)}
                      alt={t.name}
                      className="w-11 h-11 rounded-full ring-2 ring-hanna-100"
                    />
                    <div>
                      <p className="font-display font-semibold text-sm text-cream-900">{t.name}</p>
                      <div className="flex items-center gap-1 text-xs text-cream-400">
                        <MapPin className="h-3 w-3" /> {t.city}
                        <span className="mx-1">·</span>
                        <Check className="h-3 w-3 text-hanna-500" /> Compra verificada
                      </div>
                    </div>
                  </div>
                  <StarRating rating={t.rating} size="sm" />
                  <p className="mt-3 text-sm text-cream-600 leading-relaxed flex-1">
                    &ldquo;{t.comment}&rdquo;
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <section className="bg-gradient-hero py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Send className="h-8 w-8 text-white/80 mx-auto mb-4" />
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Ofertas Exclusivas en tu Correo
          </h2>
          <p className="mt-2 text-hanna-100 text-sm">
            Suscribete y recibe descuentos de hasta 50% antes que nadie
          </p>
          <form onSubmit={handleNl} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Tu correo electronico"
              required
              value={nlEmail}
              onChange={(e) => setNlEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-white/15 text-white placeholder:text-white/50 border border-white/25 focus:outline-none focus:border-white focus:bg-white/25 transition-all backdrop-blur-sm text-sm"
            />
            <button
              type="submit"
              disabled={nlLoading}
              className="px-6 py-3 bg-white text-hanna-600 font-display font-bold rounded-xl hover:bg-cream-50 transition-colors shadow-lg cursor-pointer disabled:opacity-60 text-sm"
            >
              {nlLoading ? "Enviando..." : "Suscribirme"}
            </button>
          </form>
          {nlStatus && (
            <p className={`mt-3 text-sm ${nlStatus.type === "success" ? "text-green-200" : "text-red-200"}`}>
              {nlStatus.message}
            </p>
          )}
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
