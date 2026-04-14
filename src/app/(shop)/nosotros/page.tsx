"use client";

import {
  ShieldCheck,
  Handshake,
  Zap,
  Lightbulb,
  MousePointerClick,
  Plane,
  PackageCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Calidad",
    description:
      "Seleccionamos cada producto cuidadosamente para garantizar los mas altos estandares de calidad internacional.",
  },
  {
    icon: Handshake,
    title: "Confianza",
    description:
      "Construimos relaciones duraderas con nuestros clientes basadas en la transparencia y el cumplimiento.",
  },
  {
    icon: Zap,
    title: "Rapidez",
    description:
      "Optimizamos nuestros procesos de importacion para que recibas tus productos en el menor tiempo posible.",
  },
  {
    icon: Lightbulb,
    title: "Innovacion",
    description:
      "Buscamos constantemente las ultimas tendencias y productos innovadores del mercado mundial.",
  },
];

const STEPS = [
  {
    number: "01",
    icon: MousePointerClick,
    title: "Elige tu producto",
    description:
      "Navega por nuestro catalogo y selecciona los productos internacionales que te interesen.",
  },
  {
    number: "02",
    icon: Plane,
    title: "Nosotros importamos",
    description:
      "Nos encargamos de todo el proceso de importacion, aduanas y logistica internacional.",
  },
  {
    number: "03",
    icon: PackageCheck,
    title: "Recibe en tu puerta",
    description:
      "Entregamos tu pedido de manera segura directamente en la puerta de tu hogar.",
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5 },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function NosotrosPage() {
  return (
    <>
      {/* Hero Banner */}
      <section className="bg-gradient-hero py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-4xl sm:text-5xl font-bold text-white"
          >
            Sobre <span className="text-gold-300">Hanna</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-hanna-100 max-w-2xl mx-auto"
          >
            Conectamos al Peru con los mejores productos del mundo
          </motion.p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-cream-900 mb-6">
              Nuestra <span className="text-gradient">Mision</span>
            </h2>
            <p className="text-cream-600 text-lg leading-relaxed">
              Somos una importadora de productos internacionales dedicada a
              ofrecer lo mejor del mercado global a familias peruanas. Trabajamos
              directamente con proveedores verificados alrededor del mundo para
              traerte productos de calidad a precios accesibles, con la garantia
              y confianza que mereces.
            </p>
            <p className="text-cream-600 text-lg leading-relaxed mt-4">
              Desde tecnologia de ultima generacion hasta articulos para el
              hogar, moda y mas, nuestra mision es hacer que los mejores
              productos del mundo esten al alcance de todos en el Peru.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 sm:py-20 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-cream-900">
              Nuestros <span className="text-gradient">Valores</span>
            </h2>
            <p className="mt-3 text-cream-600">
              Los pilares que guian cada decision que tomamos
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {VALUES.map((value, i) => {
              const Icon = value.icon;
              return (
                <motion.div key={value.title} variants={fadeInUp} custom={i}>
                  <Card className="p-6 text-center h-full">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-hanna-100 flex items-center justify-center mb-4">
                      <Icon className="h-7 w-7 text-hanna-600" />
                    </div>
                    <h3 className="font-display font-semibold text-lg text-cream-900 mb-2">
                      {value.title}
                    </h3>
                    <p className="text-sm text-cream-600 leading-relaxed">
                      {value.description}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-cream-900">
              Como <span className="text-gradient">Funciona</span>
            </h2>
            <p className="mt-3 text-cream-600">
              En solo 3 sencillos pasos tendras tus productos en casa
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  variants={fadeInUp}
                  custom={i}
                  className="relative text-center"
                >
                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-cream-200" />
                  )}

                  <div className="relative z-10">
                    <div className="mx-auto w-24 h-24 rounded-full bg-gradient-hero flex items-center justify-center mb-5 shadow-lg">
                      <Icon className="h-10 w-10 text-white" />
                    </div>
                    <span className="inline-block px-3 py-1 bg-gold-100 text-gold-700 font-display font-bold text-sm rounded-full mb-3">
                      Paso {step.number}
                    </span>
                    <h3 className="font-display font-semibold text-xl text-cream-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-cream-600 leading-relaxed max-w-xs mx-auto">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </>
  );
}
