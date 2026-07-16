"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CARRIERS, type CarrierKey } from "@/lib/constants";

interface Props {
  orderId: string;
  status: string;
  paymentStatus: string;
  carrier: string;
  trackingCode: string;
}

export function OrderActions(initial: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(initial.status);
  const [paymentStatus, setPaymentStatus] = useState(initial.paymentStatus);
  const [carrier, setCarrier] = useState(initial.carrier);
  const [trackingCode, setTrackingCode] = useState(initial.trackingCode);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const carrierInfo = carrier ? CARRIERS[carrier as CarrierKey] : null;

  function save() {
    setError(null);

    if (status === "CANCELLED" && initial.status !== "CANCELLED") {
      const ok = window.confirm(
        "¿Cancelar este pedido?\n\nEl stock de todos los items se repondrá automáticamente. Esta acción no se puede deshacer."
      );
      if (!ok) return;
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/orders/${initial.orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, paymentStatus, carrier: carrier || null, trackingCode: trackingCode || null }),
        });
        const json = await res.json();
        if (!json.success) {
          setError(json.error || "Error al guardar");
          return;
        }
        router.refresh();
      } catch {
        setError("Error de red al guardar");
      }
    });
  }

  const dirty =
    status !== initial.status ||
    paymentStatus !== initial.paymentStatus ||
    carrier !== initial.carrier ||
    trackingCode !== initial.trackingCode;

  const selectCls =
    "w-full text-sm border border-cream-300 rounded-lg px-2 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-hanna-500";

  return (
    <Card className="p-5 space-y-4">
      <h2 className="font-display font-semibold text-sm text-cream-900">Gestionar pedido</h2>

      <div>
        <label className="block text-xs font-medium text-cream-500 uppercase mb-1">Estado</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
          <option value="PENDING">Pendiente</option>
          <option value="CONFIRMED">Confirmado</option>
          <option value="SHIPPED">Enviado</option>
          <option value="DELIVERED">Entregado</option>
          <option value="CANCELLED">Cancelado (repone stock)</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-cream-500 uppercase mb-1">Pago</label>
        <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className={selectCls}>
          <option value="PENDING">Pendiente</option>
          <option value="PAID">Pagado</option>
          <option value="FAILED">Fallido</option>
          <option value="REFUNDED">Reembolsado</option>
        </select>
      </div>

      <div className="border-t border-cream-100 pt-4">
        <label className="block text-xs font-medium text-cream-500 uppercase mb-1">Courier</label>
        <select value={carrier} onChange={(e) => setCarrier(e.target.value)} className={selectCls}>
          <option value="">— Sin asignar —</option>
          {Object.entries(CARRIERS).map(([key, c]) => (
            <option key={key} value={key}>{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-cream-500 uppercase mb-1">
          Código de seguimiento
        </label>
        <Input
          placeholder="Ej: 012345678"
          value={trackingCode}
          onChange={(e) => setTrackingCode(e.target.value)}
        />
        {carrierInfo?.trackingUrl && trackingCode && (
          <a
            href={carrierInfo.trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-hanna-600 hover:underline mt-1"
          >
            Rastrear en {carrierInfo.label} <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button onClick={save} isLoading={isPending} disabled={!dirty} className="w-full">
        <Save className="h-4 w-4 mr-1" /> Guardar cambios
      </Button>
    </Card>
  );
}
