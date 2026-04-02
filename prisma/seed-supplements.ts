import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const BUNDLES = [
  {
    slug: "glp1-essentials-bundle",
    sku: "BDL-GLP1-ESS",
    category: "bundle",
    productType: "bundle",
    requiresPrescription: false,
    fulfillment: "supliful",
    sortOrder: 1,
    programTag: "weight-loss",
    nameEn: "GLP-1 Essentials Bundle",
    nameEs: "Paquete Esenciales GLP-1",
    descShortEn: "The complete supplement stack for GLP-1 weight loss patients. Save $26.69.",
    descShortEs: "El paquete completo de suplementos para pacientes GLP-1. Ahorra $26.69.",
    descLongEn: [
      "Everything your body needs to thrive on GLP-1 therapy — bundled at a significant discount.",
      "",
      "BUNDLE INCLUDES:",
      "• Vitamin D3 + K2 (5000 IU) — SUPP-D3K2-001",
      "• B-Complex Ultra — SUPP-BCOM-001",
      "• Probiotic Daily 50B CFU — SUPP-PRO-001",
      "• Magnesium Glycinate 400mg — SUPP-MAG-001",
      "",
      "GLP-1 medications can deplete key nutrients. This bundle restores what your body needs: bone-supporting Vitamin D3+K2, energy-boosting B vitamins, gut-balancing probiotics, and sleep-supporting magnesium. Curated by Dr. Moleon specifically for GLP-1 program patients.",
    ].join("\n"),
    descLongEs: [
      "Todo lo que tu cuerpo necesita para prosperar con la terapia GLP-1, a un precio con descuento significativo.",
      "",
      "EL PAQUETE INCLUYE:",
      "• Vitamina D3 + K2 (5000 UI) — SUPP-D3K2-001",
      "• Complejo B Ultra — SUPP-BCOM-001",
      "• Probiótico Diario 50B UFC — SUPP-PRO-001",
      "• Glicinato de Magnesio 400 mg — SUPP-MAG-001",
      "",
      "Los medicamentos GLP-1 pueden agotar nutrientes clave. Este paquete restaura lo que tu cuerpo necesita. Seleccionado por el Dr. Moleon para pacientes en programas GLP-1.",
    ].join("\n"),
    price: 9900,
    compareAtPrice: 12569,
    variantLabel: "4-product bundle / 1–2 month supply",
  },
  {
    slug: "womens-wellness-bundle",
    sku: "BDL-WMNS-WELL",
    category: "bundle",
    productType: "bundle",
    requiresPrescription: false,
    fulfillment: "supliful",
    sortOrder: 2,
    programTag: "feminine-health",
    nameEn: "Women's Wellness Bundle",
    nameEs: "Paquete Bienestar Femenino",
    descShortEn: "Hormonal balance and feminine health support — all in one bundle. Save $22.50.",
    descShortEs: "Apoyo al equilibrio hormonal y la salud femenina en un solo paquete. Ahorra $22.50.",
    descLongEn: [
      "A targeted supplement stack to support feminine health, hormonal balance, and overall wellness.",
      "",
      "BUNDLE INCLUDES:",
      "• Myo-Inositol 2g — SUPP-MYO-001",
      "• Vitamin D3 + K2 (5000 IU) — SUPP-D3K2-001",
      "• Omega-3 Fish Oil (2,000mg) — SUPP-OMG-001",
      "• B-Complex Ultra — SUPP-BCOM-001",
      "",
      "Myo-Inositol improves insulin signaling and hormonal balance (especially for PCOS). Paired with Vitamin D3+K2, Omega-3s, and a full B-complex, this bundle comprehensively supports women's health goals. Curated by Dr. Moleon for the Feminine Health program.",
    ].join("\n"),
    descLongEs: [
      "Un paquete de suplementos dirigido a apoyar la salud femenina, el equilibrio hormonal y el bienestar general.",
      "",
      "EL PAQUETE INCLUYE:",
      "• Mio-Inositol 2 g — SUPP-MYO-001",
      "• Vitamina D3 + K2 (5000 UI) — SUPP-D3K2-001",
      "• Aceite de Pescado Omega-3 (2,000 mg) — SUPP-OMG-001",
      "• Complejo B Ultra — SUPP-BCOM-001",
      "",
      "El Mio-Inositol mejora la señalización de insulina y el equilibrio hormonal. Seleccionado por el Dr. Moleon para el programa de Salud Femenina.",
    ].join("\n"),
    price: 10900,
    compareAtPrice: 13150,
    variantLabel: "4-product bundle / 2-month supply",
  },
  {
    slug: "hair-revival-bundle",
    sku: "BDL-HAIR-REV",
    category: "bundle",
    productType: "bundle",
    requiresPrescription: false,
    fulfillment: "supliful",
    sortOrder: 3,
    programTag: "hair-loss",
    nameEn: "Hair Revival Bundle",
    nameEs: "Paquete Revitalización Capilar",
    descShortEn: "A complete supplement protocol for hair loss — biotin, zinc, collagen & more. Save $29.90.",
    descShortEs: "Un protocolo completo de suplementos para la pérdida de cabello. Ahorra $29.90.",
    descLongEn: [
      "The essential supplement stack for hair loss patients, targeting the root nutritional causes of thinning and shedding.",
      "",
      "BUNDLE INCLUDES:",
      "• Biotin 10,000 mcg — SUPP-BIO-001",
      "• Zinc + Copper Complex — SUPP-ZNC-001",
      "• Collagen Peptides (Unflavored) — SUPP-COL-001",
      "• Vitamin D3 + K2 (5000 IU) — SUPP-D3K2-001",
      "",
      "Hair thinning is often driven by nutritional deficiencies. This bundle delivers high-potency biotin for keratin production, zinc+copper for follicle health, collagen for hair structure, and Vitamin D3+K2 for overall cellular health. Curated by Dr. Moleon for Hair Loss program patients.",
    ].join("\n"),
    descLongEs: [
      "El paquete esencial de suplementos para pacientes con pérdida de cabello, dirigido a las causas nutricionales del adelgazamiento.",
      "",
      "EL PAQUETE INCLUYE:",
      "• Biotina 10,000 mcg — SUPP-BIO-001",
      "• Complejo de Zinc + Cobre — SUPP-ZNC-001",
      "• Péptidos de Colágeno (Sin Sabor) — SUPP-COL-001",
      "• Vitamina D3 + K2 (5000 UI) — SUPP-D3K2-001",
      "",
      "La pérdida de cabello a menudo está impulsada por deficiencias nutricionales. Seleccionado por el Dr. Moleon para pacientes en el programa de Pérdida de Cabello.",
    ].join("\n"),
    price: 11900,
    compareAtPrice: 14890,
    variantLabel: "4-product bundle / 2–3 month supply",
  },
  {
    slug: "performance-recovery-bundle",
    sku: "BDL-PERF-REC",
    category: "bundle",
    productType: "bundle",
    requiresPrescription: false,
    fulfillment: "supliful",
    sortOrder: 4,
    programTag: "mental-health",
    nameEn: "Performance + Recovery Bundle",
    nameEs: "Paquete Rendimiento + Recuperación",
    descShortEn: "Supports mental clarity, stress resilience, and recovery. Save $34.79.",
    descShortEs: "Apoya la claridad mental, la resiliencia al estrés y la recuperación. Ahorra $34.79.",
    descLongEn: [
      "A carefully selected stack to support mental wellness, cognitive performance, and physical recovery.",
      "",
      "BUNDLE INCLUDES:",
      "• Ashwagandha KSM-66 (300mg) — SUPP-ASH-001",
      "• Omega-3 Fish Oil (2,000mg) — SUPP-OMG-001",
      "• Magnesium Glycinate 400mg — SUPP-MAG-001",
      "• B-Complex Ultra — SUPP-BCOM-001",
      "• Vitamin D3 + K2 (5000 IU) — SUPP-D3K2-001",
      "",
      "KSM-66 Ashwagandha reduces cortisol and anxiety. Omega-3s support brain function. Magnesium promotes restful sleep and reduces stress. B-Complex supports neurotransmitter production. Vitamin D3+K2 supports mood and immunity. Curated by Dr. Moleon for Mental Health program patients.",
    ].join("\n"),
    descLongEs: [
      "Un paquete cuidadosamente seleccionado para apoyar el bienestar mental, el rendimiento cognitivo y la recuperación física.",
      "",
      "EL PAQUETE INCLUYE:",
      "• Ashwagandha KSM-66 (300 mg) — SUPP-ASH-001",
      "• Aceite de Pescado Omega-3 (2,000 mg) — SUPP-OMG-001",
      "• Glicinato de Magnesio 400 mg — SUPP-MAG-001",
      "• Complejo B Ultra — SUPP-BCOM-001",
      "• Vitamina D3 + K2 (5000 UI) — SUPP-D3K2-001",
      "",
      "Seleccionado por el Dr. Moleon para pacientes en el programa de Salud Mental.",
    ].join("\n"),
    price: 13900,
    compareAtPrice: 17379,
    variantLabel: "5-product bundle / 2-month supply",
  },
  {
    slug: "glp1-hair-rescue-bundle",
    sku: "BDL-GLP1-HAIR",
    category: "bundle",
    productType: "bundle",
    requiresPrescription: false,
    fulfillment: "supliful",
    sortOrder: 5,
    programTag: "hair-loss",
    nameEn: "GLP-1 Hair Rescue Bundle",
    nameEs: "Paquete Rescate Capilar GLP-1",
    descShortEn: "For hair loss patients also on GLP-1 — addresses shedding caused by rapid weight loss. Save $28.80.",
    descShortEs: "Para pacientes con pérdida de cabello en GLP-1 — combate la caída por pérdida de peso rápida. Ahorra $28.80.",
    descLongEn: [
      "Rapid weight loss on GLP-1 can trigger telogen effluvium (stress-related shedding). This bundle addresses both the hair loss and the GLP-1 nutritional gaps simultaneously.",
      "",
      "BUNDLE INCLUDES:",
      "• Biotin 10,000 mcg — SUPP-BIO-001",
      "• Collagen Peptides (Unflavored) — SUPP-COL-001",
      "• Zinc + Copper Complex — SUPP-ZNC-001",
      "• B-Complex Ultra — SUPP-BCOM-001",
      "",
      "Biotin and collagen support hair structure and growth. Zinc+Copper maintains follicle health. B-Complex replenishes nutrients depleted by GLP-1. Designed for patients managing both a Hair Loss program and GLP-1 therapy. Curated by Dr. Moleon.",
    ].join("\n"),
    descLongEs: [
      "La pérdida de peso rápida con GLP-1 puede desencadenar efluvio telógeno. Este paquete aborda tanto la pérdida de cabello como las brechas nutricionales de GLP-1 simultáneamente.",
      "",
      "EL PAQUETE INCLUYE:",
      "• Biotina 10,000 mcg — SUPP-BIO-001",
      "• Péptidos de Colágeno (Sin Sabor) — SUPP-COL-001",
      "• Complejo de Zinc + Cobre — SUPP-ZNC-001",
      "• Complejo B Ultra — SUPP-BCOM-001",
      "",
      "Seleccionado por el Dr. Moleon para pacientes con pérdida de cabello en terapia GLP-1.",
    ].join("\n"),
    price: 10900,
    compareAtPrice: 13780,
    variantLabel: "4-product bundle / 2–3 month supply",
  },
];

