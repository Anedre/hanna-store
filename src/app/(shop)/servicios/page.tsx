"use client";

import { Check, Star, Zap, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const PRICING_TIERS = [
  {
    name: "Basico",
    icon: Star,
    price: 0,
    description: "Ideal para clientes que buscan productos individuales",
    features: [
      "Acceso al catalogo completo",
      "Envio estandar a nivel nacional",
      "Soporte por WhatsApp",
      "Seguimiento de pedido",
      "Garantia de productos originales",
    ],
    cta: "Comenzar Gratis",
    variant: "outline" as const,
    highlighted: false,
  },
  {
    name: "Premium",
    icon: Zap,
    price: 49.90,
    period: "mes",
    description: "Para compradores frecuentes que quieren beneficios extra",
    features: [
      "Todo lo del plan Basico",
      "Envio express gratuito",
      "Descuentos exclusivos del 10%",
      "Acceso anticipado a nuevos productos",
      "Soporte prioritario 24/7",
      "Devoluciones gratuitas",
      "Acumulacion de puntos",
    ],
    cta: "Elegir Premium",
    variant: "primary" as const,
    highlighted: true,
  },
  {
    name: "Empresarial",
    icon: Building2,
    price: 199.90,
    period: "mes",
    description: "Soluciones de importacion para empresas y negocios",
    features: [
      "Todo lo del plan Premium",
      "Importaciones a pedido personalizado",
      "Descuentos mayoristas del 20%",
      "Asesor de importacion dedicado",
      "Facturacion electronica",
      "Credito empresarial",
      "Envios internacionales directos",
      "Reportes mensuales",
    ],
    cta: "Contactar Ventas",
    variant: "secondary" as const,
    highlighted: false,
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5 },
  }),
};

export default function ServiciosPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-hero py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-4xl sm:text-5xl font-bold text-white"
          >
            Nuestros <span className="text-gold-300">Servicios</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-hanna-100 max-w-2xl mx-auto"
          >
            Elige el plan que mejor se adapte a tus necesidades de importacion
          </motion.p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 sm:py-20 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch"
          >
            {PRICING_TIERS.map((tier, i) => {
              const Icon = tier.icon;
              return (
                <motion.div
                  key={tier.name}
                  variants={fadeInUp}
                  custom={i}
                  className={tier.highlighted ? "md:-mt-4 md:mb-0" : ""}
                >
                  <Card
                    className={`relative h-full flex flex-col p-8 ${
                      tier.highlighted
                        ? "border-2 border-hanna-500 shadow-xl ring-1 ring-hanna-500/20"
                        : ""
                    }`}
                  >
                    {tier.highlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge variant="gold" size="md">
                          Mas Popular
                        </Badge>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <div
                        className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                          tier.highlighted
                            ? "bg-hanna-100"
                            : "bg-cream-100"
                        }`}
                      >
                        <Icon
                          className={`h-7 w-7 ${
                            tier.highlighted
                              ? "text-hanna-600"
                              : "text-cream-600"
                          }`}
                        />
                      </div>

                      <h3 className="font-display font-bold text-xl text-cream-900">
                        {tier.name}
                      </h3>
                      <p className="text-sm text-cream-500 mt-1">
                        {tier.description}
                      </p>

                      <div className="mt-4">
                        {tier.price === 0 ? (
                          <span className="font-display text-4xl font-bold text-cream-900">
                            Gratis
                          </span>
                        ) : (
                          <div>
                            <span className="font-display text-4xl font-bold text-cream-900">
                              S/ {tier.price.toFixed(2)}
                            </span>
                            <span className="text-cream-500 text-sm">
                              /{tier.period}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 flex-1 mb-8">
                      {tier.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2.5 text-sm text-cream-700"
                        >
                          <Check className="h-4 w-4 text-hanna-500 shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Link href="/contacto">
                      <Button
                        variant={tier.variant}
                        size="lg"
                        className="w-full"
                      >
                        {tier.cta}
                      </Button>
                    </Link>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Note */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-cream-500 mt-10"
          >
            Todos los precios estan en Soles Peruanos (PEN) e incluyen IGV.
            Puedes cancelar en cualquier momento.
          </motion.p>
        </div>
      </section>
    </>
  );
}
