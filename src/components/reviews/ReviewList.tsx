"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";

type Review = {
  id: string;
  name: string;
  rating: number;
  title: string | null;
  body: string;
  isVerified: boolean;
  createdAt: string;
};

type ReviewListProps = {
  productSlug?: string;
  limit?: number;
  locale: string;
};

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

export function ReviewList({ productSlug, limit = 6, locale }: ReviewListProps) {
  const isEs = locale === "es";
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams();
    if (productSlug) params.set("product", productSlug);
    params.set("limit", limit.toString());

    fetch(`/api/reviews?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews);
        setAvgRating(data.avgRating);
        setTotalCount(data.totalCount);
      })
      .catch(() => {});
  }, [productSlug, limit]);

  if (reviews.length === 0) return null;

  return (
    <div>
      {/* Summary */}
      <div className="flex items-center gap-3 mb-6">
        <Stars rating={Math.round(avgRating)} />
        <span className="font-heading text-heading font-bold text-lg">{avgRating}</span>
        <span className="text-body-muted text-sm">
          ({totalCount} {totalCount === 1 ? (isEs ? "reseña" : "review") : (isEs ? "reseñas" : "reviews")})
        </span>
      </div>

      {/* Review cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-card border border-border p-5">
            <div className="flex items-center justify-between mb-2">
              <Stars rating={review.rating} />
              {review.isVerified && (
                <Badge variant="success">
                  {isEs ? "Paciente Verificado" : "Verified Patient"}
                </Badge>
              )}
            </div>
            {review.title && (
              <h3 className="font-heading text-heading font-semibold mb-1">
                {review.title}
              </h3>
            )}
            <p className="text-body text-sm leading-relaxed mb-3">{review.body}</p>
            <p className="text-body-muted text-xs">
              — {review.name} •{" "}
              {new Date(review.createdAt).toLocaleDateString(locale === "es" ? "es-US" : "en-US", {
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
