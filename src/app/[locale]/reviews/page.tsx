import { setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { Star, BadgeCheck, Pin } from "lucide-react";

type Props = { params: Promise<{ locale: string }> };

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= rating ? "fill-yellow-400 text-yellow-400" : "fill-[#E5E5E5] text-[#E5E5E5]"}
        />
      ))}
    </div>
  );
}

export default async function ReviewsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isEs = locale === "es";

  const reviews = await db.review.findMany({
    where: { isApproved: true },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 100,
  });

  const stats = await db.review.aggregate({
    where: { isApproved: true },
    _avg:   { rating: true },
    _count: { id: true },
  });

  const avgRating  = Math.round((stats._avg.rating || 0) * 10) / 10;
  const totalCount = stats._count.id;

  return (
    <>
      <section className="py-16 bg-brand-pink-soft">
        <Container narrow>
          <div className="text-center">
            <h1 className="font-heading text-heading text-4xl font-bold mb-4">
              {isEs ? "Lo Que Dicen Nuestros Pacientes" : "What Our Patients Say"}
            </h1>
            {avgRating > 0 && (
              <div className="flex items-center justify-center gap-3 mt-3">
                <Stars rating={Math.round(avgRating)} size={20} />
                <span className="font-heading text-heading text-xl font-bold">{avgRating}</span>
                <span className="text-body-muted">
                  / 5 · {totalCount.toLocaleString()} {isEs ? "reseñas" : "reviews"}
                </span>
              </div>
            )}
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className={`rounded-card border p-6 flex flex-col gap-3 ${
                  review.isFeatured ? "border-brand-red/30 shadow-sm" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <Stars rating={review.rating} />
                  {review.isFeatured && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-brand-red bg-brand-pink-soft px-2 py-0.5 rounded-full">
                      <Pin size={9} />
                      {isEs ? "Destacado" : "Featured"}
                    </span>
                  )}
                </div>
                {review.title && (
                  <h3 className="font-heading text-heading font-semibold text-sm">{review.title}</h3>
                )}
                <p className="text-body-muted text-sm leading-relaxed flex-1">{review.body}</p>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-heading">— {review.name}</span>
                    {review.isVerified && (
                      <span className="flex items-center gap-0.5 text-[10px] text-success font-medium">
                        <BadgeCheck size={11} />
                        {isEs ? "Verificado" : "Verified"}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-body-muted">
                    {new Date(review.createdAt).toLocaleDateString(
                      locale === "es" ? "es-US" : "en-US",
                      { month: "short", year: "numeric" }
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
