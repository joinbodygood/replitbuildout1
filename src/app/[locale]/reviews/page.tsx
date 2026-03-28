import { setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";

type Props = { params: Promise<{ locale: string }> };

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= rating ? "text-[#FFC107]" : "text-border"}>
          ★
        </span>
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
    orderBy: { createdAt: "desc" },
  });

  const stats = await db.review.aggregate({
    where: { isApproved: true },
    _avg: { rating: true },
    _count: true,
  });

  const avgRating = Math.round((stats._avg.rating || 0) * 10) / 10;

  return (
    <>
      <section className="py-16 bg-brand-pink-soft">
        <Container narrow>
          <div className="text-center">
            <h1 className="font-heading text-heading text-4xl font-bold mb-4">
              {isEs ? "Lo Que Dicen Nuestros Pacientes" : "What Our Patients Say"}
            </h1>
            <div className="flex items-center justify-center gap-3">
              <Stars rating={Math.round(avgRating)} />
              <span className="font-heading text-heading text-xl font-bold">{avgRating}</span>
              <span className="text-body-muted">
                ({stats._count} {isEs ? "reseñas" : "reviews"})
              </span>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-card border border-border p-6">
                <div className="flex items-center justify-between mb-3">
                  <Stars rating={review.rating} />
                  {review.isVerified && (
                    <Badge variant="success">
                      {isEs ? "Verificado" : "Verified"}
                    </Badge>
                  )}
                </div>
                {review.title && (
                  <h3 className="font-heading text-heading font-semibold mb-2">
                    {review.title}
                  </h3>
                )}
                <p className="text-body text-sm leading-relaxed mb-3">{review.body}</p>
                <p className="text-body-muted text-xs">
                  — {review.name} •{" "}
                  {new Date(review.createdAt).toLocaleDateString(
                    locale === "es" ? "es-US" : "en-US",
                    { month: "short", year: "numeric" }
                  )}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
