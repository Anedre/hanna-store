"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck, Handshake, Zap, Lightbulb, Globe, Truck,
  PackageCheck, MousePointerClick, Plane, ArrowRight,
  Star, Users, Package, MapPin, Award, Heart, Target,
  CheckCircle, TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { avatarFromName } from "@/lib/avatars";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.4 },
  }),
};

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

const STATS = [
  { value: "10,000+", label: "Clientes Felices", icon: Users },
  { value: "5,000+", label: "Productos Importados", icon: Package },
  { value: "15+", label: "Paises de Origen", icon: Globe },
  { value: "99%", label: "Satisfaccion", icon: Star },
];

const VALUES = [
  { icon: ShieldCheck, title: "Calidad Garantizada", description: "Cada producto pasa por un riguroso control de calidad antes de llegar a tus manos.", color: "#00B4A0" },
  { icon: Handshake, title: "Confianza Total", description: "Transparencia en cada paso. Si no es original, no lo vendemos.", color: "#C8A040" },
  { icon: Zap, title: "Entrega Rapida", description: "Optimizamos logistica para que recibas tus productos en el menor tiempo posible.", color: "#6366f1" },
  { icon: Lightbulb, title: "Innovacion Constante", description: "Siempre buscando las ultimas tendencias y productos del mercado mundial.", color: "#ec4899" },
  { icon: Heart, title: "Pasion por el Cliente", description: "Cada decision que tomamos esta centrada en brindarte la mejor experiencia.", color: "#f97316" },
  { icon: Target, title: "Mejores Precios", description: "Importamos directo de fabrica para ofrecerte precios que no encontraras en otro lado.", color: "#10b981" },
];

const STEPS = [
  { number: "01", icon: MousePointerClick, title: "Elige tu Producto", description: "Navega nuestro catalogo con miles de productos importados de las mejores marcas." },
  { number: "02", icon: Plane, title: "Nosotros Importamos", description: "Nos encargamos de la importacion, aduanas, y logistica internacional completa." },
  { number: "03", icon: PackageCheck, title: "Recibe en Casa", description: "Entregamos tu pedido de manera segura directamente en la puerta de tu hogar." },
];

const TEAM = [
  { name: "Hanna CEO", role: "Fundadora & CEO", avatar: "Hanna CEO" },
  { name: "Director Comercial", role: "Dir. Comercial", avatar: "Director Comercial" },
  { name: "Jefa de Logistica", role: "Jefa de Logistica", avatar: "Jefa de Logistica" },
  { name: "Atencion al Cliente", role: "Customer Success", avatar: "Customer Lead" },
];

