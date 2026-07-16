import { Flame } from "lucide-react";
import { getProducts } from "@/actions/products";
import { getActiveCampaigns } from "@/lib/pricing";
import { ProductCard } from "@/components/products/ProductCard";
import { StaggerGroup, StaggerItem, FadeIn } from "@/components/motion";
import { CountdownTimer } from "@/components/home/CountdownTimer";

export const metadata = {
  title: "Ofertas | Hanna",
  description: "Productos con descuento por tiempo limitado.",
};

// ISR: las ofertas dependen de campañas activas en la BD
export const revalidate = 60;

export default async function OfertasPage() {
  const [campaigns, productsRes] = await Promise.all([
    getActiveCampaigns(),
    getProducts({ perPage: 60 }),
  ]);

  const products = (productsRes.success && productsRes.data?.products) || [];
  const discounted = products.filter((p: any) => (p.discountPercent ?? 0) > 0 && p.stock > 0);
  const topCampaign = campaigns.find((c) => c.discountPercent > 0 && c.showCountdown);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <FadeIn>
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-100 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide mb-4">
            <Flame className="h-3.5 w-3.5" /> Por tiempo limitado
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-cream-900 text-balance">
            Ofertas
          </h1>
          {topCampaign && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-cream-600">
              <span>{topCampaign.name} termina en</span>
              <CountdownTimer endsAt={topCampaign.endsAt} />
            </div>
          )}
        </div>
      </FadeIn>

      {discounted.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-display text-xl font-semibold text-cream-700 mb-2">
            No hay ofertas activas ahora mismo
          </p>
          <p className="text-sm text-cream-500">
            Suscríbete al newsletter y te avisamos cuando empiece la próxima.
          </p>
        </div>
      ) : (
        <StaggerGroup className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {discounted.map((product: any) => (
            <StaggerItem key={product.id}>
              <ProductCard product={product} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
