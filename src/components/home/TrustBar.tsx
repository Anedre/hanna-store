import { Truck, ShieldCheck, MessageCircle, RefreshCcw } from "lucide-react";
import { SHIPPING } from "@/lib/constants";

const ITEMS = [
  {
    icon: Truck,
    title: "Envío a todo el Perú",
    text: `Gratis desde S/ ${SHIPPING.freeThreshold}`,
  },
  {
    icon: ShieldCheck,
    title: "Producto verificado",
    text: "Lo probamos antes de venderlo",
  },
  {
    icon: MessageCircle,
    title: "Atención real",
    text: "WhatsApp directo, sin bots",
  },
  {
    icon: RefreshCcw,
    title: "Cambios sin drama",
    text: "7 días para cambios",
  },
];

export function TrustBar() {
  return (
    <section className="border-y border-cream-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
        {ITEMS.map((item) => (
          <div key={item.title} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-hanna-50 text-hanna-600 flex items-center justify-center shrink-0">
              <item.icon className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-cream-900 leading-tight">{item.title}</p>
              <p className="text-xs text-cream-500 leading-tight mt-0.5">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
