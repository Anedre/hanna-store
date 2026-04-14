"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  MapPin,
  CreditCard,
  Package,
  ArrowLeft,
  Building2,
  Smartphone,
  CreditCard as CardIcon,
  AlertCircle,
  Truck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/format";
import { SHIPPING } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types";

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

const CHECKOUT_STEPS = [
  { label: "Datos de Envio", icon: MapPin },
  { label: "Metodo de Pago", icon: CreditCard },
  { label: "Confirmacion", icon: Package },
] as const;

// ---------------------------------------------------------------------------
// Shipping form types
// ---------------------------------------------------------------------------

interface ShippingData {
  name: string;
  lastName: string;
  dni: string;
  phone: string;
  email: string;
  address: string;
  district: string;
  city: string;
  postalCode: string;
  notes: string;
}

type ShippingErrors = Partial<Record<keyof ShippingData, string>>;

// ---------------------------------------------------------------------------
// Payment methods
// ---------------------------------------------------------------------------

const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  icon: typeof Building2;
  description: string;
}[] = [
  {
    id: "transfer",
    label: "Transferencia Bancaria",
    icon: Building2,
    description:
      "Realiza una transferencia a nuestra cuenta BCP o Interbank. Envia el comprobante por WhatsApp.",
  },
  {
    id: "yape",
    label: "Yape",
    icon: Smartphone,
    description:
      "Paga con Yape al numero de la tienda. Recibiras los datos al confirmar.",
  },
  {
    id: "plin",
    label: "Plin",
    icon: Smartphone,
    description:
      "Paga con Plin al numero de la tienda. Recibiras los datos al confirmar.",
  },
  {
    id: "card",
    label: "Tarjeta de Credito / Debito",
    icon: CardIcon,
    description:
      "Pago seguro con Visa, Mastercard o American Express. Coordinamos el link de pago.",
  },
];

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateShipping(data: ShippingData): ShippingErrors {
  const errors: ShippingErrors = {};
  if (!data.name.trim()) errors.name = "El nombre es requerido";
  if (!data.lastName.trim()) errors.lastName = "El apellido es requerido";
  if (!/^\d{8}$/.test(data.dni)) errors.dni = "El DNI debe tener 8 digitos";
  if (!/^\d{9}$/.test(data.phone))
    errors.phone = "El telefono debe tener 9 digitos";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = "Ingresa un correo valido";
  if (!data.address.trim()) errors.address = "La direccion es requerida";
  if (!data.district.trim()) errors.district = "El distrito es requerido";
  if (!data.city.trim()) errors.city = "La ciudad es requerida";
  return errors;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Shipping form
  const [shipping, setShipping] = useState<ShippingData>({
    name: "",
    lastName: "",
    dni: "",
    phone: "",
    email: "",
    address: "",
    district: "",
    city: "",
    postalCode: "",
    notes: "",
  });
  const [shippingErrors, setShippingErrors] = useState<ShippingErrors>({});

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("yape");

  // Derived
  const sub = subtotal();
  const shippingCost = sub >= SHIPPING.freeThreshold ? 0 : SHIPPING.cost;
  const total = sub + shippingCost;

  // Redirect to cart if empty
  useEffect(() => {
    if (items.length === 0 && currentStep === 0) {
      router.replace("/carrito");
    }
  }, [items.length, currentStep, router]);

  // Update shipping field
  const updateField = (field: keyof ShippingData, value: string) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
    if (shippingErrors[field]) {
      setShippingErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Step 1 -> validate & advance
  const handleShippingNext = () => {
    const errors = validateShipping(shipping);
    setShippingErrors(errors);
    if (Object.keys(errors).length === 0) {
      setCurrentStep(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Step 2 -> advance
  const handlePaymentNext = () => {
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 3 -> submit
  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
          shipping,
          paymentMethod,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setSubmitError(
          result.error || "Error al procesar el pedido. Intenta de nuevo."
        );
        setIsSubmitting(false);
        return;
      }

      const orderNumber =
        result.data?.orderNumber || "HANNA-000000";

      clearCart();
      router.push(
        `/pedido-confirmado?order=${encodeURIComponent(orderNumber)}&payment=${paymentMethod}`
      );
    } catch {
      setSubmitError("Error de conexion. Intenta de nuevo.");
      setIsSubmitting(false);
    }
  };

  // Payment method label
  const paymentLabel = useMemo(
    () => PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label || "",
    [paymentMethod]
  );

  // ---------- Empty cart guard ----------
  if (items.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <Package className="h-16 w-16 text-cream-300 mx-auto mb-4" />
        <h1 className="font-display text-2xl font-bold text-cream-900 mb-2">
          No hay productos en el carrito
        </h1>
        <p className="text-cream-600 mb-6">
          Agrega productos a tu carrito antes de proceder al checkout.
        </p>
        <Link href="/productos">
          <Button>Ver Productos</Button>
        </Link>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-cream-900 mb-8">
        <span className="text-gradient">Checkout</span>
      </h1>

      {/* ---------------------------------------------------------------- */}
      {/* Step Indicator                                                    */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex items-center justify-center mb-12">
        {CHECKOUT_STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === currentStep;
          const isCompleted = i < currentStep;

          return (
            <div key={step.label} className="flex items-center">
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                  }}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                    isCompleted
                      ? "bg-hanna-500 text-white"
                      : isActive
                        ? "bg-hanna-500 text-white ring-4 ring-hanna-100"
                        : "bg-cream-200 text-cream-500"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </motion.div>
                <span
                  className={cn(
                    "text-xs font-medium mt-2 hidden sm:block",
                    isActive || isCompleted
                      ? "text-hanna-600"
                      : "text-cream-500"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < CHECKOUT_STEPS.length - 1 && (
                <div
                  className={cn(
                    "w-12 sm:w-24 h-0.5 mx-2 mb-6 sm:mb-4 transition-colors",
                    i < currentStep ? "bg-hanna-500" : "bg-cream-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ---------------------------------------------------------------- */}
        {/* Form Area                                                        */}
        {/* ---------------------------------------------------------------- */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {/* ========== Step 1: Shipping ========== */}
            {currentStep === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                <Card className="p-6 sm:p-8">
                  <h2 className="font-display font-semibold text-xl text-cream-900 mb-6 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-hanna-500" />
                    Datos de Envio
                  </h2>
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Input
                        label="Nombres *"
                        placeholder="Ingresa tus nombres"
                        value={shipping.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        error={shippingErrors.name}
                      />
                      <Input
                        label="Apellidos *"
                        placeholder="Ingresa tus apellidos"
                        value={shipping.lastName}
                        onChange={(e) => updateField("lastName", e.target.value)}
                        error={shippingErrors.lastName}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Input
                        label="DNI *"
                        placeholder="12345678"
                        maxLength={8}
                        value={shipping.dni}
                        onChange={(e) =>
                          updateField(
                            "dni",
                            e.target.value.replace(/\D/g, "").slice(0, 8)
                          )
                        }
                        error={shippingErrors.dni}
                      />
                      <Input
                        label="Telefono *"
                        type="tel"
                        placeholder="999999999"
                        maxLength={9}
                        value={shipping.phone}
                        onChange={(e) =>
                          updateField(
                            "phone",
                            e.target.value.replace(/\D/g, "").slice(0, 9)
                          )
                        }
                        error={shippingErrors.phone}
                      />
                    </div>

                    <Input
                      label="Correo Electronico *"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={shipping.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      error={shippingErrors.email}
                    />

                    <Input
                      label="Direccion de Envio *"
                      placeholder="Av. Principal 123, Dpto. 4B"
                      value={shipping.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      error={shippingErrors.address}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <Input
                        label="Ciudad *"
                        placeholder="Lima"
                        value={shipping.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        error={shippingErrors.city}
                      />
                      <Input
                        label="Distrito *"
                        placeholder="Miraflores"
                        value={shipping.district}
                        onChange={(e) => updateField("district", e.target.value)}
                        error={shippingErrors.district}
                      />
                      <Input
                        label="Codigo Postal"
                        placeholder="15074"
                        value={shipping.postalCode}
                        onChange={(e) =>
                          updateField("postalCode", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-cream-700 mb-1.5">
                        Notas del pedido (opcional)
                      </label>
                      <textarea
                        placeholder="Instrucciones especiales de entrega, referencias, etc."
                        rows={3}
                        value={shipping.notes}
                        onChange={(e) => updateField("notes", e.target.value)}
                        className="w-full rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-sm text-cream-900 placeholder:text-cream-400 focus:border-hanna-500 focus:outline-none focus:ring-2 focus:ring-hanna-500/20 transition-all duration-200 resize-none"
                      />
                    </div>

                    <div className="pt-4 flex justify-end">
                      <Button
                        type="button"
                        size="lg"
                        onClick={handleShippingNext}
                      >
                        Continuar al Pago
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ========== Step 2: Payment ========== */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                <Card className="p-6 sm:p-8">
                  <h2 className="font-display font-semibold text-xl text-cream-900 mb-6 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-hanna-500" />
                    Metodo de Pago
                  </h2>
                  <div className="space-y-3">
                    {PAYMENT_METHODS.map((method) => {
                      const Icon = method.icon;
                      const isSelected = paymentMethod === method.id;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setPaymentMethod(method.id)}
                          className={cn(
                            "w-full text-left p-4 rounded-xl border-2 transition-all",
                            isSelected
                              ? "border-hanna-500 bg-hanna-50 ring-2 ring-hanna-200"
                              : "border-cream-200 hover:border-cream-400"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                isSelected
                                  ? "bg-hanna-500 text-white"
                                  : "bg-cream-100 text-cream-500"
                              )}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-cream-900">
                                {method.label}
                              </p>
                              <p className="text-xs text-cream-500 mt-0.5">
                                {method.description}
                              </p>
                            </div>
                            <div
                              className={cn(
                                "w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center",
                                isSelected
                                  ? "border-hanna-500"
                                  : "border-cream-300"
                              )}
                            >
                              {isSelected && (
                                <div className="w-2.5 h-2.5 rounded-full bg-hanna-500" />
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-6 flex justify-between">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setCurrentStep(0);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Volver
                    </Button>
                    <Button
                      type="button"
                      size="lg"
                      onClick={handlePaymentNext}
                    >
                      Revisar Pedido
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ========== Step 3: Review & Confirm ========== */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                <Card className="p-6 sm:p-8">
                  <h2 className="font-display font-semibold text-xl text-cream-900 mb-6 flex items-center gap-2">
                    <Package className="h-5 w-5 text-hanna-500" />
                    Resumen y Confirmacion
                  </h2>

                  {/* Cart items */}
                  <div className="space-y-3 mb-6">
                    <h3 className="text-sm font-semibold text-cream-700 uppercase tracking-wide">
                      Productos
                    </h3>
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-cream-50"
                      >
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-white border border-cream-200">
                          <Image
                            src={
                              item.image ||
                              "https://placehold.co/100x100/E8E1D8/8B7E74?text=Img"
                            }
                            alt={item.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-cream-900 line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-xs text-cream-500">
                            Cant: {item.quantity} x {formatPrice(item.price)}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-cream-900 shrink-0">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Shipping info */}
                  <div className="mb-6 p-4 rounded-xl bg-cream-50 space-y-1">
                    <h3 className="text-sm font-semibold text-cream-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <Truck className="h-4 w-4" />
                      Datos de Envio
                    </h3>
                    <p className="text-sm text-cream-800">
                      {shipping.name} {shipping.lastName}
                    </p>
                    <p className="text-sm text-cream-600">
                      DNI: {shipping.dni}
                    </p>
                    <p className="text-sm text-cream-600">{shipping.address}</p>
                    <p className="text-sm text-cream-600">
                      {shipping.district}, {shipping.city}
                      {shipping.postalCode ? ` - CP: ${shipping.postalCode}` : ""}
                    </p>
                    <p className="text-sm text-cream-600">
                      Tel: {shipping.phone} | {shipping.email}
                    </p>
                    {shipping.notes && (
                      <p className="text-sm text-cream-500 italic mt-1">
                        Notas: {shipping.notes}
                      </p>
                    )}
                  </div>

                  {/* Payment method */}
                  <div className="mb-6 p-4 rounded-xl bg-cream-50">
                    <h3 className="text-sm font-semibold text-cream-700 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4" />
                      Metodo de Pago
                    </h3>
                    <p className="text-sm text-cream-800">{paymentLabel}</p>
                  </div>

                  {/* Totals */}
                  <div className="border-t border-cream-200 pt-4 space-y-2 text-sm mb-6">
                    <div className="flex justify-between">
                      <span className="text-cream-600">Subtotal</span>
                      <span className="font-medium">{formatPrice(sub)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cream-600">Envio</span>
                      <span className="font-medium">
                        {shippingCost === 0 ? (
                          <span className="text-green-600">Gratis</span>
                        ) : (
                          formatPrice(shippingCost)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-cream-200">
                      <span>Total</span>
                      <span className="text-hanna-600">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>

                  {/* Error message */}
                  {submitError && (
                    <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{submitError}</p>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setCurrentStep(1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Volver
                    </Button>
                    <Button
                      type="button"
                      size="lg"
                      onClick={handleConfirmOrder}
                      isLoading={isSubmitting}
                    >
                      Confirmar Pedido
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Order Summary Sidebar                                            */}
        {/* ---------------------------------------------------------------- */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24">
            <h2 className="font-display font-semibold text-lg text-cream-900 mb-4">
              Resumen del Pedido
            </h2>

            <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-cream-100 border border-cream-200">
                    <Image
                      src={
                        item.image ||
                        "https://placehold.co/80x80/E8E1D8/8B7E74?text=Img"
                      }
                      alt={item.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-cream-700 line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-xs text-cream-500">x{item.quantity}</p>
                  </div>
                  <span className="text-sm font-medium shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-cream-200 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-cream-600">Subtotal</span>
                <span className="font-medium">{formatPrice(sub)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cream-600">Envio</span>
                <span className="font-medium">
                  {shippingCost === 0 ? (
                    <span className="text-green-600">Gratis</span>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </span>
              </div>
              {sub < SHIPPING.freeThreshold && (
                <p className="text-xs text-hanna-600">
                  Envio gratis en compras mayores a{" "}
                  {formatPrice(SHIPPING.freeThreshold)}
                </p>
              )}
            </div>

            <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t border-cream-200">
              <span>Total</span>
              <span className="text-hanna-600">{formatPrice(total)}</span>
            </div>

            {/* Current step badge */}
            <div className="mt-4 pt-4 border-t border-cream-200">
              <Badge variant="info" size="md">
                Paso {currentStep + 1} de {CHECKOUT_STEPS.length}:{" "}
                {CHECKOUT_STEPS[currentStep].label}
              </Badge>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
