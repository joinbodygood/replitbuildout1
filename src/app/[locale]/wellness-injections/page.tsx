"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import {
  Syringe, Truck, ChevronDown, ChevronUp, Star, Zap, Flame,
  Shield, Moon, Dumbbell, Leaf, Package, ArrowRight,
} from "lucide-react";

// ─── Static product catalog (client-side) ────────────────────────────────────
const CATALOG = [
  {
    handle: "lipotropic-super-b",
    name: "Lipotropic Super B Injection",
    nameEs: "Inyección Lipotrópica Super B",
    short: "11-ingredient energy and metabolism powerhouse — B12, B-complex, L-Carnitine, and fat-burning lipotropics in one shot.",
    shortEs: "Potente fórmula de 11 ingredientes para energía y metabolismo.",
    long: "Our most comprehensive energy injection. Lipotropic Super B combines Methionine, Inositol, and Choline (the classic MIC fat-burners) with L-Carnitine, Methylcobalamin (B12), Niacin, Dexpanthenol, Pyridoxal 5-Phosphate, Riboflavin, and Thiamine. This is the upgrade from a basic B12 shot — patients feel the difference immediately. Supports fat metabolism, energy production, focus, and immune function.",
    price1mo: 129,
    price3mo: 99,
    supply1mo: "10mL vial",
    supply3mo: "30mL vial (12-week supply)",
    concentration: null,
    featured: true,
    badge: "Most Popular",
    tags: ["energy", "metabolism", "fat-burning"],
    benefitTags: ["Energy & Metabolism", "Fat-Burning", "B-Vitamin Complex"],
    icon: Zap,
    iconColor: "#f59e0b",
    pairs: ["glutathione", "l-carnitine"],
    frequency: "Weekly self-administered sub-Q injection",
    includes: "10mL or 30mL vial, syringes, needles, alcohol swabs",
  },
  {
    handle: "nad-plus",
    name: "NAD+ Injection",
    nameEs: "Inyección de NAD+",
    short: "Cellular energy powerhouse — 100mg/mL NAD+ for anti-aging, metabolic health, and deep energy restoration.",
    shortEs: "Potencia energética celular — NAD+ 100mg/mL para anti-envejecimiento y salud metabólica.",
    long: "NAD+ (Nicotinamide Adenine Dinucleotide) is a coenzyme found in every living cell and essential for energy metabolism. As we age — and especially during weight loss — NAD+ levels decline. Our injections restore cellular NAD+ directly, supporting mitochondrial function, DNA repair, and metabolic efficiency. Patients report dramatically improved energy, mental clarity, and faster recovery.",
    price1mo: 199,
    price3mo: null,
    supply1mo: "10mL vial",
    supply3mo: null,
    concentration: "100mg/mL",
    featured: true,
    badge: "Premium",
    tags: ["longevity", "anti-aging", "energy"],
    benefitTags: ["Cellular Energy", "Anti-Aging", "Mental Clarity"],
    icon: Star,
    iconColor: "#8b5cf6",
    pairs: ["sermorelin", "glutathione"],
    frequency: "2–3x per week sub-Q injection",
    includes: "10mL vial, syringes, needles, alcohol swabs",
  },
  {
    handle: "sermorelin",
    name: "Sermorelin Injection",
    nameEs: "Inyección de Sermorelina",
    short: "Growth hormone peptide — combats muscle loss during weight loss, improves sleep quality and recovery.",
    shortEs: "Péptido de hormona de crecimiento — combate la pérdida muscular y mejora el sueño y la recuperación.",
    long: "Sermorelin is a growth hormone releasing peptide (GHRP) that stimulates your pituitary gland to produce more of your own natural growth hormone. Unlike synthetic HGH, Sermorelin works with your body's natural feedback systems. During weight loss, growth hormone levels often decline — Sermorelin helps maintain muscle mass, improve sleep quality, and speed recovery. At 1.5mg/mL, our formulation is at the therapeutic sweet spot.",
    price1mo: 179,
    price3mo: null,
    supply1mo: "6mL vial",
    supply3mo: null,
    concentration: "1.5mg/mL",
    featured: true,
    badge: "Peptide",
    tags: ["anti-aging", "recovery", "sleep"],
    benefitTags: ["Sleep & Recovery", "Muscle Preservation", "Anti-Aging"],
    icon: Moon,
    iconColor: "#6366f1",
    pairs: ["nad-plus", "l-carnitine"],
    frequency: "Daily sub-Q injection at bedtime",
    includes: "6mL vial, syringes, needles, alcohol swabs",
  },
  {
    handle: "glutathione",
    name: "Glutathione Injection",
    nameEs: "Inyección de Glutatión",
    short: "The \"master antioxidant\" — supports detox, skin radiance, and cellular health during weight loss.",
    shortEs: "El \"antioxidante maestro\" — apoya la desintoxicación, luminosidad de piel y salud celular.",
    long: "Glutathione is the body's most powerful antioxidant, naturally produced in every cell. During weight loss, your body releases stored toxins from fat cells — glutathione helps your liver process and eliminate them. Patients report brighter skin, more energy, and faster recovery. At 200mg/mL in a 30mL vial, our formulation provides a full month of consistent support. Pairs perfectly with any GLP-1 program.",
    price1mo: 149,
    price3mo: null,
    supply1mo: "30mL vial",
    supply3mo: null,
    concentration: "200mg/mL",
    featured: true,
    badge: "Detox & Skin",
    tags: ["detox", "skin", "antioxidant"],
    benefitTags: ["Detox Support", "Skin Radiance", "Antioxidant"],
    icon: Leaf,
    iconColor: "#10b981",
    pairs: ["lipotropic-super-b", "nad-plus"],
    frequency: "2–3x per week sub-Q injection",
    includes: "30mL vial, syringes, needles, alcohol swabs",
  },
  {
    handle: "l-carnitine",
    name: "L-Carnitine Injection",
    nameEs: "Inyección de L-Carnitina",
    short: "Amino acid that shuttles fat into cells for energy — supports fat burning and muscle preservation during weight loss.",
    shortEs: "Aminoácido que transporta grasa a las células para energía y preservación muscular.",
    long: "L-Carnitine (Levocarnitine) is an amino acid that plays a critical role in fat metabolism. It transports fatty acids into your cells' mitochondria where they're burned for energy. During weight loss, L-Carnitine helps ensure your body is burning fat — not muscle. Patients report better energy during workouts, faster recovery, and improved body composition. A must-add for patients who are exercising alongside their GLP-1 program.",
    price1mo: 99,
    price3mo: null,
    supply1mo: "10mL vial",
    supply3mo: null,
    concentration: "500mg/mL",
    featured: false,
    badge: null,
    tags: ["fat-burning", "energy", "muscle"],
    benefitTags: ["Fat Burning", "Muscle Preservation", "Workout Support"],
    icon: Dumbbell,
    iconColor: "#f97316",
    pairs: ["lipotropic-super-b", "sermorelin"],
    frequency: "2–3x per week sub-Q injection",
    includes: "10mL vial, syringes, needles, alcohol swabs",
  },
  {
    handle: "lipo-c",
    name: "Lipo-C Injection",
    nameEs: "Inyección Lipo-C",
    short: "Fat-burning lipotropic blend — MIC + L-Carnitine + Thiamine for enhanced metabolism.",
    shortEs: "Mezcla lipotrópica quema-grasa — MIC + L-Carnitina + Tiamina para metabolismo mejorado.",
    long: "Lipo-C is our upgraded fat-burning injection. It starts with the proven MIC formula (Methionine, Inositol, Choline) and adds L-Carnitine for enhanced fat transport into cells for energy, plus Thiamine and Dexpanthenol for metabolism support. More effective than a basic MIC shot — designed to complement your GLP-1 medication for maximum results.",
    price1mo: 99,
    price3mo: null,
    supply1mo: "10mL vial",
    supply3mo: null,
    concentration: null,
    featured: false,
    badge: null,
    tags: ["fat-burning", "metabolism"],
    benefitTags: ["Fat-Burning", "Metabolism Boost", "MIC + L-Carnitine"],
    icon: Flame,
    iconColor: "#ef4444",
    pairs: ["l-carnitine", "vitamin-b12"],
    frequency: "2–3x per week sub-Q injection",
    includes: "10mL vial, syringes, needles, alcohol swabs",
  },
  {
    handle: "vitamin-b12",
    name: "Vitamin B12 Injection",
    nameEs: "Inyección de Vitamina B12",
    short: "Medical-grade Methylcobalamin — the active, bioavailable form of B12 that supports energy, metabolism, and nerve function.",
    shortEs: "Metilcobalamina de grado médico — la forma activa y biodisponible de B12.",
    long: "Vitamin B12 is essential for energy production, red blood cell formation, and nervous system health. Many patients on calorie-restricted diets or GLP-1 medications experience lower B12 levels. Our injection uses Methylcobalamin — the active, bioavailable form your body can use immediately (not the synthetic cyanocobalamin found in cheap supplements). Patients commonly report improved energy, better mood, and reduced brain fog within days.",
    price1mo: 59,
    price3mo: null,
    supply1mo: "10mL vial",
    supply3mo: null,
    concentration: "1mg/mL",
    featured: false,
    badge: null,
    tags: ["energy", "metabolism", "b12"],
    benefitTags: ["Energy", "Metabolism", "Nerve Function"],
    icon: Zap,
    iconColor: "#06b6d4",
    pairs: ["lipotropic-super-b", "glutathione"],
    frequency: "Weekly sub-Q injection",
    includes: "10mL vial, syringes, needles, alcohol swabs",
  },
];