const SUPPLEMENTS = [
  {
    slug: "vitamin-d3-k2",
    sku: "SUPP-D3K2-001",
    category: "vitamins",
    productType: "supplement",
    requiresPrescription: false,
    fulfillment: "supliful",
    sortOrder: 10,
    nameEn: "Vitamin D3 + K2 (5000 IU)",
    nameEs: "Vitamina D3 + K2 (5000 UI)",
    descShortEn: "Supports bone density, immune function, and mood regulation.",
    descShortEs: "Apoya la densidad ósea, la función inmune y la regulación del estado de ánimo.",
    descLongEn:
      "Our pharmaceutical-grade Vitamin D3 paired with MK-7 Vitamin K2 ensures calcium is directed to your bones—not your arteries. Especially beneficial for GLP-1 program patients whose sun exposure may be limited. Each softgel delivers 5,000 IU D3 + 100mcg K2 MK-7.",
    descLongEs:
      "Nuestra vitamina D3 de grado farmacéutico combinada con K2 MK-7 asegura que el calcio llegue a tus huesos, no a tus arterias. Especialmente beneficiosa para pacientes en programas GLP-1. Cada cápsula aporta 5,000 UI de D3 + 100 mcg de K2 MK-7.",
    price: 2299,
    compareAtPrice: 2999,
    variantLabel: "60 Softgels / 2-month supply",
  },
  {
    slug: "b-complex-ultra",
    sku: "SUPP-BCOM-001",
    category: "vitamins",
    productType: "supplement",
    requiresPrescription: false,
    fulfillment: "supliful",
    sortOrder: 20,
    nameEn: "B-Complex Ultra",
    nameEs: "Complejo B Ultra",
    descShortEn: "All 8 B-vitamins to support energy, mood, and nervous system health.",
    descShortEs: "Las 8 vitaminas B para apoyar la energía, el estado de ánimo y el sistema nervioso.",
    descLongEn:
      "A comprehensive methylated B-complex providing all eight essential B-vitamins in their most bioavailable forms. Supports cellular energy production, reduces fatigue, and promotes healthy neurotransmitter function. Ideal for patients on GLP-1 therapy who may have reduced food intake.",
    descLongEs:
      "Un complejo B metilado completo con las ocho vitaminas B esenciales en sus formas más biodisponibles. Apoya la producción de energía celular, reduce la fatiga y promueve una función saludable de los neurotransmisores.",
    price: 1999,
    compareAtPrice: null,
    variantLabel: "60 Capsules / 2-month supply",
  },
  {
    slug: "biotin-10000",
    sku: "SUPP-BIO-001",
    category: "vitamins",
    productType: "supplement",
    requiresPrescription: false,
    fulfillment: "supliful",
    sortOrder: 30,
    nameEn: "Biotin 10,000 mcg",
    nameEs: "Biotina 10,000 mcg",
    descShortEn: "High-potency biotin to strengthen hair, skin, and nails.",
    descShortEs: "Biotina de alta potencia para fortalecer cabello, piel y uñas.",
    descLongEn:
      "High-potency 10,000 mcg biotin (Vitamin B7) to support hair growth, nail strength, and healthy skin. A popular addition to our hair loss programs, biotin plays a key role in keratin production. Best results seen after 90+ days of consistent use.",
    descLongEs:
      "Biotina de alta potencia (Vitamina B7) de 10,000 mcg para apoyar el crecimiento del cabello, la fortaleza de las uñas y la piel sana. Una adición popular a nuestros programas de pérdida de cabello. Los mejores resultados se observan después de 90+ días de uso consistente.",
    price: 1799,
    compareAtPrice: null,
    variantLabel: "90 Softgels / 3-month supply",
  },
  {
    slug: "probiotic-daily-50b",
    sku: "SUPP-PRO-001",
    category: "probiotics",
    productType: "supplement",
    requiresPrescription: false,
    fulfillment: "supliful",
    sortOrder: 40,
    nameEn: "Probiotic Daily 50B CFU",
    nameEs: "Probiótico Diario 50B UFC",
    descShortEn: "50 billion CFU across 10 strains to restore and protect gut balance.",
    descShortEs: "50 mil millones de UFC en 10 cepas para restaurar y proteger el equilibrio intestinal.",
    descLongEn:
      "A clinical-strength probiotic with 50 billion CFU from 10 research-backed strains including Lactobacillus acidophilus and Bifidobacterium longum. GLP-1 medications can affect gut motility—this probiotic helps manage nausea, bloating, and regularity. Delayed-release capsules ensure survival past stomach acid.",
    descLongEs:
      "Un probiótico de potencia clínica con 50 mil millones de UFC de 10 cepas respaldadas por investigación. Los medicamentos GLP-1 pueden afectar la motilidad intestinal — este probiótico ayuda a manejar las náuseas, la hinchazón y la regularidad.",
    price: 2999,
    compareAtPrice: 3999,
    variantLabel: "30 Capsules / 1-month supply",
  },
  {
    slug: "omega-3-fish-oil",
    sku: "SUPP-OMG-001",
    category: "omega3",
    productType: "supplement",
    requiresPrescription: false,
    fulfillment: "supliful",
    sortOrder: 50,
    nameEn: "Omega-3 Fish Oil (2,000mg)",
    nameEs: "Aceite de Pescado Omega-3 (2,000 mg)",
    descShortEn: "Triglyceride-form EPA + DHA to support heart, brain, and joint health.",
    descShortEs: "EPA + DHA en forma de triglicéridos para apoyar el corazón, el cerebro y las articulaciones.",
    descLongEn:
      "Molecularly distilled, pharmaceutical-grade omega-3 fish oil delivering 1,200mg EPA + 600mg DHA per serving in superior triglyceride form for maximum absorption. GLP-1 therapy supports weight loss, and omega-3s amplify cardiovascular benefits while reducing inflammation. No fishy aftertaste.",
    descLongEs:
      "Aceite de pescado omega-3 de grado farmacéutico destilado molecularmente. Aporta 1,200 mg de EPA + 600 mg de DHA por porción en forma de triglicéridos para máxima absorción. Sin sabor a pescado.",
    price: 2499,
    compareAtPrice: null,
    variantLabel: "60 Softgels / 1-month supply",
  },
  {
    slug: "magnesium-glycinate",
    sku: "SUPP-MAG-001",
    category: "minerals",
    productType: "supplement",
    requiresPrescription: false,
    fulfillment: "supliful",
    sortOrder: 60,
    nameEn: "Magnesium Glycinate 400mg",
    nameEs: "Glicinato de Magnesio 400 mg",
    descShortEn: "Highly absorbable magnesium to ease muscle cramps, sleep, and stress.",
    descShortEs: "Magnesio altamente absorbible para aliviar calambres, mejorar el sueño y reducir el estrés.",
    descLongEn:
      "Magnesium Glycinate is the most bioavailable and gentle form of magnesium—ideal for patients experiencing muscle cramps or sleep difficulties on GLP-1 therapy. Supports over 300 enzymatic reactions, reduces cortisol, and promotes deep, restorative sleep without laxative effects.",
    descLongEs:
      "El Glicinato de Magnesio es la forma más biodisponible y suave de magnesio — ideal para pacientes que experimentan calambres musculares o dificultades para dormir con terapia GLP-1. Apoya más de 300 reacciones enzimáticas y promueve un sueño reparador.",
    price: 1999,
    compareAtPrice: null,
    variantLabel: "120 Capsules / 2-month supply",
  },
  {
    slug: "zinc-copper-complex",
    sku: "SUPP-ZNC-001",
    category: "minerals",
    productType: "supplement",
    requiresPrescription: false,
    fulfillment: "supliful",
    sortOrder: 70,
    nameEn: "Zinc + Copper Complex",
    nameEs: "Complejo de Zinc + Cobre",
    descShortEn: "Balanced zinc and copper to support hair growth, immunity, and hormone balance.",
    descShortEs: "Zinc y cobre balanceados para apoyar el crecimiento del cabello, la inmunidad y el equilibrio hormonal.",
    descLongEn:
      "Zinc is essential for hair follicle health, immune defense, and testosterone production. Our formula balances zinc with copper (in proper 10:1 ratio) to prevent copper deficiency. Particularly recommended for patients on hair loss programs or those experiencing hair thinning during rapid weight loss.",
    descLongEs:
      "El zinc es esencial para la salud del folículo capilar, la defensa inmune y la producción de testosterona. Nuestra fórmula equilibra el zinc con el cobre en la proporción correcta de 10:1. Especialmente recomendado para pacientes en programas de pérdida de cabello.",
    price: 1699,
    compareAtPrice: null,
    variantLabel: "60 Capsules / 2-month supply",
  },
  {
    slug: "collagen-peptides",
    sku: "SUPP-COL-001",
    category: "protein",
    productType: "supplement",
    requiresPrescription: false,
    fulfillment: "supliful",
    sortOrder: 80,
    nameEn: "Collagen Peptides (Unflavored)",
    nameEs: "Péptidos de Colágeno (Sin Sabor)",
    descShortEn: "Hydrolyzed Type I & III collagen to support skin elasticity, joints, and hair.",
    descShortEs: "Colágeno hidrolizado Tipo I y III para la piel, las articulaciones y el cabello.",
    descLongEn:
      "Sourced from grass-fed, pasture-raised bovine, our hydrolyzed collagen peptides dissolve instantly in any hot or cold beverage. As GLP-1 patients lose weight, skin elasticity becomes a concern — collagen provides the amino acids (glycine, proline, hydroxyproline) your body needs to maintain firmness and rebuild connective tissue.",
    descLongEs:
      "Obtenido de bovinos alimentados con pasto, nuestros péptidos de colágeno hidrolizado se disuelven instantáneamente en cualquier bebida caliente o fría. A medida que los pacientes GLP-1 pierden peso, la elasticidad de la piel puede ser una preocupación — el colágeno proporciona los aminoácidos necesarios para mantener la firmeza.",
    price: 3999,
    compareAtPrice: 4999,
    variantLabel: "300g / 30 servings",
  },
  {
    slug: "ashwagandha-ksm66",
    sku: "SUPP-ASH-001",
    category: "wellness",
    productType: "supplement",
    requiresPrescription: false,
    fulfillment: "supliful",
    sortOrder: 90,
    nameEn: "Ashwagandha KSM-66 (300mg)",
    nameEs: "Ashwagandha KSM-66 (300 mg)",
    descShortEn: "Clinically studied adaptogen to reduce cortisol, anxiety, and support thyroid balance.",
    descShortEs: "Adaptógeno estudiado clínicamente para reducir el cortisol, la ansiedad y apoyar la tiroides.",
    descLongEn:
      "KSM-66 is the most clinically studied, full-spectrum ashwagandha extract — with 22+ clinical trials showing significant reductions in cortisol, anxiety, and stress. High cortisol is a major driver of weight gain and poor sleep. Pairs exceptionally well with mental wellness programs and GLP-1 therapy.",
    descLongEs:
      "KSM-66 es el extracto de ashwagandha de espectro completo más estudiado clínicamente, con más de 22 ensayos clínicos que muestran reducciones significativas en cortisol, ansiedad y estrés. El cortisol alto es un factor importante en el aumento de peso y el sueño deficiente.",
    price: 2799,
    compareAtPrice: null,
    variantLabel: "60 Capsules / 2-month supply",
  },
  {
    slug: "myo-inositol",
    sku: "SUPP-MYO-001",
    category: "wellness",
    productType: "supplement",
    requiresPrescription: false,
    fulfillment: "supliful",
    sortOrder: 100,
    nameEn: "Myo-Inositol 2g",
    nameEs: "Mio-Inositol 2 g",
    descShortEn: "Clinically backed for PCOS, insulin sensitivity, and hormonal balance.",
    descShortEs: "Respaldado clínicamente para el SOP, la sensibilidad a la insulina y el equilibrio hormonal.",
    descLongEn:
      "Myo-Inositol improves insulin signaling and is one of the most evidence-backed supplements for PCOS management, hormonal balance, and fertility support. At 2g per serving, it complements GLP-1 therapy by further improving insulin sensitivity. Also shown to reduce anxiety and support egg quality in women.",
    descLongEs:
      "El Mio-Inositol mejora la señalización de insulina y es uno de los suplementos más respaldados por la evidencia para el manejo del SOP, el equilibrio hormonal y el apoyo a la fertilidad. A 2g por porción, complementa la terapia GLP-1 mejorando aún más la sensibilidad a la insulina.",
    price: 2499,
    compareAtPrice: null,
    variantLabel: "60 Servings / 2-month supply",
  },
];

