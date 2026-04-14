"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Package, ArrowRight, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ---------------------------------------------------------------------------
// Confetti particle
// ---------------------------------------------------------------------------

function ConfettiParticle({ delay }: { delay: number }) {
  const colors = [
    "bg-hanna-400",
    "bg-hanna-500",
    "bg-gold-400",
    "bg-gold-500",
    "bg-green-400",
    "bg-blue-400",
    "bg-pink-400",
  ];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const left = Math.random() * 100;
  const size = Math.random() * 8 + 4;
  const duration = Math.random() * 2 + 2;

  return (
    <motion.div
      className={`absolute rounded-full ${color}`}
      style={{
        left: `${left}%`,
        width: size,
        height: size,
        top: -10,
      }}
      initial={{ y: -10, opacity: 1, rotate: 0 }}
      animate={{
        y: "100vh",
        opacity: [1, 1, 0],
        rotate: Math.random() * 720 - 360,
        x: [0, (Math.random() - 0.5) * 200],
      }}
      transition={{
        duration: duration,
        delay: delay,
        ease: "easeIn",
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Payment method label helper
// ---------------------------------------------------------------------------

function paymentLabel(method: string): string {
  switch (method) {
    case "transfer":
      return "Transferencia Bancaria";
    case "yape":
      return "Yape";
    case "plin":
      return "Plin";
    case "card":
      return "Tarjeta de Credito/Debito";
    default:
      return method || "No especificado";
  }
}

// ---------------------------------------------------------------------------
// Inner component that uses useSearchParams
// ---------------------------------------------------------------------------

function PedidoConfirmadoContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || "";
  const paymentMethod = searchParams.get("payment") || "";

  const [showConfetti, setShowConfetti] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleCopyOrder = () => {
    if (orderNumber) {
      navigator.clipboard.writeText(orderNumber).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <ConfettiParticle key={i} delay={i * 0.08} />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg mx-auto text-center"
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="h-14 w-14 text-green-500" />
        </motion.div>

        <h1 className="font-display text-3xl sm:text-4xl font-bold text-cream-900 mb-3">
          Pedido Confirmado!
        </h1>
        <p className="text-cream-600 text-lg mb-8">
          Gracias por tu compra. Tu pedido ha sido recibido y esta siendo
          procesado.
        </p>

        {/* Order details card */}
        <Card className="p-6 text-left mb-8">
          <h2 className="font-display font-semibold text-lg text-cream-900 mb-4">
            Detalles del Pedido
          </h2>
          <div className="space-y-3 text-sm">
            {/* Order number */}
            <div className="flex items-center justify-between">
              <span className="text-cream-600">Numero de pedido</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-hanna-600">
                  {orderNumber || "---"}
                </span>
                {orderNumber && (
                  <button
                    type="button"
                    onClick={handleCopyOrder}
                    className="text-cream-400 hover:text-hanna-500 transition-colors"
                    title="Copiar numero de pedido"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-cream-600">Estado</span>
              <Badge variant="warning" size="sm">
                Pendiente
              </Badge>
            </div>

            {/* Payment method */}
            {paymentMethod && (
              <div className="flex items-center justify-between">
                <span className="text-cream-600">Metodo de pago</span>
                <span className="font-medium text-cream-900">
                  {paymentLabel(paymentMethod)}
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-cream-200">
            <div className="flex items-start gap-2 text-sm text-cream-600">
              <Package className="h-4 w-4 text-hanna-500 mt-0.5 shrink-0" />
              <span>
                Recibiras un correo electronico con los detalles y el
                seguimiento de tu pedido. Si elegiste Yape, Plin o
                transferencia, te contactaremos con los datos de pago.
              </span>
            </div>
          </div>
        </Card>

        {/* Next steps */}
        <div className="space-y-3">
          <p className="text-sm text-cream-500 mb-4">
            Que te gustaria hacer ahora?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/mi-cuenta">
              <Button variant="outline" className="w-full sm:w-auto">
                Ver Mis Pedidos
              </Button>
            </Link>
            <Link href="/productos">
              <Button className="w-full sm:w-auto">
                Seguir Comprando
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Wrapper with Suspense (useSearchParams needs it)
// ---------------------------------------------------------------------------

export default function PedidoConfirmadoPage() {
  return (
    <Suspense
      fallback={
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="w-24 h-24 rounded-full bg-cream-100 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Package className="h-14 w-14 text-cream-300" />
          </div>
          <p className="text-cream-500">Cargando confirmacion...</p>
        </section>
      }
    >
      <PedidoConfirmadoContent />
    </Suspense>
  );
}
