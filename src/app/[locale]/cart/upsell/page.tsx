"use client";

import { useCart } from "@/context/CartContext";
import { useLocale } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { Check, ShieldCheck, Package, Star } from "lucide-react";

const UPSELLS = [
  {
    id: "upsell-ongoing-care",
    productId: "branded-rx-management",
    variantId: "upsell-bmgmt-1mo",
    slug: "branded-rx-management",
    name: "Ongoing Care Plan",
    tagline: "Monthly provider check-ins + messaging access",
    priceDisplay: "+$55/mo",
    priceInCents: 5500,
    variantLabel: "1-Month Ongoing Care",
    bullets: [
      "Unlimited messaging with your provider",
      "Monthly dose check-in & adjustments",
      "Priority support — skip the wait",
    ],
    badge: "Most Popular Add-On",
  },
  {
    id: "upsell-insurance-check",
    productId: "insurance-eligibility-check",
    variantId: "upsell-ins-elig",
    slug: "insurance-eligibility-check",
    name: "Insurance Coverage Check",
    tagline: "Find out if your plan covers GLP-1 or other meds",
    priceDisplay: "+$25",
    priceInCents: 2500,
    variantLabel: "One-Time Check",
    bullets: [
      "We check your insurance on your behalf",
      "Results delivered within 24 hours",
      "If covered, we help you switch — no extra fee",
    ],
    badge: "Save Hundreds/Month",
  },
];

export default function UpsellPage() {
  const { items, total, itemCount } = useCart();
  const locale = useLocale();
  const isEs = locale === "es";

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const cartItemNames = items.map((i) => i.name).join(", ");

  return (
    <>
      <section className="py-10 bg-brand-pink-soft">
        <Container narrow>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white border border-brand-red text-brand-red rounded-pill px-4 py-1.5 text-sm font-semibold mb-4">
              <ShieldCheck size={16} />
              {isEs ? "¡Agregado al carrito!" : "Added to cart!"}
            </div>
            <h1 className="font-heading text-heading text-2xl md:text-3xl font-bold mb-2">
              {isEs
                ? "¿Quieres mejores resultados?"
                : "Want to get better results, faster?"}
            </h1>
            <p className="text-body-muted">
              {isEs
                ? "Muchos de nuestros pacientes agregan estos complementos a sus planes."
                : "Most of our patients add at least one of these to their plan."}
            </p>
          </div>
        </Container>
      </section>

      {itemCount > 0 && (
        <section className="py-5 border-b border-border bg-surface-dim">
          <Container narrow>
            <div className="flex items-center gap-3 text-sm text-body-muted">
              <Package size={16} className="text-brand-red flex-shrink-0" />
              <span>
                <span className="font-semibold text-heading">
                  {isEs ? "Tu carrito:" : "In your cart:"}
                </span>{" "}
                {cartItemNames} — {formatPrice(total)}
              </span>
            </div>
          </Container>
        </section>
      )}

      <section className="py-10">
        <Container narrow>
          <h2 className="font-heading text-heading text-xl font-bold mb-1">
            {isEs ? "Complementos recomendados" : "Recommended add-ons"}
          </h2>
          <p className="text-body-muted text-sm mb-6">
            {isEs
              ? "Selecciona cualquiera para agregarlo a tu pedido."
              : "Select any to add to your order. Skip anytime."}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
            {UPSELLS.map((upsell) => (
              <UpsellCard key={upsell.id} upsell={upsell} locale={locale} />
            ))}
          </div>

          <div className="bg-surface-dim rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-1">
                <Star size={16} className="text-brand-red" />
                <span className="font-heading font-semibold text-heading text-sm">
                  {isEs ? "Satisfecho con tu selección?" : "Happy with your selection?"}
                </span>
              </div>
              <p className="text-body-muted text-sm">
                {isEs
                  ? "Procede al pago. Puedes agregar complementos más tarde."
                  : "Proceed to checkout. You can add these later any time."}
              </p>
            </div>
            <div className="flex-shrink-0 flex flex-col gap-2 w-full sm:w-auto min-w-[180px]">
              <Button href={`/${locale}/checkout`} size="lg" className="w-full">
                {isEs ? `Pagar — ${formatPrice(total)}` : `Checkout — ${formatPrice(total)}`}
              </Button>
              <Button href={`/${locale}/cart`} size="sm" variant="ghost" className="w-full text-center">
                {isEs ? "Ver carrito" : "View cart"}
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

function UpsellCard({
  upsell,
  locale,
}: {
  upsell: (typeof UPSELLS)[0];
  locale: string;
}) {
  const isEs = locale === "es";

  return (
    <div className="rounded-2xl border-2 border-border bg-white flex flex-col overflow-hidden hover:border-brand-red hover:shadow-card-hover transition-all duration-200">
      <div className="bg-brand-red px-5 py-2">
        <span className="text-white font-heading font-semibold text-xs uppercase tracking-wide">
          {upsell.badge}
        </span>
      </div>

      <div className="px-6 pt-5 pb-2">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-heading text-heading text-lg font-bold">{upsell.name}</h3>
          <span className="font-heading font-bold text-brand-red text-lg flex-shrink-0">
            {upsell.priceDisplay}
          </span>
        </div>
        <p className="text-body-muted text-sm mt-0.5">{upsell.tagline}</p>
      </div>

      <div className="px-6 py-4 flex-grow">
        <div className="space-y-1.5">
          {upsell.bullets.map((b, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <Check size={14} className="text-brand-red flex-shrink-0 mt-0.5" />
              <span className="text-body">{b}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 pb-5">
        <AddToCartButton
          productId={upsell.productId}
          variantId={upsell.variantId}
          name={upsell.name}
          variantLabel={upsell.variantLabel}
          price={upsell.priceInCents}
          slug={upsell.slug}
          redirectToUpsell={false}
          label={isEs ? `Agregar — ${upsell.priceDisplay}` : `Add — ${upsell.priceDisplay}`}
        />
      </div>
    </div>
  );
}
