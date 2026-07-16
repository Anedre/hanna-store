import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, CreditCard, PackageCheck, Truck, XCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getOrderById } from "@/actions/orders";
import { formatPrice } from "@/lib/format";
import { OrderActions } from "./OrderActions";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "success" | "warning" | "error" | "info" | "gold" }> = {
  PENDING: { label: "Pendiente", variant: "warning" },
  CONFIRMED: { label: "Confirmado", variant: "info" },
  SHIPPED: { label: "Enviado", variant: "default" },
  DELIVERED: { label: "Entregado", variant: "success" },
  CANCELLED: { label: "Cancelado", variant: "error" },
};

const PAYMENT_MAP: Record<string, { label: string; variant: "success" | "warning" | "error" | "info" }> = {
  PENDING: { label: "Pago pendiente", variant: "warning" },
  PAID: { label: "Pagado", variant: "success" },
  FAILED: { label: "Pago fallido", variant: "error" },
  REFUNDED: { label: "Reembolsado", variant: "info" },
};

function fmtDateTime(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleString("es-PE", {
    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default async function AdminPedidoDetalle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getOrderById(id);
  const order = (result.success ? result.data : null) as Record<string, any> | null;
  if (!order?.orderNumber) notFound();
  const st = STATUS_MAP[order.status] ?? STATUS_MAP.PENDING;
  const pay = PAYMENT_MAP[order.paymentStatus] ?? PAYMENT_MAP.PENDING;
  const items: any[] = order.items ?? [];

  const timeline = [
    { icon: Clock, label: "Pedido creado", at: fmtDateTime(order.createdAt), done: true },
    order.status === "CANCELLED"
      ? { icon: XCircle, label: "Cancelado (stock repuesto)", at: fmtDateTime(order.updatedAt), done: true }
      : null,
    order.status !== "CANCELLED"
      ? { icon: Truck, label: "Enviado", at: fmtDateTime(order.shippedAt), done: !!order.shippedAt }
      : null,
    order.status !== "CANCELLED"
      ? { icon: PackageCheck, label: "Entregado", at: fmtDateTime(order.deliveredAt), done: !!order.deliveredAt }
      : null,
  ].filter(Boolean) as { icon: any; label: string; at: string | null; done: boolean }[];

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/pedidos" className="text-cream-400 hover:text-cream-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-cream-900 font-mono">{order.orderNumber}</h1>
            <p className="text-sm text-cream-500 mt-0.5">{fmtDateTime(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant={st.variant}>{st.label}</Badge>
          <Badge variant={pay.variant}>{pay.label}</Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-4 items-start">
        {/* Columna principal */}
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="px-5 py-3 border-b border-cream-200 bg-cream-50">
              <h2 className="font-display font-semibold text-sm text-cream-900">
                Items ({items.length})
              </h2>
            </div>
            <div className="divide-y divide-cream-100">
              {items.map((it, i) => {
                const img = it.product?.images?.[0];
                return (
                  <div key={i} className="flex items-center gap-4 px-5 py-3">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt="" className="w-12 h-12 rounded-lg object-cover bg-cream-100 shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-cream-100 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-cream-900 truncate">
                        {it.product?.name ?? it.productId}
                      </p>
                      <p className="text-xs text-cream-500">
                        {it.quantity} × {formatPrice(it.price)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-cream-900">{formatPrice(it.total)}</p>
                  </div>
                );
              })}
            </div>
            <div className="px-5 py-3 border-t border-cream-200 bg-cream-50 space-y-1 text-sm">
              <div className="flex justify-between text-cream-600">
                <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Descuento {order.couponCode ? `(${order.couponCode})` : ""}</span>
                  <span>−{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-cream-600">
                <span>Envío</span>
                <span>{order.shippingCost === 0 ? "Gratis" : formatPrice(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between font-bold text-cream-900 pt-1 border-t border-cream-200">
                <span>Total</span><span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </Card>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="p-5">
              <h2 className="font-display font-semibold text-sm text-cream-900 mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-hanna-500" /> Datos de envío
              </h2>
              <p className="text-sm text-cream-700 whitespace-pre-line leading-relaxed">
                {order.shippingAddress}
              </p>
              {order.notes && (
                <p className="text-xs text-cream-500 mt-3 border-t border-cream-100 pt-2">
                  Nota del cliente: {order.notes}
                </p>
              )}
            </Card>
            <Card className="p-5">
              <h2 className="font-display font-semibold text-sm text-cream-900 mb-2 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-hanna-500" /> Pago
              </h2>
              <p className="text-sm text-cream-700 capitalize">Método: {order.paymentMethod}</p>
              <p className="text-sm text-cream-700 mt-1">
                Estado: <Badge variant={pay.variant} size="sm">{pay.label}</Badge>
              </p>
            </Card>
          </div>
        </div>

        {/* Columna lateral */}
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="font-display font-semibold text-sm text-cream-900 mb-3">Historial</h2>
            <ol className="space-y-3">
              {timeline.map((t, i) => (
                <li key={i} className="flex items-start gap-3">
                  <t.icon className={`h-4 w-4 mt-0.5 ${t.done ? "text-hanna-600" : "text-cream-300"}`} />
                  <div>
                    <p className={`text-sm font-medium ${t.done ? "text-cream-900" : "text-cream-400"}`}>
                      {t.label}
                    </p>
                    {t.at && <p className="text-xs text-cream-500">{t.at}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <OrderActions
            orderId={order.id}
            status={order.status}
            paymentStatus={order.paymentStatus}
            carrier={order.carrier ?? ""}
            trackingCode={order.trackingCode ?? ""}
          />
        </div>
      </div>
    </div>
  );
}
