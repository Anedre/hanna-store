"use client";

import { useState, useRef } from "react";
import { Mail, Phone, MapPin, Send, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CONTACT } from "@/lib/constants";

const CONTACT_CARDS = [
  {
    icon: Mail,
    title: "Correo Electronico",
    value: CONTACT.email,
    href: `mailto:${CONTACT.email}`,
  },
  {
    icon: Phone,
    title: "Telefono / WhatsApp",
    value: `+51 ${CONTACT.phone}`,
    href: `tel:+${CONTACT.whatsapp}`,
  },
  {
    icon: MapPin,
    title: "Direccion",
    value: CONTACT.address,
    href: null,
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
} as const;

export default function ContactoPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: (formData.get("phone") as string) || undefined,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || "Error al enviar el mensaje");
        setIsSubmitting(false);
        return;
      }

      // Success -- clear form and show confirmation
      formRef.current?.reset();
      setIsSubmitting(false);
      setSubmitted(true);
    } catch {
      setError("Error de conexion. Intenta nuevamente.");
      setIsSubmitting(false);
    }
  };

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
            <span className="text-gold-300">Contacto</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-hanna-100 max-w-2xl mx-auto"
          >
            Estamos aqui para ayudarte. Escribenos y te responderemos lo antes
            posible.
          </motion.p>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Contact Form */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="lg:col-span-2"
            >
              <Card className="p-8">
                <h2 className="font-display text-2xl font-bold text-cream-900 mb-6">
                  Enviar Mensaje
                </h2>

                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <Send className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="font-display font-semibold text-xl text-cream-900 mb-2">
                      Mensaje Enviado
                    </h3>
                    <p className="text-cream-600">
                      Mensaje enviado correctamente. Te responderemos dentro de
                      las proximas 24 horas.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-6"
                      onClick={() => {
                        setSubmitted(false);
                        setError(null);
                      }}
                    >
                      Enviar otro mensaje
                    </Button>
                  </div>
                ) : (
                  <form
                    ref={formRef}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    {error && (
                      <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Input
                        label="Nombre completo"
                        name="name"
                        placeholder="Tu nombre"
                        required
                      />
                      <Input
                        label="Correo electronico"
                        name="email"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Input
                        label="Telefono"
                        name="phone"
                        type="tel"
                        placeholder="999 999 999"
                      />
                      <Input
                        label="Asunto"
                        name="subject"
                        placeholder="Motivo del mensaje"
                        required
                      />
                    </div>
                    <div className="w-full">
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-cream-700 mb-1.5"
                      >
                        Mensaje
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        placeholder="Escribe tu mensaje aqui..."
                        required
                        className="w-full rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-sm text-cream-900 placeholder:text-cream-400 focus:border-hanna-500 focus:outline-none focus:ring-2 focus:ring-hanna-500/20 transition-all duration-200 resize-none"
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      isLoading={isSubmitting}
                      className="w-full sm:w-auto"
                    >
                      <Send className="h-4 w-4" />
                      Enviar Mensaje
                    </Button>
                  </form>
                )}
              </Card>
            </motion.div>

            {/* Contact Info Cards */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="space-y-4"
            >
              {CONTACT_CARDS.map((card) => {
                const Icon = card.icon;
                const content = (
                  <Card className="p-5 flex items-start gap-4" key={card.title}>
                    <div className="w-12 h-12 rounded-xl bg-hanna-100 flex items-center justify-center shrink-0">
                      <Icon className="h-6 w-6 text-hanna-600" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-cream-900">
                        {card.title}
                      </h3>
                      <p className="text-sm text-cream-600 mt-0.5">
                        {card.value}
                      </p>
                    </div>
                  </Card>
                );

                if (card.href) {
                  return (
                    <a
                      key={card.title}
                      href={card.href}
                      className="block hover:opacity-80 transition-opacity"
                    >
                      {content}
                    </a>
                  );
                }
                return content;
              })}

              {/* Horario */}
              <Card className="p-5">
                <h3 className="font-display font-semibold text-cream-900 mb-2">
                  Horario de Atencion
                </h3>
                <div className="space-y-1 text-sm text-cream-600">
                  <p>Lunes a Viernes: 9:00 AM - 6:00 PM</p>
                  <p>Sabados: 9:00 AM - 1:00 PM</p>
                  <p>Domingos y Feriados: Cerrado</p>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Google Maps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12"
          >
            <Card className="overflow-hidden">
              <iframe
                title="Ubicacion de Hanna - Lima, Peru"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d249744.06559090074!2d-77.12720419671992!3d-12.046373996498498!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c5f619ee3ec7%3A0x14206cb9cc452e4a!2sLima%2C%20Peru!5e0!3m2!1ses-419!2spe!4v1700000000000!5m2!1ses-419!2spe"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
            </Card>
          </motion.div>
        </div>
      </section>
    </>
  );
}
