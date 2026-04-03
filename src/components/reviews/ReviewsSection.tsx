"use client";

import { useEffect, useState } from "react";
import { Star, BadgeCheck, Pin } from "lucide-react";

type Review = {
  id: string;
  name: string;
  rating: number;
  title: string | null;
  body: string;
  isVerified: boolean;
  isFeatured: boolean;
  productSlug: string | null;
  createdAt: string;
};

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
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

function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.createdAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
  return (
    <div className={`bg-white rounded-card border p-5 flex flex-col gap-3 ${review.isFeatured ? "border-brand-red/30 shadow-sm" : "border-border"}`}>
      <div className="flex items-start justify-between gap-2">
        <StarRow rating={review.rating} />
        {review.isFeatured && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-brand-red bg-brand-pink-soft px-2 py-0.5 rounded-full">
            <Pin size={9} />
            Featured
          </span>
        )}
      </div>
      {review.title && (
        <p className="font-heading font-semibold text-heading text-sm">{review.title}</p>
      )}
      <p className="text-body-muted text-sm leading-relaxed line-clamp-4">{review.body}</p>
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-heading">{review.name}</span>
          {review.isVerified && (
            <span className="flex items-center gap-0.5 text-[10px] text-success font-medium">
              <BadgeCheck size={11} />
              Verified
            </span>
          )}
        </div>
        <span className="text-xs text-body-muted">{date}</span>
      </div>
    </div>
  );
}

type Props = {
  productSlug?: string;
  siteWide?: boolean;
  limit?: number;
  title?: string;
  subtitle?: string;
  isEs?: boolean;
};

export function ReviewsSection({
  productSlug,
  siteWide = false,
  limit = 8,
  title,
  subtitle,
  isEs = false,
}: Props) {
  const [reviews,   setReviews]   = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [total,     setTotal]     = useState(0);
  const [loaded,    setLoaded]    = useState(false);

  useEffect(() => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (productSlug) params.set("product", productSlug);
    if (siteWide)    params.set("siteWide", "true");
    fetch(`/api/reviews?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setReviews(d.reviews ?? []);
        setAvgRating(d.avgRating ?? 0);
        setTotal(d.totalCount ?? 0);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [productSlug, siteWide, limit]);

  if (loaded && reviews.length === 0) return null;

  const heading = title ?? (isEs ? "Lo que dicen nuestros pacientes" : "What our patients say");
  const sub     = subtitle ?? (isEs
    ? `${total.toLocaleString()} opiniones verificadas`
    : `${total.toLocaleString()} verified reviews`);

  return (
    <section className="py-12">
      <div className="text-center mb-8">
        <h2 className="font-heading font-bold text-2xl text-heading">{heading}</h2>
        {avgRating > 0 && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <StarRow rating={Math.round(avgRating)} size={18} />
            <span className="font-heading font-bold text-heading">{avgRating}</span>
            <span className="text-body-muted text-sm">/ 5 · {sub}</span>
          </div>
        )}
      </div>

      {!loaded ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-[#F3F3F3] rounded-card animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
        </div>
      )}
    </section>
  );
}
