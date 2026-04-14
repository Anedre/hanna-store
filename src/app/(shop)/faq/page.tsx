"use client";

import { HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Accordion, AccordionItem } from "@/components/ui/accordion";

const FAQ_ITEMS = [
  {
    question: "Como realizo un pedido en Hanna?",
    answer:
      "Realizar un pedido es muy sencillo. Navega por nuestro catalogo, selecciona los productos que deseas, agregalos al carrito y procede al checkout. Podras elegir tu metodo de pago preferido y la direccion de envio.",
  },
  {
    question: "Cuales son los metodos de pago disponibles?",
    answer:
      "Aceptamos transferencias bancarias, Yape, Plin y tarjetas de credito/debito. Todos los pagos son procesados de manera segura para proteger tu informacion financiera.",
  },
  {
    question: "Cuanto tiempo tarda el envio?",
    answer:
      "El tiempo de envio depende de tu ubicacion. Para Lima Metropolitana, el envio tarda entre 1-3 dias habiles. Para provincias, entre 3-7 dias habiles. Los envios internacionales pueden tomar entre 7-15 dias habiles dependiendo del producto.",
  },
  {
    question: "Cual es el costo de envio?",
    answer:
      "El costo de envio estandar es de S/ 10.00 a nivel nacional. Ofrecemos envio gratuito en compras mayores a S/ 150.00. Para los miembros Premium, el envio express es siempre gratuito.",
  },
  {
    question: "Puedo devolver un producto?",
    answer:
      "Si, aceptamos devoluciones dentro de los 15 dias posteriores a la recepcion del producto, siempre que se encuentre en su empaque original y en perfectas condiciones. Para iniciar una devolucion, contacta a nuestro equipo de soporte por WhatsApp o correo electronico.",
  },
  {
    question: "Los productos son originales?",
    answer:
      "Absolutamente. Todos nuestros productos son 100% originales e importados directamente de fabricantes y distribuidores autorizados alrededor del mundo. Cada producto cuenta con garantia de autenticidad.",
  },
  {
    question: "Como puedo hacer seguimiento a mi pedido?",
    answer:
      "Una vez que tu pedido sea despachado, recibiras un correo electronico con el numero de seguimiento. Tambien puedes consultar el estado de tu pedido desde tu cuenta en la seccion Mis Pedidos o contactando a nuestro equipo de soporte.",
  },
  {
    question: "Tienen tienda fisica?",
    answer:
      "Actualmente operamos exclusivamente como tienda online para ofrecerte los mejores precios al reducir costos operativos. Sin embargo, contamos con un showroom en Lima donde puedes ver productos seleccionados previa cita.",
  },
  {
    question: "Que garantia tienen los productos?",
    answer:
      "Todos nuestros productos cuentan con garantia del fabricante. Ademas, ofrecemos una garantia adicional de satisfaccion de 30 dias. Si no estas conforme con tu compra, te ayudamos a resolverlo.",
  },
  {
    question: "Puedo importar un producto especifico que no esta en el catalogo?",
    answer:
      "Si, ofrecemos un servicio de importacion personalizada. Contactanos con los detalles del producto que necesitas y te proporcionaremos una cotizacion y tiempo estimado de entrega. Este servicio esta especialmente optimizado para nuestros clientes del plan Empresarial.",
  },
];

export default function FaqPage() {
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
            Preguntas <span className="text-gold-300">Frecuentes</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-hanna-100 max-w-2xl mx-auto"
          >
            Encuentra respuestas a las dudas mas comunes sobre nuestros
            productos y servicios
          </motion.p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 sm:py-20 bg-cream-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Accordion>
              {FAQ_ITEMS.map((item, i) => (
                <AccordionItem
                  key={i}
                  title={item.question}
                  defaultOpen={i === 0}
                >
                  {item.answer}
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12 text-center bg-white rounded-2xl border border-cream-200 p-8"
          >
            <HelpCircle className="h-10 w-10 text-hanna-500 mx-auto mb-3" />
            <h3 className="font-display font-semibold text-lg text-cream-900 mb-2">
              No encontraste tu respuesta?
            </h3>
            <p className="text-sm text-cream-600 mb-4">
              Nuestro equipo de soporte esta disponible para ayudarte con
              cualquier consulta adicional.
            </p>
            <a
              href={`https://wa.me/51969333173?text=${encodeURIComponent(
                "Hola, tengo una consulta"
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-2.5 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 transition-colors text-sm"
            >
              Escriibenos por WhatsApp
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
