"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import {
  CheckCircle2,
  ShieldCheck,
  Lock,
  Truck,
  Syringe,
  Zap,
  Leaf,
  Flame,
  Dumbbell,
  Star,
  Moon,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

// ─── Price tier type ───────────────────────────────────────────────────────

interface PriceTier {
  months: 1 | 3 | 6;
  label: string;
  price: number;   // $/mo
  total: number;   // total charged
  savePct?: number;
}

// ─── Product catalog ───────────────────────────────────────────────────────

interface ProductDef {
  sku: string;
  name: string;
  badge?: string;
  bestFor: string;
  /** Short description used in the goal-match summary card */
  description: string;
  /** Full clinical "what it does" paragraph */
  clinical: string;
  /** How it is administered */
  method: string;
  frequency: string;
  includes: string;
  concentration?: string;
  tiers: PriceTier[];
  benefitTags: string[];
  iconColor: string;
  pairsWell: string[];
  /** Goal-specific descriptions keyed by `${goal}` or `${goal}:${concern}` */
  goalDescriptions: Record<string, string>;
  /** Why-recommended text keyed by `${goal}` or `${goal}:${concern}` */
  whyText: Record<string, string>;
}

const PRODUCTS: Record<string, ProductDef> = {
  "lipo-c": {
    sku: "WI-LIPOC",
    name: "Lipo-C Injectable",
    bestFor: "Fat burning & metabolic acceleration",
    description: "MIC + L-Carnitine + Thiamine — proven fat-burning lipotropic blend.",
    clinical:
      "Lipo-C combines the classic MIC formula (Methionine, Inositol, Choline) with L-Carnitine for enhanced fat transport and Thiamine for metabolic support. A step up from a basic lipotropic shot — designed to maximize fat metabolism, especially when paired with a diet or exercise program.",
    method: "Self-administered subcutaneous (sub-Q) injection",
    frequency: "2–3× per week",
    includes: "10mL vial, syringes, needles, alcohol swabs, injection guide",
    concentration: "MIC + 200mg/mL L-Carnitine",
    tiers: [
      { months: 1, label: "1-Month", price: 99,  total: 99 },
      { months: 3, label: "3-Month", price: 79,  total: 237, savePct: 20 },
      { months: 6, label: "6-Month", price: 69,  total: 414, savePct: 30 },
    ],
    benefitTags: ["Fat Burning", "Metabolism Boost", "MIC Formula", "Energy"],
    iconColor: "#ef4444",
    pairsWell: ["L-Carnitine Injectable", "Methylcobalamin (B12) Injectable"],
    goalDescriptions: {
      "fat-burning":
        "Lipo-C accelerates fat metabolism with the proven MIC lipotropic formula plus L-Carnitine — designed to maximize the rate at which your body mobilizes and burns stored fat.",
    },
    whyText: {
      "default":
        "Lipo-C was matched to your fat-burning goals — the MIC formula is a clinically recognized combination for injectable fat-burning support.",
    },
  },

  "vitamin-b12": {
    sku: "WI-B12",
    name: "Methylcobalamin (B12) Injectable",
    badge: "Budget-Friendly",
    bestFor: "Energy, metabolism & nerve function",
    description: "Medical-grade active B12 — the neurological energy your cells can use immediately.",
    clinical:
      "Methylcobalamin is the active, bioavailable form of Vitamin B12 — unlike the synthetic cyanocobalamin in cheap supplements, your body uses it directly with no conversion required. Injectable delivery bypasses the gut entirely, achieving 100% absorption. Patients commonly notice improved energy, better mood, and reduced brain fog within the first week.",
    method: "Self-administered subcutaneous (sub-Q) injection",
    frequency: "Weekly",
    includes: "10mL vial, syringes, needles, alcohol swabs, injection guide",
    concentration: "1mg/mL Methylcobalamin",
    tiers: [
      { months: 1, label: "1-Month",  price: 59,  total: 59 },
      { months: 3, label: "3-Month",  price: 49,  total: 147, savePct: 17 },
      { months: 6, label: "6-Month",  price: 39,  total: 234, savePct: 34 },
    ],
    benefitTags: ["Energy Boost", "Brain Clarity", "Metabolism", "Nerve Health"],
    iconColor: "#06b6d4",
    pairsWell: ["Glutathione Injectable", "Lipotropic Super B"],
    goalDescriptions: {
      "energy:mental":
        "Your mental fatigue — brain fog, low motivation, difficulty concentrating — points directly to B12 as the most targeted fix. Methylcobalamin supports the neurological pathways that power cognitive energy, mood, and mental clarity.",
      "energy":
        "B12 Methylcobalamin addresses energy at its source — supporting red blood cell production, mitochondrial function, and nerve signaling. It's the fastest-acting, most bioavailable form of B12 available.",
      "immune":
        "B12 plays a key role in immune cell production and inflammatory regulation. Methylcobalamin injection ensures your immune system has the neurological and metabolic support it needs to function at full capacity.",
    },
    whyText: {
      "energy:mental":
        "You indicated mental fatigue and difficulty concentrating. Methylcobalamin (B12) is the most direct neurological energy support we offer — it fuels the brain pathways responsible for focus, mood, and mental stamina.",
      "energy":
        "Based on your energy goals and budget, Methylcobalamin (B12) is the most targeted, cost-effective starting point — it's the active form your nerves use immediately.",
      "immune":
        "For immune support at your budget, injectable B12 addresses both energy and immune cell function simultaneously — a high-value entry point.",
    },
  },

  "lipotropic-super-b": {
    sku: "WI-LSB",
    name: "Lipotropic Super B Injectable",
    badge: "Most Popular",
    bestFor: "Energy, fat-burning & metabolism",
    description: "11-ingredient powerhouse — B12, B-complex, L-Carnitine, and fat-burning lipotropics in one shot.",
    clinical:
      "Lipotropic Super B is our most comprehensive energy injection. It combines Methionine, Inositol, and Choline (the proven MIC fat-burning trio) with L-Carnitine, Methylcobalamin (B12), Niacin, Dexpanthenol, Pyridoxal 5-Phosphate, Riboflavin, and Thiamine. This covers energy production, fat metabolism, liver function, and B-vitamin repletion all in one weekly injection. Most patients feel the difference within the first two weeks.",
    method: "Self-administered subcutaneous (sub-Q) injection",
    frequency: "Weekly",
    includes: "10mL vial (1mo) or 30mL vial (3–6mo), syringes, needles, alcohol swabs, injection guide",
    tiers: [
      { months: 1, label: "1-Month",  price: 129, total: 129 },
      { months: 3, label: "3-Month",  price: 99,  total: 297, savePct: 23 },
      { months: 6, label: "6-Month",  price: 89,  total: 534, savePct: 31 },
    ],
    benefitTags: ["Energy & Metabolism", "Fat-Burning", "B-Vitamin Complex", "Immune Support"],
    iconColor: "#f59e0b",
    pairsWell: ["Glutathione Injectable", "L-Carnitine Injectable"],
    goalDescriptions: {
      "energy:physical":
        "Physical fatigue — muscle tiredness, low stamina, post-workout crash — is directly addressed by Lipotropic Super B's combination of L-Carnitine for cellular energy, Methylcobalamin for nerve function, and B-complex vitamins for sustained metabolic output.",
      "energy:both":
        "When fatigue hits both physically and mentally, Lipotropic Super B covers all bases: L-Carnitine for physical energy, Methylcobalamin (B12) for neurological clarity, and lipotropics for metabolic efficiency.",
      "energy":
        "Lipotropic Super B is our highest-impact energy formula — 11 active ingredients working together to restore physical energy, mental clarity, and metabolic rate in one weekly injection.",
      "fat-burning:on-glp1":
        "If you're on a GLP-1 weight loss program, Lipotropic Super B is the most powerful complement available — it accelerates fat metabolism and maintains energy levels during the caloric restriction that comes with GLP-1 therapy.",
      "fat-burning:on-diet":
        "You're actively working on fat loss through diet and exercise. Lipotropic Super B amplifies your results by supercharging fat metabolism, supporting liver function, and providing sustained energy for your workouts.",
      "fat-burning":
        "Lipotropic Super B is our go-to fat-burning injectable — the MIC formula accelerates fat transport out of liver cells, while L-Carnitine ensures that fat is burned for energy rather than stored.",
    },
    whyText: {
      "energy:physical":
        "You indicated physical fatigue as your primary concern. Lipotropic Super B is our highest-impact formula for restoring physical energy — 11 active ingredients including fat-burning lipotropics and B-complex work together in one shot.",
      "energy:both":
        "Your energy issues span both physical and mental. Lipotropic Super B is our most comprehensive formula — it covers neurological energy (B12), physical stamina (L-Carnitine), and fat metabolism all at once.",
      "fat-burning:on-glp1":
        "You're on a GLP-1 program — Lipotropic Super B is specifically designed to complement GLP-1 therapy, accelerating fat metabolism and supporting energy during weight loss.",
      "fat-burning:on-diet":
        "You're working on fat loss through diet and exercise. Lipotropic Super B maximizes your results by accelerating the metabolic processes your program depends on.",
      "fat-burning":
        "For fat burning and metabolism, Lipotropic Super B is our highest-impact option — the MIC formula is clinically recognized as the gold standard for injectable fat-burning support.",
      "default":
        "Based on your goals, Lipotropic Super B is your most comprehensive match — our most popular formula because it delivers energy, fat-burning, and metabolic support all in one weekly shot.",
    },
  },

  "l-carnitine": {
    sku: "WI-LCAR",
    name: "Levocarnitine Injectable",
    bestFor: "Fat burning, muscle preservation & performance",
    description: "Amino acid that shuttles fat into cells to be burned as energy — workout support and body composition.",
    clinical:
      "Levocarnitine (L-Carnitine) plays an irreplaceable role in fat metabolism: it's the molecule that physically transports long-chain fatty acids across the mitochondrial membrane where they're oxidized for energy. Without sufficient Carnitine, fatty acids accumulate rather than burn. Injectable delivery achieves plasma levels impossible with oral supplements. Patients report better energy during workouts, faster recovery, and improved body composition over 4–8 weeks.",
    method: "Self-administered subcutaneous (sub-Q) injection",
    frequency: "2–3× per week",
    includes: "10mL vial, syringes, needles, alcohol swabs, injection guide",
    concentration: "500mg/mL",
    tiers: [
      { months: 1, label: "1-Month",  price: 99,  total: 99 },
      { months: 3, label: "3-Month",  price: 79,  total: 237, savePct: 20 },
      { months: 6, label: "6-Month",  price: 69,  total: 414, savePct: 30 },
    ],
    benefitTags: ["Fat Burning", "Muscle Preservation", "Workout Recovery", "Body Composition"],
    iconColor: "#f97316",
    pairsWell: ["Lipotropic Super B", "Pentadeca Arginate Injectable"],
    goalDescriptions: {
      "fat-burning:standalone":
        "Starting fresh with fat loss? Levocarnitine is the most targeted metabolic injectable for your goal — it directly increases the rate at which your body burns stored fat by shuttling fatty acids into the mitochondria.",
      "fat-burning":
        "Levocarnitine directly accelerates fat oxidation — it's the molecule your body uses to transport fat into the mitochondrial furnace. Injectable delivery makes it far more effective than oral supplements.",
      "athletic:performance":
        "For athletic performance, Levocarnitine increases fat utilization during exercise — preserving glycogen stores, improving endurance, and supporting better output over sustained effort.",
    },
    whyText: {
      "fat-burning:standalone":
        "Starting from scratch with fat loss, Levocarnitine is the most direct metabolic injectable — it specifically increases the rate at which your body uses stored fat for energy.",
      "fat-burning":
        "L-Carnitine matched your fat-burning goal at your budget — it directly increases fat oxidation at the cellular level, making it one of the most targeted metabolic injections available.",
      "athletic:performance":
        "Your focus on athletic performance makes Levocarnitine a strong fit — it increases fat-burning efficiency during exercise, sparing glycogen and improving endurance.",
      "default":
        "Levocarnitine was matched to your goals for its direct role in fat transport and energy metabolism.",
    },
  },

  "glutathione": {
    sku: "WI-GLUT",
    name: "Glutathione Injectable",
    badge: "Detox & Skin",
    bestFor: "Detox, skin radiance & cellular health",
    description: "The body's master antioxidant — injectable delivery for brightened skin, liver detox, and cellular protection.",
    clinical:
      "Glutathione is the most abundant and powerful antioxidant produced in every cell of your body. It neutralizes free radicals, supports liver phase-II detox, and plays a central role in cellular repair and immune function. Oral Glutathione is poorly absorbed — injectable delivery bypasses the gut entirely, reaching cells at therapeutic concentrations. Patients consistently report brighter skin, more energy, and improved resilience to environmental stressors within 2–4 weeks.",
    method: "Self-administered subcutaneous (sub-Q) injection",
    frequency: "2–3× per week",
    includes: "30mL vial, syringes, needles, alcohol swabs, injection guide",
    concentration: "200mg/mL",
    tiers: [
      { months: 1, label: "1-Month",  price: 149, total: 149 },
      { months: 3, label: "3-Month",  price: 119, total: 357, savePct: 20 },
      { months: 6, label: "6-Month",  price: 99,  total: 594, savePct: 34 },
    ],
    benefitTags: ["Detox Support", "Skin Radiance", "Master Antioxidant", "Cellular Health"],
    iconColor: "#10b981",
    pairsWell: ["Lipotropic Super B", "NAD+ Injectable"],
    goalDescriptions: {
      "detox-skin:skin":
        "For skin clarity and radiance, Glutathione is the gold standard. It inhibits the enzyme responsible for melanin overproduction, reduces oxidative damage in skin cells, and produces the inside-out glow that oral antioxidants simply can't match at effective doses.",
      "detox-skin:detox":
        "For internal detox, Glutathione is the body's primary detoxification molecule. It binds to toxins and heavy metals in the liver, enabling their safe elimination — and injectable delivery ensures your cells get therapeutic concentrations.",
      "detox-skin:both":
        "Glutathione delivers the full inside-out effect: liver detox support at the cellular level and skin brightening through antioxidant activity — both happen simultaneously with the same injection.",
      "detox-skin":
        "Glutathione is the undisputed choice for detox and skin health — it's the master antioxidant your body already uses for both, and injectable delivery takes it to therapeutic concentrations oral supplements can't reach.",
      "immune:antioxidant":
        "Oxidative stress is your stated concern — Glutathione is the most powerful antioxidant your body produces, and injectable delivery neutralizes free radicals at concentrations impossible with oral supplements.",
    },
    whyText: {
      "detox-skin:skin":
        "Your focus on skin clarity is exactly why Glutathione was recommended — it's the master antioxidant that brightens skin at the cellular level, reduces oxidative damage, and creates the inside-out glow.",
      "detox-skin:detox":
        "For internal detox and liver support, Glutathione is the body's primary defense — injectable delivery achieves concentrations that directly support phase-II liver detoxification.",
      "detox-skin":
        "Glutathione was matched to your detox and skin health goals — it's the single most effective injectable for both simultaneously.",
      "immune:antioxidant":
        "You flagged oxidative stress as your primary concern. Glutathione is the body's most powerful antioxidant — injectable delivery achieves cellular concentrations that no oral supplement can match.",
      "default":
        "Glutathione is the best match for your goals — the body's master antioxidant, delivered injectable for maximum cellular effect.",
    },
  },

  "nad-plus": {
    sku: "WI-NAD",
    name: "NAD+ Injectable",
    badge: "Premium",
    bestFor: "Anti-aging, brain & cellular energy",
    description: "Cellular energy coenzyme — 100mg/mL NAD+ for mitochondrial health, DNA repair, and longevity.",
    clinical:
      "NAD+ (Nicotinamide Adenine Dinucleotide) is the coenzyme that powers energy metabolism in every living cell. It's the essential link between food and ATP production. As we age — and especially during periods of chronic stress — NAD+ levels decline significantly, impairing energy, cognitive clarity, and cellular repair. Injectable NAD+ restores these levels directly, bypassing the conversion inefficiencies of oral NMN or NR precursors.",
    method: "Self-administered subcutaneous (sub-Q) injection",
    frequency: "2–3× per week",
    includes: "10mL vial, syringes, needles, alcohol swabs, injection guide",
    concentration: "100mg/mL",
    tiers: [
      { months: 1, label: "1-Month",  price: 199, total: 199 },
      { months: 3, label: "3-Month",  price: 169, total: 507, savePct: 15 },
      { months: 6, label: "6-Month",  price: 149, total: 894, savePct: 25 },
    ],
    benefitTags: ["Cellular Energy", "Anti-Aging", "Mental Clarity", "DNA Repair", "Longevity"],
    iconColor: "#8b5cf6",
    pairsWell: ["Sermorelin Injectable", "Glutathione Injectable"],
    goalDescriptions: {
      "anti-aging:cellular":
        "Your focus on cellular repair points directly to NAD+ — it's the coenzyme that drives mitochondrial energy production, activates sirtuins (longevity proteins), and enables DNA repair. NAD+ is the most scientifically supported anti-aging molecule available.",
      "anti-aging:both":
        "For comprehensive anti-aging, NAD+ covers both cellular repair and metabolic optimization — it's the foundational molecule your cells need to function with the efficiency of a younger biological age.",
      "anti-aging":
        "NAD+ is the most direct anti-aging injectable available — it reverses the cellular energy decline that drives aging at the mitochondrial level.",
      "sleep-stress:stress":
        "Chronic stress depletes NAD+ levels, impairing the cellular repair your body needs to recover. NAD+ Injectable restores this, improving stress resilience, cognitive clarity, and the cellular energy reserves that stress drains.",
    },
    whyText: {
      "anti-aging:cellular":
        "Your focus on cellular repair and longevity points directly to NAD+ — the coenzyme that powers mitochondria, activates longevity proteins, and enables DNA repair at the cellular level.",
      "anti-aging":
        "For anti-aging and longevity, NAD+ is the most scientifically supported injectable we offer — it addresses cellular aging at its root cause.",
      "sleep-stress:stress":
        "You identified stress as your primary concern — NAD+ restores the cellular energy reserves that chronic stress depletes, improving resilience and cognitive clarity.",
      "default":
        "NAD+ was matched to your goals as the most impactful option for cellular energy, longevity, and cognitive performance.",
    },
  },

  "sermorelin": {
    sku: "WI-SERM",
    name: "Sermorelin Injectable",
    badge: "Peptide",
    bestFor: "Sleep quality, recovery & muscle preservation",
    description: "Growth hormone peptide — restores your body's natural GH rhythm for deeper sleep, faster recovery, and muscle protection.",
    clinical:
      "Sermorelin is a growth hormone releasing peptide (GHRH analog) that stimulates your pituitary gland to produce more of your own natural growth hormone. Unlike synthetic HGH, Sermorelin works with your body's existing feedback mechanisms — making it safer, more physiologically natural, and sustainable long-term. Growth hormone is central to sleep architecture, muscle preservation, and recovery. Patients typically notice improved sleep depth and quality within 2–4 weeks.",
    method: "Self-administered subcutaneous (sub-Q) injection at bedtime",
    frequency: "Daily (at night)",
    includes: "6mL vial, syringes, needles, alcohol swabs, injection guide",
    concentration: "1.5mg/mL",
    tiers: [
      { months: 1, label: "1-Month",  price: 179, total: 179 },
      { months: 3, label: "3-Month",  price: 149, total: 447, savePct: 17 },
      { months: 6, label: "6-Month",  price: 129, total: 774, savePct: 28 },
    ],
    benefitTags: ["Deep Sleep", "Recovery", "Muscle Preservation", "GH Peptide", "Anti-Aging"],
    iconColor: "#6366f1",
    pairsWell: ["NAD+ Injectable", "Levocarnitine Injectable"],
    goalDescriptions: {
      "sleep-stress:sleep":
        "For sleep quality specifically, Sermorelin is our most effective option. It restores natural growth hormone pulsatility at night — GH is the key hormone that governs deep, slow-wave sleep and nighttime cellular repair.",
      "sleep-stress:both":
        "Sermorelin addresses both sleep and stress at the hormonal level. By restoring the natural GH rhythm, it improves sleep depth — and better sleep is the most powerful stress recovery tool the body has.",
      "sleep-stress":
        "Sermorelin works at the root of sleep dysfunction — it restores the growth hormone rhythm your body uses to drive deep, restorative sleep.",
      "anti-aging:hormone":
        "Your interest in hormone optimization makes Sermorelin the ideal choice — it stimulates your pituitary to produce more of your own natural GH, safely and without suppressing your body's own production.",
    },
    whyText: {
      "sleep-stress:sleep":
        "You identified sleep quality as your top concern. Sermorelin works at the root cause — restoring natural growth hormone cycles that govern deep, restorative sleep.",
      "sleep-stress:both":
        "Sermorelin addresses sleep and stress together at the hormonal level — improving GH rhythm directly improves sleep quality, which is the body's primary stress recovery mechanism.",
      "anti-aging:hormone":
        "Your interest in hormone optimization makes Sermorelin the precise fit — it restores natural GH production without the risks of synthetic supplementation.",
      "default":
        "Sermorelin was recommended for your sleep and recovery goals — it optimizes growth hormone rhythm, the root driver of deep sleep and recovery.",
    },
  },

  "pentadeca-arginate": {
    sku: "WI-PA",
    name: "Pentadeca Arginate Injectable",
    badge: "Recovery Peptide",
    bestFor: "Athletic recovery, tissue repair & performance",
    description: "Advanced peptide that accelerates tissue repair, reduces training inflammation, and speeds recovery between sessions.",
    clinical:
      "Pentadeca Arginate (PDA) is a synthetic peptide derived from Body Protection Compound (BPC-157) with an arginate salt modification for improved stability and bioavailability. It stimulates growth factor production, promotes tendon and muscle healing, supports angiogenesis (new blood vessel formation), and reduces systemic inflammation from intense training. Athletes using PDA consistently report faster recovery between sessions, reduced muscle soreness, and improved training consistency over time.",
    method: "Self-administered subcutaneous (sub-Q) injection",
    frequency: "Daily or as directed",
    includes: "Vial, syringes, needles, alcohol swabs, injection guide",
    tiers: [
      { months: 1, label: "1-Month",  price: 179, total: 179 },
      { months: 3, label: "3-Month",  price: 149, total: 447, savePct: 17 },
      { months: 6, label: "6-Month",  price: 129, total: 774, savePct: 28 },
    ],
    benefitTags: ["Tissue Repair", "Post-Training Recovery", "Inflammation Reduction", "Performance"],
    iconColor: "#0ea5e9",
    pairsWell: ["Levocarnitine Injectable", "NAD+ Injectable"],
    goalDescriptions: {
      "athletic:recovery":
        "Your focus on recovery is exactly what Pentadeca Arginate is built for — it's a peptide that accelerates tissue repair at the cellular level, reduces post-training inflammation, and shortens the recovery window between sessions.",
      "athletic:both":
        "For athletes who need both performance and recovery, Pentadeca Arginate is the foundation — it reduces recovery time so you can train more frequently and at higher intensity without accumulating damage.",
      "athletic":
        "Pentadeca Arginate supports the recovery side of athletic performance — less downtime between sessions, faster tissue repair, and reduced training-related inflammation.",
    },
    whyText: {
      "athletic:recovery":
        "Your focus on recovery makes Pentadeca Arginate our top recommendation — it's specifically designed to accelerate tissue repair and reduce the inflammation that slows recovery between training sessions.",
      "athletic:both":
        "For athletes prioritizing both performance and recovery, Pentadeca Arginate is the foundation — faster recovery means more training consistency and higher output over time.",
      "default":
        "Pentadeca Arginate was matched to your athletic performance goals — supporting tissue repair and recovery, so you can train harder, more often.",
    },
  },

  "ascorbic-acid": {
    sku: "WI-VitC",
    name: "Ascorbic Acid Injectable",
    bestFor: "Immune support, antioxidant protection & recovery",
    description: "High-dose injectable Vitamin C — achieves therapeutic blood levels impossible with oral supplementation.",
    clinical:
      "Injectable Ascorbic Acid (Vitamin C) at 500mg/mL achieves plasma concentrations 30–70× higher than the maximum achievable orally. At these levels, Vitamin C acts as a potent antioxidant, stimulates white blood cell production and activity, supports collagen synthesis, and has been shown to reduce the severity and duration of infections. For immune recovery after illness or surgery, it provides direct cellular support that oral supplements simply cannot deliver.",
    method: "Self-administered subcutaneous (sub-Q) injection",
    frequency: "2–3× per week",
    includes: "30mL vial, syringes, needles, alcohol swabs, injection guide",
    concentration: "500mg/mL",
    tiers: [
      { months: 1, label: "1-Month",  price: 79,  total: 79 },
      { months: 3, label: "3-Month",  price: 65,  total: 195, savePct: 18 },
      { months: 6, label: "6-Month",  price: 55,  total: 330, savePct: 31 },
    ],
    benefitTags: ["Immune Boost", "Antioxidant", "Collagen Synthesis", "Recovery Support"],
    iconColor: "#f59e0b",
    pairsWell: ["Glutathione Injectable", "Methylcobalamin (B12) Injectable"],
    goalDescriptions: {
      "immune:general":
        "For general immune support, high-dose injectable Vitamin C achieves blood levels 30–70× higher than oral supplements. At these concentrations, it actively stimulates white blood cell production and the immune response pathways that keep you healthy.",
      "immune:recovery":
        "For immune recovery after illness or surgery, injectable Ascorbic Acid is our go-to protocol — high-dose delivery directly supports the immune rebuilding process that oral supplements can't reach therapeutically.",
      "immune":
        "Injectable Ascorbic Acid is our most targeted immune support option — achieving therapeutic plasma concentrations that activate the immune response pathways oral Vitamin C simply can't reach.",
    },
    whyText: {
      "immune:general":
        "For general immune support, injectable Ascorbic Acid achieves plasma concentrations 30–70× higher than oral Vitamin C — actively stimulating white blood cell production and immune readiness.",
      "immune:recovery":
        "You mentioned recovering from illness or surgery. Injectable Ascorbic Acid delivers therapeutic immune-support levels that oral supplements cannot achieve, accelerating immune rebuilding.",
      "default":
        "Ascorbic Acid Injectable was selected for your immune support goals — injectable delivery achieves therapeutic levels impossible with oral supplements.",
    },
  },
};

