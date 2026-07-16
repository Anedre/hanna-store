import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getFeaturedProducts, getCategories } from "@/actions/products";
import { getActiveCampaigns } from "@/lib/pricing";
import { scanTable, getItem, TABLES } from "@/lib/dynamo";
import { ProductCard } from "@/components/products/ProductCard";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion";
import { CampaignHero, type HeroSlide } from "@/components/home/CampaignHero";
import { TrustBar } from "@/components/home/TrustBar";
import { CategoryTiles } from "@/components/home/CategoryTiles";
import { OffersStrip } from "@/components/home/OffersStrip";
import { SplitFeature } from "@/components/home/SplitFeature";
import { ReviewsStrip, type HomeReview } from "@/components/home/ReviewsStrip";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { Button } from "@/components/ui/button";

// ISR: la portada lee campañas/productos de la BD — sin esto quedaría
// congelada al momento del build en Amplify. Refresca cada 60s.
export const revalidate = 60;

const FALLBACK_SLIDE: HeroSlide = {
  title: "Tu escritorio, curado pieza por pieza",
  subtitle:
    "Productos seleccionados y verificados en Lima. Entrega rápida, atención real, cero sorpresas.",
  ctaText: "Ver productos",
  ctaLink: "/productos",
  imageUrl: "https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=1920&q=80",
};

async function getHomeReviews(): Promise<HomeReview[]> {
  try {
    const approved = await scanTable<Record<string, any>>(TABLES.reviews, {
      filterExpression: "#approved = :trueVal",
      expressionValues: { ":trueVal": true },
      expressionNames: { "#approved": "approved" },
    });
    approved.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.createdAt || "").localeCompare(a.createdAt || ""));
    const top = approved.slice(0, 6);

    const reviews: HomeReview[] = [];
    for (const r of top) {
      let userName = "Cliente Hanna";
      if (r.userId) {
        const u = await getItem<Record<string, any>>(TABLES.users, { id: r.userId });
        if (u?.name) userName = `${u.name} ${u.lastName?.[0] ?? ""}.`.trim();
      }
      let productName: string | undefined;
      if (r.productId) {
        const p = await getItem<Record<string, any>>(TABLES.products, { id: r.productId });
        productName = p?.name;
      }
      reviews.push({ id: r.id, rating: r.rating, comment: r.comment, userName, productName });
    }
    return reviews;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [campaigns, featuredRes, categoriesRes, reviews] = await Promise.all([
    getActiveCampaigns(),
    getFeaturedProducts(8),
    getCategories(),
    getHomeReviews(),
  ]);

  // Hero: campañas con banner; fallback al slide de marca
  const campaignSlides: HeroSlide[] = campaigns
    .filter((c) => c.hero)
    .map((c) => ({
      title: c.hero!.title,
      subtitle: c.hero!.subtitle,
      ctaText: c.hero!.ctaText,
      ctaLink: c.hero!.ctaLink,
      imageUrl: c.hero!.imageUrl,
      endsAt: c.endsAt,
      showCountdown: c.showCountdown,
      discountPercent: c.discountPercent > 0 ? c.discountPercent : undefined,
    }));
  const slides = campaignSlides.length > 0 ? campaignSlides : [FALLBACK_SLIDE];

  const topOffer = campaigns.find((c) => c.discountPercent > 0) ?? null;
  const featured = (featuredRes.success && featuredRes.data) || [];
  const categories = (categoriesRes.success && categoriesRes.data) || [];

  return (
    <>
      <CampaignHero slides={slides} />
      <TrustBar />

      <CategoryTiles categories={categories} />

      {topOffer && (
        <div className="pb-4">
          <OffersStrip campaign={topOffer} />
        </div>
      )}

      {/* Destacados */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <FadeIn>
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-semibold text-hanna-600 uppercase tracking-[0.18em] mb-2">
                  Selección Hanna
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-cream-900 text-balance">
                  Destacados de la semana
                </h2>
              </div>
              <Link
                href="/productos"
                className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-hanna-600 hover:underline shrink-0"
              >
                Ver todo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </FadeIn>

          <StaggerGroup className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {featured.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} />
              </StaggerItem>
            ))}
          </StaggerGroup>

          <div className="mt-8 text-center sm:hidden">
            <Link href="/productos">
              <Button variant="outline">Ver todos los productos</Button>
            </Link>
          </div>
        </section>
      )}

      <SplitFeature />
      <ReviewsStrip reviews={reviews} />
      <NewsletterSection />
    </>
  );
}