const HANDLE_MAP = Object.fromEntries(CATALOG.map((p) => [p.handle, p]));

// ─── Bundle definitions ───────────────────────────────────────────────────────
const BUNDLES = [
  {
    id: "glow",
    name: "Body Good Glow",
    nameEs: "Body Good Glow",
    products: ["glutathione", "vitamin-b12"],
    price: 179,
    savings: 29,
    tagline: "Detox + energy. The inside-out glow-up.",
  },
  {
    id: "fat-burner",
    name: "Fat Burner Stack",
    nameEs: "Paquete Quema-Grasa",
    products: ["lipo-c", "l-carnitine"],
    price: 169,
    savings: 29,
    tagline: "Double fat-burning power — MIC + L-Carnitine.",
  },
  {
    id: "ultimate",
    name: "Ultimate Wellness",
    nameEs: "Bienestar Ultimate",
    products: ["glutathione", "lipotropic-super-b", "nad-plus"],
    price: 399,
    savings: 78,
    tagline: "Detox + energy + cellular optimization. The full stack.",
  },
  {
    id: "performance",
    name: "Performance Pack",
    nameEs: "Paquete Performance",
    products: ["sermorelin", "l-carnitine", "vitamin-b12"],
    price: 299,
    savings: 38,
    tagline: "Sleep, recovery, and fat-burning for active patients.",
  },
];