// ─── Icon map ──────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  "vitamin-b12":         Zap,
  "lipotropic-super-b":  Zap,
  "l-carnitine":         Dumbbell,
  "glutathione":         Leaf,
  "nad-plus":            Star,
  "sermorelin":          Moon,
  "pentadeca-arginate":  Sparkles,
  "ascorbic-acid":       ShieldCheck,
};

const GOAL_LABELS: Record<string, string> = {
  "energy":        "Energy & Fatigue",
  "detox-skin":    "Detox & Skin Health",
  "fat-burning":   "Fat Burning & Metabolism",
  "athletic":      "Athletic Performance & Recovery",
  "anti-aging":    "Anti-Aging & Longevity",
  "immune":        "Immune Support",
  "sleep-stress":  "Sleep & Stress",
};

// ─── Helpers ───────────────────────────────────────────────────────────────

function lookup<T>(map: Record<string, T>, goal: string | undefined, concern: string | undefined): T | undefined {
  const combined = goal && concern ? `${goal}:${concern}` : null;
  if (combined && map[combined]) return map[combined];
  if (goal && map[goal]) return map[goal];
  return map["default"];
}

// ─── Props ─────────────────────────────────────────────────────────────────

interface Props {
  handle: string;
  locale: string;
  goal?: string;
  concern?: string;
  budget?: string;
  experience?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────

export function WellnessInjectionResultPage({ handle, locale, goal, concern, budget, experience }: Props) {
  const router = useRouter();
  const { addItem } = useCart();
  const [loading, setLoading] = useState(false);
  const [tierIdx, setTierIdx] = useState(0); // 0=1mo, 1=3mo, 2=6mo

  const product = PRODUCTS[handle];

  if (!product) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#55575A] mb-4">Product not found.</p>
          <Link href={`/${locale}/wellness-injections`} className="text-brand-red underline">
            View all wellness injections
          </Link>
        </div>
      </section>
    );
  }

  const Icon      = ICON_MAP[handle] ?? Syringe;
  const tier      = product.tiers[tierIdx] ?? product.tiers[0];
  const goalLabel = goal ? GOAL_LABELS[goal] : undefined;
  const goalDesc  = lookup(product.goalDescriptions, goal, concern);
  const whyText   = lookup(product.whyText, goal, concern);
  const noInjPref = experience === "no-prefer";

  function handleGetStarted() {
    setLoading(true);
    addItem({
      productId:      product.sku,
      variantId:      `${product.sku}-${tier.months}mo`,
      name:           product.name,
      variantLabel:   `${tier.months}-month supply`,
      price:          tier.total * 100,   // total in cents
      slug:           handle,
      isMedPlan:      true,
      monthlyPrice:   tier.price * 100,
      durationMonths: tier.months,
    });
    router.push(`/${locale}/checkout`);
  }

  return (
    <section className="bg-white min-h-[80vh] py-12">
      <Container narrow>
        <div className="max-w-xl mx-auto">

          {/* ── RESULT BADGE ── */}
          <div className="flex justify-center mb-5">
            <div className="inline-flex items-center gap-2 bg-[#E8F5EE] text-[#1B8A4A] text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider">
              <CheckCircle2 size={12} />
              Your Personalized Match
            </div>
          </div>

          {/* ── PRODUCT HERO ── */}
          <div className="text-center mb-7">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: `${product.iconColor}18` }}
            >
              <Icon size={28} style={{ color: product.iconColor }} />
            </div>

            {product.badge && (
              <span className="inline-block text-xs font-bold text-white px-3 py-1 rounded-full mb-3 bg-[#0C0D0F]">
                {product.badge}
              </span>
            )}

            <h1
              className="text-[#0C0D0F] text-3xl md:text-[2.2rem] font-bold mb-2 leading-tight"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {product.name}
            </h1>
            <p className="text-[#55575A] text-sm flex items-center justify-center gap-1.5">
              <ShieldCheck size={14} className="text-brand-red flex-shrink-0" />
              Best for:{" "}
              <span className="text-brand-red font-medium">{product.bestFor}</span>
            </p>
          </div>

          {/* ── GOAL-TAILORED DESCRIPTION ── */}
          <div className="bg-[#F8F9FA] border border-[#E5E5E5] rounded-2xl p-5 mb-5">
            {goalLabel && (
              <p className="text-[10px] uppercase tracking-widest text-[#55575A] font-semibold mb-2">
                Your goal: {goalLabel}
              </p>
            )}
            <p className="text-[#0C0D0F] text-[14px] leading-relaxed">
              {goalDesc ?? product.description}
            </p>
          </div>

          {/* ── HOW IT WORKS ── */}
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 mb-5">
            <p
              className="text-[#0C0D0F] font-bold text-[13px] mb-4 uppercase tracking-wider"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              How it works
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Syringe, label: "Method",    value: product.method },
                { icon: Clock,   label: "Frequency", value: product.frequency },
                { icon: Flame,   label: "Includes",  value: product.includes },
                ...(product.concentration
                  ? [{ icon: Star, label: "Concentration", value: product.concentration }]
                  : []),
              ].map(({ icon: IcoW, label, value }) => (
                <div key={label} className={label === "Includes" && !product.concentration ? "col-span-2" : ""}>
                  <div className="flex items-start gap-2">
                    <IcoW size={13} className="text-brand-red flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[#55575A] font-semibold mb-0.5">{label}</p>
                      <p className="text-[#0C0D0F] text-[12px] leading-snug">{value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── NO-INJECTION NOTE ── */}
          {noInjPref && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
              <ShieldCheck size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-amber-800 text-[13px] leading-relaxed">
                <strong>A note from our care team:</strong> All wellness injectables are subcutaneous — injected just under the skin, the same technique used for insulin. It&apos;s very easy to learn and we provide a full step-by-step guide with your order.
              </p>
            </div>
          )}

          {/* ── PRICING TIERS ── */}
          <div className="border-2 border-brand-red/20 rounded-2xl overflow-hidden mb-5">
            {/* Tier selector */}
            <div className="bg-[#F8F9FA] px-6 pt-5 pb-4 border-b border-[#E5E5E5]">
              <p
                className="text-[10px] uppercase tracking-widest text-[#55575A] font-semibold mb-3"
              >
                Choose your supply
              </p>
              <div className="grid grid-cols-3 gap-2">
                {product.tiers.map((t, i) => (
                  <button
                    key={t.months}
                    onClick={() => setTierIdx(i)}
                    className={`relative rounded-xl border-2 px-3 py-3 text-center transition-all ${
                      tierIdx === i
                        ? "border-brand-red bg-brand-red/5"
                        : "border-[#E5E5E5] bg-white hover:border-brand-red/30"
                    }`}
                  >
                    {t.savePct && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#1B8A4A] text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                        Save {t.savePct}%
                      </span>
                    )}
                    <p
                      className={`text-[11px] font-semibold mb-1 ${tierIdx === i ? "text-brand-red" : "text-[#55575A]"}`}
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      {t.label}
                    </p>
                    <p
                      className={`text-xl font-bold leading-none ${tierIdx === i ? "text-[#0C0D0F]" : "text-[#0C0D0F]"}`}
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      ${t.price}
                    </p>
                    <p className="text-[10px] text-[#55575A] mt-0.5">/mo</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected tier details */}
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[#0C0D0F] font-semibold text-[14px]">
                    {tier.months}-Month Supply
                  </p>
                  <p className="text-[#55575A] text-[12px]">
                    ${tier.price}/mo · ${tier.total} total
                    {tier.savePct && (
                      <span className="ml-2 text-[#1B8A4A] font-medium">
                        (Save {tier.savePct}%)
                      </span>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[#0C0D0F] text-2xl font-bold" style={{ fontFamily: "Poppins, sans-serif" }}>
                    ${tier.price}
                    <span className="text-[#55575A] text-sm font-normal">/mo</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-[#F8F9FA] border border-[#E5E5E5] rounded-xl px-4 py-2.5">
                <Truck size={13} className="text-[#55575A] flex-shrink-0" />
                <p className="text-[#55575A] text-[11px]">
                  Ships via <strong className="text-[#0C0D0F]">UPS Overnight</strong> — $24 shipping (or $15 for TX/OK). Supplies included.
                </p>
              </div>
            </div>
          </div>

          {/* ── WHY RECOMMENDED ── */}
          {whyText && (
            <div className="bg-[#F0F4FF] border border-[#C7D2FE] rounded-2xl p-5 mb-6">
              <p
                className="text-[10px] uppercase tracking-widest text-[#4338CA] font-semibold mb-2"
              >
                Why this was recommended for you
              </p>
              <p className="text-[#1E1B4B] text-[13px] leading-relaxed">{whyText}</p>
            </div>
          )}

          {/* ── CTA ── */}
          <div className="mb-5">
            <Button
              onClick={handleGetStarted}
              disabled={loading}
              size="lg"
              variant="primary"
              className="w-full rounded-full text-base font-semibold"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? "Adding to cart…" : <>Get Started <ArrowRight size={16} /></>}
              </span>
            </Button>
            <p className="text-center text-[#55575A] text-[11px] mt-2">
              ${tier.price}/mo · {tier.months}-month supply · ${tier.total} charged today
            </p>
          </div>

          {/* ── TRUST BADGES ── */}
          <div className="flex items-center justify-center gap-5 flex-wrap mb-6">
            {[
              { icon: ShieldCheck, label: "HIPAA Compliant" },
              { icon: Lock,        label: "Secure checkout" },
              { icon: Truck,       label: "Supplies included" },
            ].map(({ icon: IcoT, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-[#55575A] text-[11px]">
                <IcoT size={13} className="text-[#1B8A4A]" />
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* ── VIEW ALL ── */}
          <div className="text-center">
            <Link
              href={`/${locale}/wellness-injections`}
              className="inline-flex items-center gap-1.5 text-[#55575A] text-[13px] hover:text-brand-red transition-colors"
            >
              Browse all wellness injections <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