export default function NosotrosPage() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden min-h-[500px] flex items-center" style={{ background: "linear-gradient(135deg, #003b35 0%, #00B4A0 50%, #C8A040 100%)" }}>
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1600&h=900&fit=crop"
            alt="" fill className="object-cover opacity-15" sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-2xl">
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-xs font-bold text-white uppercase tracking-wider mb-5">
              Nuestra Historia
            </motion.span>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1]">
              Conectamos al Peru con <span className="text-gold-300">lo Mejor del Mundo</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="mt-5 text-lg text-white/70 leading-relaxed max-w-xl">
              Somos una importadora peruana que cree que todos merecen acceso a productos internacionales de calidad, sin pagar de mas y con total confianza.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-3">
              <Link href="/productos">
                <Button size="lg" className="bg-white text-hanna-700 hover:bg-cream-50 shadow-lg text-base px-8">
                  Ver Productos <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link href="/contacto">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-base">
                  Contactanos
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Stats row */}
          <motion.div initial="hidden" animate="visible" variants={stagger}
            className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((stat, i) => (
              <motion.div key={stat.label} variants={fadeIn} custom={i}
                className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 text-center">
                <stat.icon className="h-5 w-5 text-gold-300 mx-auto mb-2" />
                <p className="font-display font-extrabold text-2xl text-white">{stat.value}</p>
                <p className="text-xs text-white/60 mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== MISSION — asymmetric layout ===== */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-full h-full rounded-2xl bg-gradient-to-br from-hanna-100 to-gold-100 -z-10" />
                <div className="rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=500&fit=crop"
                    alt="Equipo HANNA" width={600} height={500} className="w-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-5 shadow-xl border border-cream-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-hanna-500 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-display font-extrabold text-2xl text-cream-900">3 anos</p>
                      <p className="text-xs text-cream-500">Creciendo contigo</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="inline-block px-3 py-1 rounded-full bg-hanna-50 text-hanna-600 text-xs font-bold uppercase tracking-wider mb-4">
                Nuestra Mision
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-cream-900 leading-tight">
                Hacemos que los mejores productos del mundo esten al <span className="text-gradient">alcance de todos</span>
              </h2>
              <p className="mt-5 text-cream-600 leading-relaxed">
                Trabajamos directamente con proveedores verificados de mas de 15 paises para traer productos autenticos a precios justos. Sin intermediarios, sin sorpresas.
              </p>
              <div className="mt-6 space-y-3">
                {["Importacion directa de fabrica", "Control de calidad en cada producto", "Garantia de autenticidad 100%", "Envio seguro a todo el Peru"].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-hanna-500 shrink-0" />
                    <span className="text-sm text-cream-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== VALUES — modern grid ===== */}
      <section className="py-16 sm:py-20 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-gold-100 text-gold-700 text-xs font-bold uppercase tracking-wider mb-4">
              Nuestros Valores
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-cream-900">
              Lo que nos hace diferentes
            </h2>
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VALUES.map((v, i) => (
              <motion.div key={v.title} variants={fadeIn} custom={i}
                className="bg-white rounded-2xl p-6 border border-cream-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors"
                  style={{ backgroundColor: v.color + "15" }}>
                  <v.icon className="h-6 w-6" style={{ color: v.color }} />
                </div>
                <h3 className="font-display font-bold text-lg text-cream-900 group-hover:text-hanna-600 transition-colors">
                  {v.title}
                </h3>
                <p className="text-sm text-cream-600 mt-2 leading-relaxed">{v.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== HOW IT WORKS — timeline ===== */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-hanna-50 text-hanna-600 text-xs font-bold uppercase tracking-wider mb-4">
              Proceso
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-cream-900">
              Como <span className="text-gradient">Funciona</span>
            </h2>
            <p className="mt-3 text-cream-500">En solo 3 pasos tendras tus productos en casa</p>
          </div>

          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-0.5 bg-cream-200 z-0" />

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
              className="grid md:grid-cols-3 gap-8 relative z-10">
              {STEPS.map((step, i) => (
                <motion.div key={step.number} variants={fadeIn} custom={i} className="text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-28 h-28 rounded-full flex items-center justify-center mx-auto shadow-xl"
                      style={{ background: "linear-gradient(135deg, #00B4A0, #009E8C)" }}>
                      <step.icon className="h-12 w-12 text-white" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-10 h-10 bg-gold-500 text-white font-display font-extrabold text-sm rounded-full flex items-center justify-center shadow-lg">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-cream-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-cream-600 leading-relaxed max-w-xs mx-auto">{step.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== TEAM ===== */}
      <section className="py-16 sm:py-20 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-hanna-50 text-hanna-600 text-xs font-bold uppercase tracking-wider mb-4">
              Nuestro Equipo
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-cream-900">
              Las personas detras de <span className="text-gradient">Hanna</span>
            </h2>
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member, i) => (
              <motion.div key={member.name} variants={fadeIn} custom={i}
                className="text-center group">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <img src={avatarFromName(member.avatar, "big-smile")} alt={member.name}
                    className="w-full h-full rounded-full ring-4 ring-white shadow-lg group-hover:ring-hanna-200 transition-all" />
                </div>
                <h3 className="font-display font-semibold text-cream-900">{member.name}</h3>
                <p className="text-xs text-cream-500 mt-0.5">{member.role}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== BRANDS WE WORK WITH ===== */}
      <section className="py-14 sm:py-16 bg-white border-y border-cream-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-block px-3 py-1 rounded-full bg-gold-100 text-gold-700 text-xs font-bold uppercase tracking-wider mb-3">
              Marcas Originales
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-cream-900">
              Trabajamos con las <span className="text-gradient">mejores marcas</span>
            </h3>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-4 sm:gap-5 items-center">
            {[
              { name: "Samsung", file: "samsung", cat: "Tecnologia" },
              { name: "Nike", file: "nike", cat: "Deportes" },
              { name: "JBL", file: "jbl", cat: "Audio" },
              { name: "Xiaomi", file: "xiaomi", cat: "Tech" },
              { name: "Sony", file: "sony", cat: "Tecnologia" },
              { name: "Adidas", file: "adidas", cat: "Deportes" },
              { name: "Apple", file: "apple", cat: "Tech" },
              { name: "LG", file: "lg", cat: "Hogar" },
              { name: "Puma", file: "puma", cat: "Deportes" },
            ].map((brand) => (
              <div key={brand.name} className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-cream-50 border border-cream-100 hover:border-hanna-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group" title={brand.name}>
                <img
                  src={`/images/brands/${brand.file}.svg`}
                  alt={brand.name}
                  className="h-7 sm:h-9 w-auto object-contain opacity-30 group-hover:opacity-80 transition-all duration-300"
                />
                <span className="text-[9px] text-cream-400 mt-2 font-bold uppercase tracking-wider group-hover:text-cream-600 transition-colors">
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-16 sm:py-20" style={{ background: "linear-gradient(135deg, #003b35, #00B4A0)" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Award className="h-10 w-10 text-gold-300 mx-auto mb-4" />
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
            Empieza a comprar productos <span className="text-gold-300">originales</span> hoy
          </h2>
          <p className="mt-4 text-white/70 text-lg max-w-lg mx-auto">
            Unete a mas de 10,000 clientes satisfechos que confian en HANNA para sus compras internacionales.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/productos">
              <Button size="lg" className="bg-white text-hanna-700 hover:bg-cream-50 shadow-lg text-base px-8">
                Explorar Tienda <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <Link href="/contacto">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-base">
                Contactanos
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