// ─── Product card ─────────────────────────────────────────────────────────────
function ProductCard({
  product, recommended, locale,
}: {
  product: typeof CATALOG[0];
  recommended: boolean;
  locale: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const isEs = locale === "es";
  const Icon = product.icon;

  const crossSells = product.pairs
    .map((h) => HANDLE_MAP[h])
    .filter(Boolean)
    .slice(0, 2);

  return (
    <div className={`rounded-2xl border-2 bg-white transition-shadow hover:shadow-lg ${
      recommended ? "border-[#ed1b1b]" : "border-gray-100"
    }`}>
      {/* Card header */}
      <div className="p-6">
        {/* Badges row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-wrap gap-2">
            {recommended && (
              <span className="text-xs font-bold text-white px-3 py-1 rounded-full" style={{ backgroundColor: "#ed1b1b" }}>
                Recommended For You
              </span>
            )}
            {product.badge && !recommended && (
              <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {product.badge}
              </span>
            )}
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ml-2"
            style={{ backgroundColor: `${product.iconColor}18` }}
          >
            <Icon size={20} style={{ color: product.iconColor }} />
          </div>
        </div>

        {/* Product name */}
        <h3 className="font-heading text-xl font-bold text-gray-900 mb-2">
          {isEs ? product.nameEs : product.name}
        </h3>

        {/* Short description */}
        <p className="text-gray-500 text-sm mb-4 leading-relaxed">
          {isEs ? product.shortEs : product.short}
        </p>

        {/* Benefit tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {product.benefitTags.map((tag) => (
            <span key={tag} className="text-xs font-medium text-gray-600 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {/* Pricing */}
        <div className="mb-5">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">${product.price1mo}</span>
            <span className="text-gray-400 text-sm">/mo</span>
          </div>
          {product.price3mo && (
            <p className="text-xs text-gray-400 mt-0.5">
              or <span className="font-semibold text-green-600">${product.price3mo}/mo</span> with 3-month supply ({product.supply3mo})
            </p>
          )}
          <p className="text-xs text-gray-400 mt-0.5">{product.supply1mo}</p>
        </div>

        {/* Shipping notice */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
          <Truck size={13} />
          <span>Ships via UPS Overnight with supplies included</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors border border-gray-200 rounded-full px-4 py-2.5"
          >
            Learn More {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <a
            href={`/${locale}/quiz`}
            className="flex-1 text-center py-2.5 rounded-full text-sm font-bold text-white flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#ed1b1b" }}
          >
            Add to Program <ArrowRight size={14} />
          </a>
        </div>
      </div>

      {/* Expanded "Learn More" section */}
      {expanded && (
        <div className="border-t border-gray-100 p-6 bg-gray-50 rounded-b-2xl space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-1">Full Clinical Description</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{product.long}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="font-semibold text-gray-700 mb-0.5">What&apos;s included</p>
              <p className="text-gray-500">{product.includes}</p>
            </div>
            {product.concentration && (
              <div>
                <p className="font-semibold text-gray-700 mb-0.5">Concentration</p>
                <p className="text-gray-500">{product.concentration}</p>
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-700 mb-0.5">How to use</p>
              <p className="text-gray-500">{product.frequency}. Injection guide included.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-0.5">Shipping</p>
              <p className="text-gray-500">UPS Standard Overnight — $24 (or $15 for TX/OK)</p>
            </div>
          </div>

          {crossSells.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Pairs well with</p>
              <div className="flex gap-2 flex-wrap">
                {crossSells.map((cs) => (
                  <span key={cs.handle} className="text-xs font-medium text-[#ed1b1b] bg-[#fde7e7] px-3 py-1 rounded-full">
                    {cs.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Bundle card ──────────────────────────────────────────────────────────────
function BundleCard({ bundle, locale }: { bundle: typeof BUNDLES[0]; locale: string }) {
  const isEs = locale === "es";
  const bundleProducts = bundle.products.map((h) => HANDLE_MAP[h]).filter(Boolean);

  return (
    <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-6 hover:border-[#ed1b1b]/40 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xs font-bold text-white px-3 py-1 rounded-full bg-gray-800 mb-2 inline-block">
            Bundle &amp; Save
          </span>
          <h3 className="font-heading text-lg font-bold text-gray-900">
            {isEs ? bundle.nameEs : bundle.name}
          </h3>
        </div>
        <Package size={22} className="text-gray-300 shrink-0 mt-1" />
      </div>

      <p className="text-sm text-gray-500 mb-4">{bundle.tagline}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {bundleProducts.map((p) => (
          <span key={p.handle} className="text-xs font-medium text-gray-700 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
            {p.name}
          </span>
        ))}
      </div>

      <div className="flex items-baseline gap-3 mb-4">
        <div>
          <span className="text-2xl font-bold text-gray-900">${bundle.price}</span>
          <span className="text-gray-400 text-sm">/mo</span>
        </div>
        <span className="text-sm font-semibold text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full">
          Save ${bundle.savings}/mo
        </span>
      </div>

      <a
        href={`/${locale}/quiz`}
        className="w-full block text-center py-3 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: "#ed1b1b" }}
      >
        Get This Bundle
      </a>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function WellnessInjectionsPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isEs = locale === "es";

  const recParam = searchParams?.get("rec") || "";
  const fromQuiz = searchParams?.get("from") === "quiz";

  const [recommendedHandles, setRecommendedHandles] = useState<string[]>([]);

  useEffect(() => {
    if (recParam) {
      setRecommendedHandles(recParam.split(",").filter((h) => HANDLE_MAP[h]));
    }
  }, [recParam]);

  // Sort products: recommended first, then featured, then by original order
  const sortedProducts = [...CATALOG].sort((a, b) => {
    const aRec = recommendedHandles.includes(a.handle);
    const bRec = recommendedHandles.includes(b.handle);
    if (aRec && !bRec) return -1;
    if (!aRec && bRec) return 1;
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#fdf6f0]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#fde7e7] flex items-center justify-center mx-auto mb-5">
            <Syringe size={26} className="text-[#ed1b1b]" />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {isEs ? "Inyecciones de Bienestar" : "Wellness Injections"}
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto text-lg mb-3">
            {isEs
              ? "Inyecciones de grado médico para complementar tu programa de salud. Todo enviado directo a tu puerta."
              : "Medical-grade injections to complement your health journey. All options ship directly to your door."}
          </p>
          <p className="text-sm text-gray-400 max-w-lg mx-auto">
            {isEs
              ? "Cada inyección incluye suministros (agujas, jeringas, hisopos de alcohol) y viene con supervisión médica."
              : "Every injection includes supplies (needles, syringes, alcohol swabs) and comes with provider oversight."}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Quiz result banner or quiz CTA */}
        {fromQuiz && recommendedHandles.length > 0 ? (
          <div className="bg-[#fde7e7] border border-[#ed1b1b]/20 rounded-2xl p-5 mb-8 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#ed1b1b] flex items-center justify-center shrink-0 mt-0.5">
              <Syringe size={18} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                Based on your quiz results, here&apos;s what we recommend for you:
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Your top picks are highlighted below. Products are sorted to match your goals.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-8 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-semibold text-gray-900 text-sm mb-0.5">
                Not sure which injection is right for you?
              </p>
              <p className="text-xs text-gray-400">Answer 5 quick questions and get a personalized recommendation.</p>
            </div>
            <Link
              href={`/${locale}/quiz/wellness-injections`}
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#ed1b1b" }}
            >
              Take the 2-min quiz <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Shipping notice */}
        <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-5 py-3 mb-8 text-sm text-gray-500">
          <Truck size={16} className="text-gray-400 shrink-0" />
          <span>
            All wellness injections ship via <strong className="text-gray-700">UPS Standard Overnight</strong> from our pharmacy partner.
            Shipping: <strong className="text-gray-700">$24</strong> (or <strong className="text-gray-700">$15</strong> for TX/OK).
            Injectable supplies included with every order.
          </span>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.handle}
              product={product}
              recommended={recommendedHandles.includes(product.handle)}
              locale={locale}
            />
          ))}
        </div>

        {/* Bundles section */}
        <div className="border-t border-gray-200 pt-12">
          <div className="text-center mb-8">
            <p className="text-xs font-bold text-[#ed1b1b] uppercase tracking-widest mb-2">Save more</p>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {isEs ? "Ahorra con un Bundle" : "Save with a Bundle"}
            </h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              {isEs
                ? "Combinaciones de probada efectividad clínica a nuestro mejor precio."
                : "Clinically-proven combinations at our best value. Curated by Dr. Moleon, MD."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {BUNDLES.map((bundle) => (
              <BundleCard key={bundle.id} bundle={bundle} locale={locale} />
            ))}
          </div>
        </div>

        {/* Footer disclaimer */}
        <div className="mt-12 border-t border-gray-100 pt-8 text-xs text-gray-400 leading-relaxed text-center max-w-2xl mx-auto">
          All wellness injections require a provider consultation and approval. These products are compounded
          pharmaceuticals dispensed by our licensed pharmacy partner. Wellness injections are not covered by
          insurance. Results vary based on individual health status, lifestyle, and adherence.
          Created by Dr. Linda Moleon, MD — double board-certified in obesity medicine and anesthesiology.
          No PHI is collected by this tool.
        </div>
      </div>
    </div>
  );
}