async function seedProduct(s: {
  slug: string;
  sku: string;
  category: string;
  productType: string;
  requiresPrescription: boolean;
  fulfillment: string;
  sortOrder: number;
  programTag?: string;
  nameEn: string;
  nameEs: string;
  descShortEn: string;
  descShortEs: string;
  descLongEn: string;
  descLongEs: string;
  price: number;
  compareAtPrice: number | null;
  variantLabel: string;
}) {
  const product = await db.product.upsert({
    where: { slug: s.slug },
    update: {
      productType: s.productType,
      category: s.category,
      fulfillment: s.fulfillment,
      requiresPrescription: s.requiresPrescription,
      programTag: s.programTag ?? null,
      isActive: true,
      sortOrder: s.sortOrder,
    },
    create: {
      slug: s.slug,
      sku: s.sku,
      category: s.category,
      productType: s.productType,
      fulfillment: s.fulfillment,
      requiresPrescription: s.requiresPrescription,
      programTag: s.programTag ?? null,
      isActive: true,
      isFeatured: false,
      sortOrder: s.sortOrder,
    },
  });

  await db.productTranslation.upsert({
    where: { productId_locale: { productId: product.id, locale: "en" } },
    update: {
      name: s.nameEn,
      descriptionShort: s.descShortEn,
      descriptionLong: s.descLongEn,
    },
    create: {
      productId: product.id,
      locale: "en",
      name: s.nameEn,
      descriptionShort: s.descShortEn,
      descriptionLong: s.descLongEn,
    },
  });

  await db.productTranslation.upsert({
    where: { productId_locale: { productId: product.id, locale: "es" } },
    update: {
      name: s.nameEs,
      descriptionShort: s.descShortEs,
      descriptionLong: s.descLongEs,
    },
    create: {
      productId: product.id,
      locale: "es",
      name: s.nameEs,
      descriptionShort: s.descShortEs,
      descriptionLong: s.descLongEs,
    },
  });

  const existingVariant = await db.productVariant.findFirst({
    where: { productId: product.id },
  });

  if (!existingVariant) {
    await db.productVariant.create({
      data: {
        productId: product.id,
        sku: `${s.sku}-VAR`,
        label: s.variantLabel,
        price: s.price,
        compareAtPrice: s.compareAtPrice ?? null,
        isAvailable: true,
        sortOrder: 0,
      },
    });
  } else {
    await db.productVariant.update({
      where: { id: existingVariant.id },
      data: {
        price: s.price,
        compareAtPrice: s.compareAtPrice ?? null,
        label: s.variantLabel,
      },
    });
  }

  console.log(`  ✓ ${s.nameEn}`);
}

async function main() {
  console.log("Seeding bundle products...");
  for (const b of BUNDLES) {
    await seedProduct(b);
  }

  console.log("\nSeeding supplement products...");
  for (const s of SUPPLEMENTS) {
    await seedProduct({ ...s, programTag: undefined });
  }

  console.log(`\nDone! Seeded ${BUNDLES.length} bundles + ${SUPPLEMENTS.length} supplement products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
