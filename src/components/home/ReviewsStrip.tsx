import { StarRating } from "@/components/ui/star-rating";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion";

export interface HomeReview {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  productName?: string;
}

/**
 * Reseñas REALES aprobadas desde la base de datos. Si no hay, la sección
 * no existe — cero testimonios inventados.
 */
export function ReviewsStrip({ reviews }: { reviews: HomeReview[] }) {
  if (reviews.length === 0) return null;

  return (
    <section className="bg-white border-y border-cream-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <FadeIn>
          <p className="text-xs font-semibold text-hanna-600 uppercase tracking-[0.18em] mb-2 text-center">
            Clientes reales
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-cream-900 text-center text-balance mb-10">
            Lo que dicen de nosotros
          </h2>
        </FadeIn>

        <StaggerGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.slice(0, 6).map((review) => (
            <StaggerItem key={review.id}>
              <figure className="h-full bg-cream-50 border border-cream-200 rounded-2xl p-5 flex flex-col">
                <StarRating rating={review.rating} size="sm" />
                <blockquote className="mt-3 text-sm text-cream-700 leading-relaxed flex-1 line-clamp-4">
                  “{review.comment}”
                </blockquote>
                <figcaption className="mt-4 text-xs text-cream-500">
                  <span className="font-semibold text-cream-700">{review.userName}</span>
                  {review.productName && <> · {review.productName}</>}
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
