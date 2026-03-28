import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function upsertProduct(data: {
  slug: string;
  sku?: string;
  category: string;
  programTag?: string;
  fulfillment?: string;
  dosageForm?: string;
  forGender?: string;
  pathBConsultPrice?: number;
  pathBOngoingPrice?: number;
  fccMedicationName?: string;
  fccConcentration?: string;
  requiresPrescription?: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  nameEn: string;
  nameEs?: string;
  shortEn: string;
  shortEs?: string;
  variants: {
    sku: string;
    label?: string;
    doseLevel?: string;
    supplyDuration?: string;
    price: number;
    compareAtPrice?: number;
    sortOrder?: number;
  }[];
}) {
  const product = await prisma.product.upsert({
    where: { slug: data.slug },
    update: {
      sku: data.sku,
      programTag: data.programTag,
      fulfillment: data.fulfillment ?? "direct_ship",
      dosageForm: data.dosageForm,
      forGender: data.forGender ?? "all",
      pathBConsultPrice: data.pathBConsultPrice,
      pathBOngoingPrice: data.pathBOngoingPrice,
      fccMedicationName: data.fccMedicationName,
      fccConcentration: data.fccConcentration,
      requiresPrescription: data.requiresPrescription ?? true,
      sortOrder: data.sortOrder ?? 0,
    },
    create: {
      slug: data.slug,
      sku: data.sku,
      category: data.category,
      programTag: data.programTag,
      fulfillment: data.fulfillment ?? "direct_ship",
      dosageForm: data.dosageForm,
      forGender: data.forGender ?? "all",
      pathBConsultPrice: data.pathBConsultPrice,
      pathBOngoingPrice: data.pathBOngoingPrice,
      fccMedicationName: data.fccMedicationName,
      fccConcentration: data.fccConcentration,
      requiresPrescription: data.requiresPrescription ?? true,
      isActive: data.isActive ?? true,
      isFeatured: data.isFeatured ?? false,
      sortOrder: data.sortOrder ?? 0,
    },
  });

  await prisma.productTranslation.upsert({
    where: { productId_locale: { productId: product.id, locale: "en" } },
    update: { name: data.nameEn, descriptionShort: data.shortEn, descriptionLong: data.shortEn },
    create: { productId: product.id, locale: "en", name: data.nameEn, descriptionShort: data.shortEn, descriptionLong: data.shortEn },
  });
  await prisma.productTranslation.upsert({
    where: { productId_locale: { productId: product.id, locale: "es" } },
    update: { name: data.nameEs ?? data.nameEn, descriptionShort: data.shortEs ?? data.shortEn, descriptionLong: data.shortEs ?? data.shortEn },
    create: { productId: product.id, locale: "es", name: data.nameEs ?? data.nameEn, descriptionShort: data.shortEs ?? data.shortEn, descriptionLong: data.shortEs ?? data.shortEn },
  });

  for (let i = 0; i < data.variants.length; i++) {
    const v = data.variants[i];
    await prisma.productVariant.upsert({
      where: { sku: v.sku },
      update: {
        label: v.label,
        doseLevel: v.doseLevel,
        supplyDuration: v.supplyDuration,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        sortOrder: v.sortOrder ?? i + 1,
      },
      create: {
        productId: product.id,
        sku: v.sku,
        label: v.label,
        doseLevel: v.doseLevel,
        supplyDuration: v.supplyDuration,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        sortOrder: v.sortOrder ?? i + 1,
      },
    });
  }

  console.log(`  ✓ ${data.nameEn}`);
  return product;
}

async function main() {
  console.log("🌱 Seeding Body Good Studio product catalog...\n");

  // ═══════════════════════════════════════════════════════════════════════
  // 1. COMPOUNDED GLP-1 INJECTABLES
  // ═══════════════════════════════════════════════════════════════════════
  console.log("💉 Compounded GLP-1...");

  await upsertProduct({
    slug: "compounded-semaglutide",
    sku: "WM-SEM",
    category: "compounded",
    programTag: "weight-management, glp-1, semaglutide, injectable",
    fulfillment: "direct_ship",
    dosageForm: "Injectable",
    fccMedicationName: "Semaglutide / B6 (Pyridoxine)",
    isFeatured: true,
    sortOrder: 1,
    nameEn: "Compounded Semaglutide",
    nameEs: "Semaglutida Compuesta",
    shortEn: "Same active ingredient as Ozempic & Wegovy. Monthly, 3-month, or 6-month supply.",
    shortEs: "Mismo ingrediente activo que Ozempic y Wegovy. Suministro mensual, 3 o 6 meses.",
    variants: [
      { sku: "SEM-1MO", label: "1 Month Supply", doseLevel: "All doses", supplyDuration: "1-month", price: 17900, sortOrder: 1 },
      { sku: "SEM-3MO", label: "3 Month Supply", doseLevel: "All doses", supplyDuration: "3-month", price: 14900, compareAtPrice: 17900, sortOrder: 2 },
      { sku: "SEM-6MO", label: "6 Month Supply", doseLevel: "All doses", supplyDuration: "6-month", price: 13900, compareAtPrice: 17900, sortOrder: 3 },
    ],
  });

  await upsertProduct({
    slug: "compounded-tirzepatide-starter",
    sku: "WM-TIR-S",
    category: "compounded",
    programTag: "weight-management, glp-1, tirzepatide, injectable, starter",
    fulfillment: "direct_ship",
    dosageForm: "Injectable",
    fccMedicationName: "Tirzepatide / B6 (Pyridoxine)",
    fccConcentration: "12.5mg/10mg/mL",
    isFeatured: true,
    sortOrder: 2,
    nameEn: "Compounded Tirzepatide — Starter",
    nameEs: "Tirzepatida Compuesta — Inicio",
    shortEn: "Same active ingredient as Mounjaro & Zepbound. Starter doses (2.5–7.5mg/week).",
    shortEs: "Mismo ingrediente activo que Mounjaro y Zepbound. Dosis iniciales (2.5–7.5mg/semana).",
    variants: [
      { sku: "TRZ-S-1MO", label: "1 Month Supply", doseLevel: "2.5–7.5mg", supplyDuration: "1-month", price: 29900, sortOrder: 1 },
      { sku: "TRZ-S-3MO", label: "3 Month Supply", doseLevel: "2.5–7.5mg", supplyDuration: "3-month", price: 27900, compareAtPrice: 29900, sortOrder: 2 },
      { sku: "TRZ-S-6MO", label: "6 Month Supply", doseLevel: "2.5–7.5mg", supplyDuration: "6-month", price: 25900, compareAtPrice: 29900, sortOrder: 3 },
    ],
  });

  await upsertProduct({
    slug: "compounded-tirzepatide-maintenance",
    sku: "WM-TIR-M",
    category: "compounded",
    programTag: "weight-management, glp-1, tirzepatide, injectable, maintenance",
    fulfillment: "direct_ship",
    dosageForm: "Injectable",
    fccMedicationName: "Tirzepatide / B6 (Pyridoxine)",
    fccConcentration: "12.5mg/10mg/mL",
    sortOrder: 3,
    nameEn: "Compounded Tirzepatide — Maintenance",
    nameEs: "Tirzepatida Compuesta — Mantenimiento",
    shortEn: "Higher maintenance doses (10–15mg/week) for sustained weight management.",
    shortEs: "Dosis de mantenimiento más altas (10–15mg/semana) para control de peso sostenido.",
    variants: [
      { sku: "TRZ-M-1MO", label: "1 Month Supply", doseLevel: "10–15mg", supplyDuration: "1-month", price: 34900, sortOrder: 1 },
      { sku: "TRZ-M-3MO", label: "3 Month Supply", doseLevel: "10–15mg", supplyDuration: "3-month", price: 32900, compareAtPrice: 34900, sortOrder: 2 },
      { sku: "TRZ-M-6MO", label: "6 Month Supply", doseLevel: "10–15mg", supplyDuration: "6-month", price: 31900, compareAtPrice: 34900, sortOrder: 3 },
    ],
  });

  await upsertProduct({
    slug: "tirzepatide-one-time",
    sku: "WM-TIR-OT",
    category: "compounded",
    programTag: "weight-management, glp-1, tirzepatide, injectable",
    fulfillment: "direct_ship",
    dosageForm: "Injectable",
    fccMedicationName: "Tirzepatide / B6 (Pyridoxine)",
    sortOrder: 4,
    nameEn: "Tirzepatide — One-Time Purchase",
    nameEs: "Tirzepatida — Compra Única",
    shortEn: "Single month of compounded tirzepatide at any dose level. No subscription required.",
    shortEs: "Un mes de tirzepatida compuesta a cualquier nivel de dosis. Sin suscripción.",
    variants: [
      { sku: "TRZ-OT", label: "All Doses", doseLevel: "All doses", supplyDuration: "one-time", price: 31500, sortOrder: 1 },
    ],
  });

  // Individual dose-level SKUs from catalog
  const semaDoses = [
    { sku: "WM-SEM-025", slug: "semaglutide-025mg", name: "Semaglutide 0.25mg/week", dose: "0.25mg/week", fill: "1mL", conc: "2.5mg/10mg/mL", order: 5 },
    { sku: "WM-SEM-050", slug: "semaglutide-050mg", name: "Semaglutide 0.5mg/week", dose: "0.5mg/week", fill: "2mL", conc: "2.5mg/10mg/mL", order: 6 },
    { sku: "WM-SEM-100", slug: "semaglutide-100mg", name: "Semaglutide 1mg/week", dose: "1mg/week", fill: "4mL (2x2mL)", conc: "2.5mg/10mg/mL", order: 7 },
    { sku: "WM-SEM-150", slug: "semaglutide-150mg", name: "Semaglutide 1.5mg/week", dose: "1.5mg/week", fill: "6mL (3x2mL)", conc: "2.5mg/10mg/mL", order: 8 },
    { sku: "WM-SEM-200", slug: "semaglutide-200mg", name: "Semaglutide 2mg/week", dose: "2mg/week", fill: "8mL (4x2mL)", conc: "2.5mg/10mg/mL", order: 9 },
  ];
  for (const d of semaDoses) {
    await upsertProduct({
      slug: d.slug, sku: d.sku, category: "compounded",
      programTag: "weight-management, glp-1, semaglutide, injectable",
      fulfillment: "direct_ship", dosageForm: "Injectable",
      fccMedicationName: "Semaglutide / B6 (Pyridoxine)", fccConcentration: d.conc,
      sortOrder: d.order,
      nameEn: d.name, shortEn: `${d.dose} weekly. ${d.fill} vial, monthly supply.`,
      variants: [{ sku: `${d.sku}-1MO`, label: `1 Month — ${d.dose}`, doseLevel: d.dose, supplyDuration: "1-month", price: 17900, sortOrder: 1 }],
    });
  }

  const tirzDoses = [
    { sku: "WM-TIR-250", slug: "tirzepatide-250mg", name: "Tirzepatide 2.5mg/week", dose: "2.5mg/week", price: 29900, order: 10 },
    { sku: "WM-TIR-500", slug: "tirzepatide-500mg", name: "Tirzepatide 5mg/week", dose: "5mg/week", price: 29900, order: 11 },
    { sku: "WM-TIR-750", slug: "tirzepatide-750mg", name: "Tirzepatide 7.5mg/week", dose: "7.5mg/week", price: 29900, order: 12 },
    { sku: "WM-TIR-1000", slug: "tirzepatide-1000mg", name: "Tirzepatide 10mg/week", dose: "10mg/week", price: 34900, order: 13 },
    { sku: "WM-TIR-1250", slug: "tirzepatide-1250mg", name: "Tirzepatide 12.5mg/week", dose: "12.5mg/week", price: 34900, order: 14 },
    { sku: "WM-TIR-1500", slug: "tirzepatide-1500mg", name: "Tirzepatide 15mg/week", dose: "15mg/week", price: 34900, order: 15 },
  ];
  for (const t of tirzDoses) {
    await upsertProduct({
      slug: t.slug, sku: t.sku, category: "compounded",
      programTag: "weight-management, glp-1, tirzepatide, injectable",
      fulfillment: "direct_ship", dosageForm: "Injectable",
      fccMedicationName: "Tirzepatide / B6 (Pyridoxine)", fccConcentration: "12.5mg/10mg/mL",
      sortOrder: t.order,
      nameEn: t.name, shortEn: `${t.dose} weekly. Same active ingredient as Mounjaro & Zepbound.`,
      variants: [{ sku: `${t.sku}-1MO`, label: `1 Month — ${t.dose}`, doseLevel: t.dose, supplyDuration: "1-month", price: t.price, sortOrder: 1 }],
    });
  }

  await upsertProduct({
    slug: "anti-nausea-ondansetron",
    sku: "SUP-ONDAN",
    category: "compounded",
    programTag: "weight-management, add-on, anti-nausea",
    fulfillment: "direct_ship", dosageForm: "Oral",
    sortOrder: 20,
    nameEn: "Anti-Nausea (Ondansetron)",
    nameEs: "Antináusea (Ondansetron)",
    shortEn: "Ondansetron 4mg 10ct — weight management add-on for nausea relief.",
    shortEs: "Ondansetron 4mg 10ct — complemento para náuseas durante el tratamiento.",
    variants: [{ sku: "SUP-ONDAN-10CT", label: "10ct", supplyDuration: "one-time", price: 2000, sortOrder: 1 }],
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 2. ORAL GlowRx
  // ═══════════════════════════════════════════════════════════════════════
  console.log("\n💊 Oral GlowRx...");

  await upsertProduct({
    slug: "oral-glp1",
    sku: "WM-GLOWRX",
    category: "oral",
    programTag: "weight-management, oral, glow-rx",
    fulfillment: "direct_ship", dosageForm: "Capsule",
    isFeatured: true, sortOrder: 1,
    nameEn: "GlowRx Oral Weight Management",
    nameEs: "Manejo de Peso Oral GlowRx",
    shortEn: "Non-injection oral weight management. Monthly or multi-month supply.",
    shortEs: "Manejo de peso oral sin inyecciones. Suministro mensual o de varios meses.",
    variants: [
      { sku: "ORAL-OT", label: "One-Time Purchase", supplyDuration: "one-time", price: 14900, sortOrder: 1 },
      { sku: "ORAL-1MO", label: "1 Month Supply", supplyDuration: "1-month", price: 12900, sortOrder: 2 },
      { sku: "ORAL-3MO", label: "3 Month Supply", supplyDuration: "3-month", price: 11900, compareAtPrice: 12900, sortOrder: 3 },
      { sku: "ORAL-6MO", label: "6 Month Supply", supplyDuration: "6-month", price: 10900, compareAtPrice: 12900, sortOrder: 4 },
    ],
  });

  await upsertProduct({
    slug: "glowrx-appetite-control",
    sku: "WM-GLOWRX-ACC",
    category: "oral",
    programTag: "weight-management, oral, glow-rx, appetite-control",
    fulfillment: "direct_ship", dosageForm: "Capsule",
    fccMedicationName: "Bupropion/Naltrexone/Chromium", fccConcentration: "90mg/8mg/200mcg",
    sortOrder: 2,
    nameEn: "GlowRx Appetite & Craving Control",
    nameEs: "GlowRx Control de Apetito y Antojos",
    shortEn: "Bupropion/Naltrexone/Chromium SR — reduces cravings and appetite. 30ct capsules.",
    shortEs: "Bupropion/Naltrexona/Cromo — reduce los antojos y el apetito. 30 cápsulas.",
    variants: [
      { sku: "WM-GLOWRX-ACC-1MO", label: "30ct — 1 Month", doseLevel: "90mg/8mg/200mcg", supplyDuration: "1-month", price: 12900, compareAtPrice: 15900, sortOrder: 1 },
      { sku: "WM-GLOWRX-ACC-3MO", label: "30ct × 3 Months", doseLevel: "90mg/8mg/200mcg", supplyDuration: "3-month", price: 11900, compareAtPrice: 15900, sortOrder: 2 },
      { sku: "WM-GLOWRX-ACC-6MO", label: "70ct — Extended Supply", doseLevel: "90mg/8mg/200mcg", supplyDuration: "6-month", price: 10900, compareAtPrice: 15900, sortOrder: 3 },
    ],
  });

  await upsertProduct({
    slug: "glowrx-metabolic-reset",
    sku: "WM-GLOWRX-MR",
    category: "oral",
    programTag: "weight-management, oral, glow-rx, metabolic-reset",
    fulfillment: "direct_ship", dosageForm: "Capsule",
    fccMedicationName: "Metformin / Topiramate", fccConcentration: "250mg/5mg",
    sortOrder: 3,
    nameEn: "GlowRx Metabolic Reset",
    nameEs: "GlowRx Reinicio Metabólico",
    shortEn: "Metformin/Topiramate — metabolic support for blood sugar and weight. 30ct capsules.",
    shortEs: "Metformina/Topiramato — soporte metabólico para azúcar en sangre y peso. 30 cápsulas.",
    variants: [
      { sku: "WM-GLOWRX-MR-1MO", label: "30ct — 5mg Standard", doseLevel: "250mg/5mg", supplyDuration: "1-month", price: 12900, compareAtPrice: 15900, sortOrder: 1 },
      { sku: "WM-GLOWRX-MR-3MO", label: "30ct × 3 Months", doseLevel: "250mg/5mg", supplyDuration: "3-month", price: 11900, compareAtPrice: 15900, sortOrder: 2 },
      { sku: "WM-GLOWRX-MR-10MG", label: "30ct — 10mg Higher Dose", doseLevel: "250mg/10mg", supplyDuration: "1-month", price: 12900, sortOrder: 3 },
    ],
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 3. BRANDED RX (Insurance & Self-Pay)
  // ═══════════════════════════════════════════════════════════════════════
  console.log("\n🏷️  Branded Rx...");

  await upsertProduct({
    slug: "branded-glp1-rx",
    sku: "BRX-RX-FEE",
    category: "branded_rx",
    programTag: "branded-rx, self-pay",
    fulfillment: "pharmacy_rx", dosageForm: "Injectable",
    isFeatured: true, sortOrder: 1,
    nameEn: "Branded GLP-1 Prescription",
    nameEs: "Receta de GLP-1 de Marca",
    shortEn: "$45 for your prescription — Wegovy or Zepbound. You fill at the pharmacy.",
    shortEs: "$45 por tu receta — Wegovy o Zepbound. Tú la surtes en la farmacia.",
    variants: [
      { sku: "BRX-RX", label: "Rx Fee (one-time)", supplyDuration: "one-time", price: 4500, sortOrder: 1 },
    ],
  });

  await upsertProduct({
    slug: "branded-rx-management",
    sku: "BMGMT-MGT",
    category: "branded_rx",
    programTag: "branded-rx, management",
    fulfillment: "pharmacy_rx", dosageForm: "Injectable",
    requiresPrescription: false, sortOrder: 2,
    nameEn: "Branded Rx Management",
    nameEs: "Gestión de Rx de Marca",
    shortEn: "Ongoing clinical management for patients on branded GLP-1 medications.",
    shortEs: "Gestión clínica continua para pacientes con medicamentos GLP-1 de marca.",
    variants: [
      { sku: "BMGMT-1MO", label: "1 Month", supplyDuration: "1-month", price: 5500, sortOrder: 1 },
      { sku: "BMGMT-3MO", label: "3 Months", supplyDuration: "3-month", price: 4500, compareAtPrice: 5500, sortOrder: 2 },
      { sku: "BMGMT-6MO", label: "6 Months", supplyDuration: "6-month", price: 2500, compareAtPrice: 5500, sortOrder: 3 },
    ],
  });

  // Insurance branded
  await upsertProduct({
    slug: "ins-wegovy-injection",
    sku: "INS-WEGOVY-INJ",
    category: "branded_rx",
    programTag: "insurance-branded, semaglutide, wegovy",
    fulfillment: "pharmacy_rx", dosageForm: "Injectable",
    pathBOngoingPrice: 7500, sortOrder: 3,
    nameEn: "Wegovy Injection (Insurance)",
    nameEs: "Inyección Wegovy (Seguro)",
    shortEn: "Wegovy (semaglutide) injection through insurance. Ongoing program management $75/mo.",
    shortEs: "Inyección Wegovy (semaglutida) por seguro. Gestión del programa $75/mes.",
    variants: [
      { sku: "INS-WEGOVY-INJ-025", label: "0.25mg", doseLevel: "0.25mg", price: 7500, sortOrder: 1 },
      { sku: "INS-WEGOVY-INJ-050", label: "0.5mg", doseLevel: "0.5mg", price: 7500, sortOrder: 2 },
      { sku: "INS-WEGOVY-INJ-100", label: "1mg", doseLevel: "1mg", price: 7500, sortOrder: 3 },
      { sku: "INS-WEGOVY-INJ-170", label: "1.7mg", doseLevel: "1.7mg", price: 7500, sortOrder: 4 },
      { sku: "INS-WEGOVY-INJ-240", label: "2.4mg", doseLevel: "2.4mg", price: 7500, sortOrder: 5 },
    ],
  });

  await upsertProduct({
    slug: "ins-wegovy-pill",
    sku: "INS-WEGOVY-PILL",
    category: "branded_rx",
    programTag: "insurance-branded, semaglutide, wegovy, oral",
    fulfillment: "pharmacy_rx", dosageForm: "Oral",
    pathBOngoingPrice: 7500, sortOrder: 4,
    nameEn: "Wegovy Pill (Insurance)",
    nameEs: "Pastilla Wegovy (Seguro)",
    shortEn: "Wegovy oral tablet through insurance. Program management $75/mo.",
    shortEs: "Tableta oral Wegovy por seguro. Gestión del programa $75/mes.",
    variants: [{ sku: "INS-WEGOVY-PILL-STD", label: "All doses", price: 7500, sortOrder: 1 }],
  });

  await upsertProduct({
    slug: "ins-ozempic",
    sku: "INS-OZEMPIC",
    category: "branded_rx",
    programTag: "insurance-branded, semaglutide, ozempic",
    fulfillment: "pharmacy_rx", dosageForm: "Injectable",
    pathBOngoingPrice: 7500, sortOrder: 5,
    nameEn: "Ozempic Injection (Insurance)",
    nameEs: "Inyección Ozempic (Seguro)",
    shortEn: "Ozempic (semaglutide) injection through insurance. Program management $75/mo.",
    shortEs: "Inyección Ozempic (semaglutida) por seguro. Gestión del programa $75/mes.",
    variants: [
      { sku: "INS-OZEMPIC-025", label: "0.25mg", doseLevel: "0.25mg", price: 7500, sortOrder: 1 },
      { sku: "INS-OZEMPIC-050", label: "0.5mg", doseLevel: "0.5mg", price: 7500, sortOrder: 2 },
      { sku: "INS-OZEMPIC-100", label: "1mg", doseLevel: "1mg", price: 7500, sortOrder: 3 },
      { sku: "INS-OZEMPIC-200", label: "2mg", doseLevel: "2mg", price: 7500, sortOrder: 4 },
    ],
  });

  await upsertProduct({
    slug: "ins-mounjaro",
    sku: "INS-MOUNJARO",
    category: "branded_rx",
    programTag: "insurance-branded, tirzepatide, mounjaro",
    fulfillment: "pharmacy_rx", dosageForm: "Injectable",
    pathBOngoingPrice: 7500, sortOrder: 6,
    nameEn: "Mounjaro Injection (Insurance)",
    nameEs: "Inyección Mounjaro (Seguro)",
    shortEn: "Mounjaro (tirzepatide) injection through insurance. Program management $75/mo.",
    shortEs: "Inyección Mounjaro (tirzepatida) por seguro. Gestión del programa $75/mes.",
    variants: [
      { sku: "INS-MOUNJARO-250", label: "2.5mg", doseLevel: "2.5mg", price: 7500, sortOrder: 1 },
      { sku: "INS-MOUNJARO-500", label: "5mg", doseLevel: "5mg", price: 7500, sortOrder: 2 },
      { sku: "INS-MOUNJARO-750", label: "7.5mg", doseLevel: "7.5mg", price: 7500, sortOrder: 3 },
      { sku: "INS-MOUNJARO-1000", label: "10mg", doseLevel: "10mg", price: 7500, sortOrder: 4 },
      { sku: "INS-MOUNJARO-1250", label: "12.5mg", doseLevel: "12.5mg", price: 7500, sortOrder: 5 },
      { sku: "INS-MOUNJARO-1500", label: "15mg", doseLevel: "15mg", price: 7500, sortOrder: 6 },
    ],
  });

  await upsertProduct({
    slug: "ins-zepbound",
    sku: "INS-ZEPBOUND",
    category: "branded_rx",
    programTag: "insurance-branded, tirzepatide, zepbound",
    fulfillment: "pharmacy_rx", dosageForm: "Injectable",
    pathBOngoingPrice: 7500, sortOrder: 7,
    nameEn: "Zepbound Injection (Insurance)",
    nameEs: "Inyección Zepbound (Seguro)",
    shortEn: "Zepbound (tirzepatide) injection through insurance. Program management $75/mo.",
    shortEs: "Inyección Zepbound (tirzepatida) por seguro. Gestión del programa $75/mes.",
    variants: [
      { sku: "INS-ZEPBOUND-250", label: "2.5mg", doseLevel: "2.5mg", price: 7500, sortOrder: 1 },
      { sku: "INS-ZEPBOUND-500", label: "5mg", doseLevel: "5mg", price: 7500, sortOrder: 2 },
      { sku: "INS-ZEPBOUND-750", label: "7.5mg", doseLevel: "7.5mg", price: 7500, sortOrder: 3 },
      { sku: "INS-ZEPBOUND-1000", label: "10mg", doseLevel: "10mg", price: 7500, sortOrder: 4 },
      { sku: "INS-ZEPBOUND-1250", label: "12.5mg", doseLevel: "12.5mg", price: 7500, sortOrder: 5 },
      { sku: "INS-ZEPBOUND-1500", label: "15mg", doseLevel: "15mg", price: 7500, sortOrder: 6 },
    ],
  });

  // Self-Pay Branded
  const selfPayItems = [
    { slug: "sp-wegovy-injection", sku: "SP-WEGOVY-INJ", name: "Wegovy Injection (Self-Pay)", nameEs: "Inyección Wegovy (Pago Propio)", dosageForm: "Injectable", order: 8 },
    { slug: "sp-wegovy-pill", sku: "SP-WEGOVY-PILL", name: "Wegovy Pill (Self-Pay)", nameEs: "Pastilla Wegovy (Pago Propio)", dosageForm: "Oral", order: 9 },
    { slug: "sp-zepbound-pen", sku: "SP-ZEPBOUND-PEN", name: "Zepbound Qwik Pen (Self-Pay)", nameEs: "Pluma Zepbound (Pago Propio)", dosageForm: "Injectable", order: 10 },
    { slug: "sp-zepbound-vial", sku: "SP-ZEPBOUND-VIAL", name: "Zepbound Vial (Self-Pay)", nameEs: "Vial Zepbound (Pago Propio)", dosageForm: "Injectable", order: 11 },
  ];
  for (const sp of selfPayItems) {
    await upsertProduct({
      slug: sp.slug, sku: sp.sku, category: "branded_rx",
      programTag: "branded-rx, self-pay", fulfillment: "pharmacy_rx", dosageForm: sp.dosageForm,
      sortOrder: sp.order,
      nameEn: sp.name, nameEs: sp.nameEs,
      shortEn: "Patient pays pharmacy cash price. Body Good charges management fee only.",
      shortEs: "El paciente paga en farmacia. Body Good cobra solo la tarifa de gestión.",
      variants: [{ sku: `${sp.sku}-MGT`, label: "Management Fee", supplyDuration: "1-month", price: 4900, sortOrder: 1 }],
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 4. INSURANCE NAVIGATION SERVICES
  // ═══════════════════════════════════════════════════════════════════════
  console.log("\n🏥 Insurance services...");

  await upsertProduct({
    slug: "insurance-eligibility-check",
    sku: "INS-ELIG-SVC",
    category: "insurance",
    programTag: "insurance, eligibility",
    fulfillment: "direct_ship", requiresPrescription: false, sortOrder: 1,
    nameEn: "Insurance Eligibility Check",
    nameEs: "Verificación de Elegibilidad de Seguro",
    shortEn: "Comprehensive insurance eligibility verification for GLP-1 coverage.",
    shortEs: "Verificación completa de elegibilidad de seguro para cobertura GLP-1.",
    variants: [{ sku: "INS-ELIG", label: "One-Time Check", supplyDuration: "one-time", price: 2500, sortOrder: 1 }],
  });

  await upsertProduct({
    slug: "insurance-prior-auth",
    sku: "INS-PA-SVC",
    category: "insurance",
    programTag: "insurance, prior-auth",
    fulfillment: "direct_ship", requiresPrescription: false, sortOrder: 2,
    nameEn: "Insurance Prior Authorization",
    nameEs: "Preautorización de Seguro",
    shortEn: "PA submission and advocacy for GLP-1 insurance approval.",
    shortEs: "Envío de PA y defensa para aprobación de GLP-1 por seguro.",
    variants: [{ sku: "INS-PA", label: "Prior Authorization", supplyDuration: "one-time", price: 5000, sortOrder: 1 }],
  });

  await upsertProduct({
    slug: "insurance-approval",
    sku: "INS-APPROVAL-SVC",
    category: "insurance",
    programTag: "insurance, approval",
    fulfillment: "direct_ship", requiresPrescription: false, sortOrder: 3,
    nameEn: "Insurance Approval Management",
    nameEs: "Gestión de Aprobación de Seguro",
    shortEn: "Post-approval management and pharmacy coordination.",
    shortEs: "Gestión post-aprobación y coordinación con farmacia.",
    variants: [{ sku: "INS-APPR", label: "Approval Management", supplyDuration: "one-time", price: 8500, sortOrder: 1 }],
  });

  await upsertProduct({
    slug: "insurance-ongoing-mgmt",
    sku: "INS-ONGOING-SVC",
    category: "insurance",
    programTag: "insurance, ongoing",
    fulfillment: "direct_ship", requiresPrescription: false, sortOrder: 4,
    nameEn: "Insurance Ongoing Management",
    nameEs: "Gestión Continua de Seguro",
    shortEn: "Monthly refill management, re-authorization, coverage maintenance.",
    shortEs: "Gestión mensual de reabastecimiento, re-autorización y mantenimiento de cobertura.",
    variants: [{ sku: "INS-MGMT", label: "Monthly Management", supplyDuration: "1-month", price: 7500, sortOrder: 1 }],
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 5. WELLNESS INJECTIONS (v2 catalog — March 2026)
  // ═══════════════════════════════════════════════════════════════════════
  console.log("\n✨ Wellness injections...");

  // Deactivate legacy products replaced by v2 catalog
  await prisma.product.updateMany({
    where: { slug: { in: ["wellness-bioboost", "wellness-mic", "wellness-b12", "wellness-nad-injection", "wellness-nad-spray", "wellness-sermorelin"] } },
    data: { isActive: false },
  });

  await upsertProduct({
    slug: "lipotropic-super-b", sku: "WI-LSB-1MO", category: "wellness-injection",
    programTag: "wellness-injection, energy, metabolism, b-vitamins, fat-burning, upsell",
    fulfillment: "direct_ship", dosageForm: "Injectable",
    fccMedicationName: "Lipotropic Super B",
    requiresPrescription: true, isActive: true, isFeatured: true, sortOrder: 1,
    nameEn: "Lipotropic Super B Injection", nameEs: "Inyección Lipotrópica Super B",
    shortEn: "11-ingredient energy and metabolism powerhouse — B12, B-complex, L-Carnitine, and fat-burning lipotropics in one shot.",
    shortEs: "Potente fórmula de 11 ingredientes para energía y metabolismo — B12, complejo B, L-Carnitina y lipotrópicos en una sola inyección.",
    variants: [
      { sku: "WI-LSB-1MO-10ML", label: "10mL — 1-Month Supply", supplyDuration: "1-month", price: 12900, sortOrder: 1 },
      { sku: "WI-LSB-3MO-30ML", label: "30mL — 3-Month Supply", supplyDuration: "3-month", price: 9900, compareAtPrice: 12900, sortOrder: 2 },
    ],
  });

  await upsertProduct({
    slug: "nad-plus", sku: "WI-NAD-1MO", category: "wellness-injection",
    programTag: "wellness-injection, longevity, anti-aging, energy, cellular-health, upsell",
    fulfillment: "direct_ship", dosageForm: "Injectable",
    fccMedicationName: "NAD+ (Nicotinamide Adenine Dinucleotide)", fccConcentration: "100mg/mL",
    requiresPrescription: true, isActive: true, isFeatured: true, sortOrder: 2,
    nameEn: "NAD+ Injection", nameEs: "Inyección de NAD+",
    shortEn: "NAD+ 100mg/mL, 10mL vial. Cellular energy, anti-aging, and metabolic health.",
    shortEs: "NAD+ 100mg/mL, vial de 10mL. Energía celular, anti-envejecimiento y salud metabólica.",
    variants: [
      { sku: "WI-NAD-1MO-10ML", label: "10mL — 1-Month Supply", supplyDuration: "1-month", price: 19900, sortOrder: 1 },
    ],
  });

  await upsertProduct({
    slug: "sermorelin", sku: "WI-SERM-1MO", category: "wellness-injection",
    programTag: "wellness-injection, peptide, growth-hormone, anti-aging, recovery, sleep, upsell",
    fulfillment: "direct_ship", dosageForm: "Injectable",
    fccMedicationName: "Sermorelin", fccConcentration: "1.5mg/mL",
    requiresPrescription: true, isActive: true, isFeatured: true, sortOrder: 3,
    nameEn: "Sermorelin Injection", nameEs: "Inyección de Sermorelina",
    shortEn: "Sermorelin 1.5mg/mL peptide — growth hormone secretagogue. 6mL vial, 30-day supply.",
    shortEs: "Péptido Sermorelina 1.5mg/mL — secretagogo de hormona de crecimiento. Vial de 6mL, 30 días.",
    variants: [
      { sku: "WI-SERM-1MO-6ML", label: "6mL — 1-Month Supply", doseLevel: "1.5mg/mL", supplyDuration: "1-month", price: 17900, sortOrder: 1 },
    ],
  });

  await upsertProduct({
    slug: "glutathione", sku: "WI-GLUT-1MO", category: "wellness-injection",
    programTag: "wellness-injection, detox, skin, antioxidant, wellness, upsell",
    fulfillment: "direct_ship", dosageForm: "Injectable",
    fccMedicationName: "Glutathione", fccConcentration: "200mg/mL",
    requiresPrescription: true, isActive: true, isFeatured: true, sortOrder: 4,
    nameEn: "Glutathione Injection", nameEs: "Inyección de Glutatión",
    shortEn: "Master antioxidant — supports detox, skin radiance, and cellular health. 30mL vial.",
    shortEs: "Antioxidante maestro — apoya la desintoxicación, luminosidad de piel y salud celular. Vial de 30mL.",
    variants: [
      { sku: "WI-GLUT-1MO-30ML", label: "30mL — 1-Month Supply", supplyDuration: "1-month", price: 14900, sortOrder: 1 },
    ],
  });

  await upsertProduct({
    slug: "l-carnitine", sku: "WI-LCAR-1MO", category: "wellness-injection",
    programTag: "wellness-injection, fat-burning, energy, metabolism, muscle, upsell",
    fulfillment: "direct_ship", dosageForm: "Injectable",
    fccMedicationName: "L-Carnitine (Levocarnitine)", fccConcentration: "500mg/mL",
    requiresPrescription: true, isActive: true, isFeatured: false, sortOrder: 5,
    nameEn: "L-Carnitine Injection", nameEs: "Inyección de L-Carnitina",
    shortEn: "Amino acid that shuttles fat into cells for energy — supports fat burning and muscle preservation.",
    shortEs: "Aminoácido que transporta grasa a las células para energía — apoya la quema de grasa y preservación muscular.",
    variants: [
      { sku: "WI-LCAR-1MO-10ML", label: "10mL — 1-Month Supply", supplyDuration: "1-month", price: 9900, sortOrder: 1 },
    ],
  });

  await upsertProduct({
    slug: "lipo-c", sku: "WI-LIPOC-1MO", category: "wellness-injection",
    programTag: "wellness-injection, fat-burning, weight-loss, metabolism, lipotropic, upsell",
    fulfillment: "direct_ship", dosageForm: "Injectable",
    fccMedicationName: "Lipo-C",
    requiresPrescription: true, isActive: true, isFeatured: false, sortOrder: 6,
    nameEn: "Lipo-C Injection", nameEs: "Inyección Lipo-C",
    shortEn: "Fat-burning lipotropic blend — MIC + L-Carnitine + Thiamine for enhanced metabolism.",
    shortEs: "Mezcla lipotrópica quema-grasa — MIC + L-Carnitina + Tiamina para un metabolismo mejorado.",
    variants: [
      { sku: "WI-LIPOC-1MO-10ML", label: "10mL — 1-Month Supply", supplyDuration: "1-month", price: 9900, sortOrder: 1 },
    ],
  });

  await upsertProduct({
    slug: "vitamin-b12", sku: "WI-B12-1MO", category: "wellness-injection",
    programTag: "wellness-injection, energy, metabolism, b12, wellness, upsell",
    fulfillment: "direct_ship", dosageForm: "Injectable",
    fccMedicationName: "Vitamin B12 (Methylcobalamin)", fccConcentration: "1mg/mL",
    requiresPrescription: true, isActive: true, isFeatured: false, sortOrder: 7,
    nameEn: "Vitamin B12 Injection", nameEs: "Inyección de Vitamina B12",
    shortEn: "Medical-grade Methylcobalamin (B12) — supports energy, metabolism, and nerve function. 10mL vial.",
    shortEs: "Metilcobalamina (B12) de grado médico — apoya la energía, el metabolismo y la función nerviosa. Vial de 10mL.",
    variants: [
      { sku: "WI-B12-1MO-10ML", label: "10mL — 1-Month Supply", supplyDuration: "1-month", price: 5900, sortOrder: 1 },
    ],
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 6. HAIR LOSS
  // ═══════════════════════════════════════════════════════════════════════
  console.log("\n💆 Hair loss...");

  await upsertProduct({
    slug: "hair-restore-starter-women", sku: "HL-W-ORAL-MINOX", category: "hair",
    programTag: "hair-loss, women, oral", fulfillment: "dual_path", dosageForm: "Capsule",
    forGender: "women", fccMedicationName: "Minoxidil", fccConcentration: "2.5mg",
    pathBConsultPrice: 4900, pathBOngoingPrice: 2500, sortOrder: 1,
    nameEn: "Hair Restore Starter (Women)", nameEs: "Restauración Capilar Básica (Mujeres)",
    shortEn: "Minoxidil 2.5mg oral capsules, 30ct. Dual-path: direct purchase or with consultation.",
    shortEs: "Cápsulas orales de Minoxidil 2.5mg, 30ct. Doble vía: compra directa o con consulta.",
    variants: [
      { sku: "HL-W-ORAL-MINOX-A", label: "Path A — Direct ($39/mo)", supplyDuration: "1-month", price: 3900, sortOrder: 1 },
      { sku: "HL-W-ORAL-MINOX-B", label: "Path B — With Consultation ($49)", supplyDuration: "one-time", price: 4900, sortOrder: 2 },
    ],
  });

  await upsertProduct({
    slug: "hair-restore-topical-women", sku: "HL-W-TOPICAL", category: "hair",
    programTag: "hair-loss, women, topical", fulfillment: "dual_path", dosageForm: "Topical",
    forGender: "women", fccMedicationName: "Minoxidil, Tretinoin, Fluocinolone, VitE/Melatonin",
    fccConcentration: "5%/0.01%/0.01%/10IU/0.7%",
    pathBConsultPrice: 4900, pathBOngoingPrice: 2500, sortOrder: 2,
    nameEn: "Hair Restore Topical (Women)", nameEs: "Restauración Capilar Tópica (Mujeres)",
    shortEn: "Multi-compound topical formula for female hair loss. 30mL, dual-path.",
    shortEs: "Fórmula tópica multicompuesto para pérdida de cabello femenina. 30mL.",
    variants: [
      { sku: "HL-W-TOPICAL-A", label: "Path A — Direct ($59/mo)", supplyDuration: "1-month", price: 5900, sortOrder: 1 },
      { sku: "HL-W-TOPICAL-B", label: "Path B — With Consultation ($49)", supplyDuration: "one-time", price: 4900, sortOrder: 2 },
    ],
  });

  await upsertProduct({
    slug: "hair-restore-plus-women", sku: "HL-W-PLUS", category: "hair",
    programTag: "hair-loss, women, combo", fulfillment: "dual_path", dosageForm: "Capsule",
    forGender: "women", fccMedicationName: "Minoxidil + GHK-Cu/Biotin",
    pathBConsultPrice: 4900, pathBOngoingPrice: 2500, sortOrder: 3,
    nameEn: "Hair Restore Plus (Women)", nameEs: "Restauración Capilar Plus (Mujeres)",
    shortEn: "Oral Minoxidil + Scalp Peptide combo. Best results bundle for women.",
    shortEs: "Combo Minoxidil oral + Péptido capilar. Mejor paquete de resultados para mujeres.",
    variants: [
      { sku: "HL-W-PLUS-A", label: "Path A — Direct ($79/mo)", supplyDuration: "1-month", price: 7900, sortOrder: 1 },
      { sku: "HL-W-PLUS-B", label: "Path B — With Consultation ($49)", supplyDuration: "one-time", price: 4900, sortOrder: 2 },
    ],
  });

  await upsertProduct({
    slug: "scalp-peptide-serum-women", sku: "HL-W-PEPTIDE", category: "hair",
    programTag: "hair-loss, women, peptide, compounded-exclusive",
    fulfillment: "direct_ship", dosageForm: "Topical", forGender: "women",
    fccMedicationName: "GHK-Cu/Biotin", fccConcentration: "0.5%/1%", sortOrder: 4,
    nameEn: "Scalp Peptide Serum (Women)", nameEs: "Suero Péptido Capilar (Mujeres)",
    shortEn: "GHK-Cu/Biotin topical foam 30mL. Compounded-exclusive. Stimulates hair follicles.",
    shortEs: "Espuma tópica GHK-Cu/Biotina 30mL. Solo compuesta. Estimula folículos capilares.",
    variants: [{ sku: "HL-W-PEPTIDE-30ML", label: "30mL Foam", supplyDuration: "1-month", price: 7900, sortOrder: 1 }],
  });

  await upsertProduct({
    slug: "hair-restore-rx-men", sku: "HL-M-FIN", category: "hair",
    programTag: "hair-loss, men, oral, finasteride", fulfillment: "dual_path", dosageForm: "Capsule",
    forGender: "men", fccMedicationName: "Finasteride", fccConcentration: "1mg",
    pathBConsultPrice: 4900, pathBOngoingPrice: 2500, sortOrder: 5,
    nameEn: "Hair Restore Rx (Men)", nameEs: "Restauración Capilar Rx (Hombres)",
    shortEn: "Finasteride 1mg capsules, 30ct. Clinically proven for male pattern baldness.",
    shortEs: "Cápsulas de Finasterida 1mg, 30ct. Clínicamente probado para calvicie masculina.",
    variants: [
      { sku: "HL-M-FIN-A", label: "Path A — Direct ($35/mo)", supplyDuration: "1-month", price: 3500, sortOrder: 1 },
      { sku: "HL-M-FIN-B", label: "Path B — With Consultation ($49)", supplyDuration: "one-time", price: 4900, sortOrder: 2 },
    ],
  });

  await upsertProduct({
    slug: "hair-restore-combo-men", sku: "HL-M-COMBO", category: "hair",
    programTag: "hair-loss, men, topical, combo", fulfillment: "dual_path", dosageForm: "Topical",
    forGender: "men", fccMedicationName: "Minoxidil, Finasteride, Arginine, Biotin",
    fccConcentration: "7%/0.25%/2%/0.3%",
    pathBConsultPrice: 4900, pathBOngoingPrice: 2500, sortOrder: 6,
    nameEn: "Hair Restore Combo Spray (Men)", nameEs: "Spray Combo Capilar (Hombres)",
    shortEn: "Minoxidil/Finasteride/Arginine/Biotin topical spray 30mL. Dual-path.",
    shortEs: "Spray tópico Minoxidil/Finasterida/Arginina/Biotina 30mL.",
    variants: [
      { sku: "HL-M-COMBO-A", label: "Path A — Direct ($59/mo)", supplyDuration: "1-month", price: 5900, sortOrder: 1 },
      { sku: "HL-M-COMBO-B", label: "Path B — With Consultation ($49)", supplyDuration: "one-time", price: 4900, sortOrder: 2 },
    ],
  });

  await upsertProduct({
    slug: "hair-restore-max-men", sku: "HL-M-MAX", category: "hair",
    programTag: "hair-loss, men, topical, max, compounded-exclusive",
    fulfillment: "direct_ship", dosageForm: "Topical", forGender: "men",
    fccMedicationName: "Minoxidil/Finasteride/Latanoprost/Caffeine/Azelaic/Spironolactone/Melatonin",
    fccConcentration: "7%/0.9%/0.005%/2%/1.5%/0.52%/0.7%", sortOrder: 7,
    nameEn: "Hair Restore Max (Men)", nameEs: "Restauración Capilar Máx (Hombres)",
    shortEn: "7-compound max formula spray 30mL. Compounded-exclusive. Premium hair restoration.",
    shortEs: "Spray fórmula máxima de 7 compuestos 30mL. Solo compuesto. Premium.",
    variants: [{ sku: "HL-M-MAX-30ML", label: "30mL Spray", supplyDuration: "1-month", price: 7900, sortOrder: 1 }],
  });

  await upsertProduct({
    slug: "dutasteride-rx-men", sku: "HL-M-DUT", category: "hair",
    programTag: "hair-loss, men, oral, dutasteride", fulfillment: "dual_path", dosageForm: "Capsule",
    forGender: "men", fccMedicationName: "Dutasteride", fccConcentration: "2.5mg",
    pathBConsultPrice: 4900, pathBOngoingPrice: 2500, sortOrder: 8,
    nameEn: "Dutasteride Rx (Men — Advanced)", nameEs: "Dutasterida Rx (Hombres — Avanzado)",
    shortEn: "Dutasteride 2.5mg capsules, 30ct. Advanced DHT blocker for severe hair loss.",
    shortEs: "Cápsulas de Dutasterida 2.5mg, 30ct. Bloqueador avanzado de DHT.",
    variants: [
      { sku: "HL-M-DUT-A", label: "Path A — Direct ($59/mo)", supplyDuration: "1-month", price: 5900, sortOrder: 1 },
      { sku: "HL-M-DUT-B", label: "Path B — With Consultation ($49)", supplyDuration: "one-time", price: 4900, sortOrder: 2 },
    ],
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 7. SKINCARE
  // ═══════════════════════════════════════════════════════════════════════
  console.log("\n🧴 Skincare...");

  await upsertProduct({
    slug: "glow-cream", sku: "SK-GLOW", category: "skincare",
    programTag: "skincare, anti-aging, acne, glow-cream", fulfillment: "dual_path", dosageForm: "Cream",
    fccMedicationName: "Azelaic Acid, Tretinoin, Niacinamide", fccConcentration: "8%/0.1%/15%",
    pathBConsultPrice: 4900, pathBOngoingPrice: 2500, sortOrder: 1,
    nameEn: "Glow Cream", nameEs: "Crema Glow",
    shortEn: "Azelaic Acid/Tretinoin/Niacinamide cream, 30g. Acne + anti-aging. Dual-path.",
    shortEs: "Crema de Ácido Azelaico/Tretinoína/Niacinamida, 30g. Acné + anti-envejecimiento.",
    variants: [
      { sku: "SK-GLOW-A", label: "Path A — Direct ($69/mo)", supplyDuration: "1-month", price: 6900, sortOrder: 1 },
      { sku: "SK-GLOW-B", label: "Path B — Consultation ($49)", supplyDuration: "one-time", price: 4900, sortOrder: 2 },
    ],
  });

  await upsertProduct({
    slug: "bright-cream", sku: "SK-BRIGHT", category: "skincare",
    programTag: "skincare, hyperpigmentation, melasma, dark-spots", fulfillment: "dual_path", dosageForm: "Cream",
    fccMedicationName: "Hydroquinone, Tretinoin, Azelaic Acid, Kojic Acid, Hydrocortisone",
    fccConcentration: "8%/0.1%/15%/0.25%/1%",
    pathBConsultPrice: 4900, pathBOngoingPrice: 2500, sortOrder: 2,
    nameEn: "Bright Cream (Hyperpigmentation)", nameEs: "Crema Bright (Hiperpigmentación)",
    shortEn: "Brightening cream for melasma & dark spots. Hydroquinone/Tretinoin/Kojic, 30g.",
    shortEs: "Crema aclarante para melasma y manchas oscuras. 30g.",
    variants: [
      { sku: "SK-BRIGHT-A", label: "Path A — Direct ($89/mo)", supplyDuration: "1-month", price: 8900, sortOrder: 1 },
      { sku: "SK-BRIGHT-B", label: "Path B — Consultation ($49)", supplyDuration: "one-time", price: 4900, sortOrder: 2 },
    ],
  });

  await upsertProduct({
    slug: "even-tone-cream", sku: "SK-EVENTONE", category: "skincare",
    programTag: "skincare, hyperpigmentation, even-tone", fulfillment: "dual_path", dosageForm: "Cream",
    fccMedicationName: "Hydroquinone, Kojic Acid, Tranexamic Acid, Vitamin E",
    fccConcentration: "6%/3%/5%/1%",
    pathBConsultPrice: 4900, pathBOngoingPrice: 2500, sortOrder: 3,
    nameEn: "Even Tone Cream", nameEs: "Crema Even Tone",
    shortEn: "Hydroquinone/Kojic Acid/Tranexamic Acid for skin discoloration. 30g.",
    shortEs: "Hidroquinona/Ácido Kójico/Ácido Tranexámico para decoloración de piel. 30g.",
    variants: [
      { sku: "SK-EVENTONE-A", label: "Path A — Direct ($85/mo)", supplyDuration: "1-month", price: 8500, sortOrder: 1 },
      { sku: "SK-EVENTONE-B", label: "Path B — Consultation ($49)", supplyDuration: "one-time", price: 4900, sortOrder: 2 },
    ],
  });

  await upsertProduct({
    slug: "rosacea-calm-cream", sku: "SK-ROSACEA", category: "skincare",
    programTag: "skincare, rosacea, redness", fulfillment: "dual_path", dosageForm: "Cream",
    fccMedicationName: "Niacinamide, Metronidazole", fccConcentration: "4%/1%",
    pathBConsultPrice: 4900, pathBOngoingPrice: 2500, sortOrder: 4,
    nameEn: "Rosacea Calm Cream", nameEs: "Crema Calmante Rosácea",
    shortEn: "Niacinamide/Metronidazole cream for rosacea and redness. 30g.",
    shortEs: "Crema de Niacinamida/Metronidazol para rosácea y enrojecimiento. 30g.",
    variants: [
      { sku: "SK-ROSACEA-A", label: "Path A — Direct ($55/mo)", supplyDuration: "1-month", price: 5500, sortOrder: 1 },
      { sku: "SK-ROSACEA-B", label: "Path B — Consultation ($49)", supplyDuration: "one-time", price: 4900, sortOrder: 2 },
    ],
  });

  await upsertProduct({
    slug: "age-defying-cream", sku: "SK-AGEDEFY", category: "skincare",
    programTag: "skincare, anti-aging, premium, compounded-exclusive",
    fulfillment: "direct_ship", dosageForm: "Cream",
    fccMedicationName: "Estriol / Tretinoin / Alpha Lipoic Acid / Hyaluronic Acid / Vitamin C",
    fccConcentration: "0.3%/0.01%/0.45%/0.05%/0.5%", sortOrder: 5,
    nameEn: "Age-Defying Cream (Premium)", nameEs: "Crema Antienvejecimiento (Premium)",
    shortEn: "Premium estriol anti-aging cream. Compounded-exclusive. 30g.",
    shortEs: "Crema antienvejecimiento premium de estriol. Solo compuesta. 30g.",
    variants: [{ sku: "SK-AGEDEFY-30G", label: "30g Cream", supplyDuration: "1-month", price: 7900, sortOrder: 1 }],
  });

  await upsertProduct({
    slug: "anti-aging-peptide-cream", sku: "SK-PEPTIDE", category: "skincare",
    programTag: "skincare, anti-aging, peptide, compounded-exclusive",
    fulfillment: "direct_ship", dosageForm: "Cream",
    fccMedicationName: "DMAE/Estriol/GHK-Cu/Ascorbic Acid/Sodium Hyaluronate",
    fccConcentration: "3%/0.3%/0.5%/1%/0.5%", sortOrder: 6,
    nameEn: "Anti-Aging Peptide Cream", nameEs: "Crema Péptido Antienvejecimiento",
    shortEn: "DMAE/Estriol/GHK-Cu peptide anti-aging cream. Compounded-exclusive. 30g.",
    shortEs: "Crema de péptidos DMAE/Estriol/GHK-Cu. Solo compuesta. 30g.",
    variants: [{ sku: "SK-PEPTIDE-30G", label: "30g Cream", supplyDuration: "1-month", price: 9500, sortOrder: 1 }],
  });

  await upsertProduct({
    slug: "hormonal-acne-rx", sku: "SK-ACNE-SPIRO", category: "skincare",
    programTag: "skincare, acne, hormonal, pharmacy-rx", fulfillment: "pharmacy_rx", dosageForm: "Oral",
    pathBConsultPrice: 4900, pathBOngoingPrice: 2500, sortOrder: 7,
    nameEn: "Hormonal Acne Rx (Spironolactone)", nameEs: "Rx Acné Hormonal (Espironolactona)",
    shortEn: "Spironolactone Rx to pharmacy for hormonal acne. $49 consult fee.",
    shortEs: "Receta de Espironolactona a farmacia para acné hormonal. $49 consulta.",
    variants: [{ sku: "SK-ACNE-SPIRO-CONSULT", label: "Consultation Fee", supplyDuration: "one-time", price: 4900, sortOrder: 1 }],
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 8. FEMININE HEALTH
  // ═══════════════════════════════════════════════════════════════════════
  console.log("\n🌸 Feminine health...");

  await upsertProduct({
    slug: "uti-rx", sku: "FH-UTI", category: "feminine_health",
    programTag: "feminine-health, uti, acute, pharmacy-rx", fulfillment: "pharmacy_rx", dosageForm: "Oral",
    pathBConsultPrice: 3500, sortOrder: 1,
    nameEn: "UTI Rx", nameEs: "Rx IVU",
    shortEn: "UTI treatment Rx (Nitrofurantoin or TMP-SMX) to pharmacy. $35 consult.",
    shortEs: "Receta IVU (Nitrofurantoína o TMP-SMX) a farmacia. $35 consulta.",
    variants: [{ sku: "FH-UTI-CONSULT", label: "Consultation Fee", supplyDuration: "one-time", price: 3500, sortOrder: 1 }],
  });

  await upsertProduct({
    slug: "yeast-infection-rx", sku: "FH-YEAST", category: "feminine_health",
    programTag: "feminine-health, yeast, acute, pharmacy-rx", fulfillment: "pharmacy_rx", dosageForm: "Oral",
    pathBConsultPrice: 3500, sortOrder: 2,
    nameEn: "Yeast Infection Rx", nameEs: "Rx Infección por Hongos",
    shortEn: "Yeast infection Rx (Fluconazole 150mg) to pharmacy. $35 consult.",
    shortEs: "Receta de infección por hongos (Fluconazol 150mg) a farmacia. $35 consulta.",
    variants: [{ sku: "FH-YEAST-CONSULT", label: "Consultation Fee", supplyDuration: "one-time", price: 3500, sortOrder: 1 }],
  });

  await upsertProduct({
    slug: "bv-rx", sku: "FH-BV", category: "feminine_health",
    programTag: "feminine-health, bv, acute, pharmacy-rx", fulfillment: "pharmacy_rx", dosageForm: "Oral",
    pathBConsultPrice: 3500, sortOrder: 3,
    nameEn: "BV Rx", nameEs: "Rx VB",
    shortEn: "Bacterial vaginosis Rx (Metronidazole 500mg) to pharmacy. $35 consult.",
    shortEs: "Receta de vaginosis bacteriana (Metronidazol 500mg) a farmacia. $35 consulta.",
    variants: [{ sku: "FH-BV-CONSULT", label: "Consultation Fee", supplyDuration: "one-time", price: 3500, sortOrder: 1 }],
  });

  await upsertProduct({
    slug: "vaginal-dryness-estradiol", sku: "FH-VAGDRY", category: "feminine_health",
    programTag: "feminine-health, vaginal-dryness, menopause", fulfillment: "dual_path", dosageForm: "Topical",
    fccMedicationName: "Estradiol (E2) Vaginal",
    pathBConsultPrice: 4900, pathBOngoingPrice: 2500, sortOrder: 4,
    nameEn: "Vaginal Dryness Rx (Estradiol)", nameEs: "Rx Sequedad Vaginal (Estradiol)",
    shortEn: "Estradiol E2 vaginal gel 30g. Dual-path — compounded or pharmacy.",
    shortEs: "Gel vaginal Estradiol E2 30g. Doble vía — compuesto o farmacia.",
    variants: [
      { sku: "FH-VAGDRY-A", label: "Path A — Direct ($65/mo)", supplyDuration: "1-month", price: 6500, sortOrder: 1 },
      { sku: "FH-VAGDRY-B", label: "Path B — Consultation ($49)", supplyDuration: "one-time", price: 4900, sortOrder: 2 },
    ],
  });

  await upsertProduct({
    slug: "vaginal-dryness-estriol", sku: "FH-ESTRIOL", category: "feminine_health",
    programTag: "feminine-health, vaginal-dryness, compounded-exclusive",
    fulfillment: "direct_ship", dosageForm: "Topical", fccMedicationName: "Estriol (E3) Vaginal", sortOrder: 5,
    nameEn: "Vaginal Dryness Rx (Estriol)", nameEs: "Rx Sequedad Vaginal (Estriol)",
    shortEn: "Estriol E3 vaginal gel 30g. Compounded-exclusive (estriol not commercially available).",
    shortEs: "Gel vaginal Estriol E3 30g. Solo compuesto (estriol no disponible comercialmente).",
    variants: [{ sku: "FH-ESTRIOL-30G", label: "30g Vaginal Gel", supplyDuration: "1-month", price: 6500, sortOrder: 1 }],
  });

  await upsertProduct({
    slug: "intimate-wellness-cream", sku: "FH-SCREAM1", category: "feminine_health",
    programTag: "feminine-health, sexual-wellness, arousal, compounded-exclusive",
    fulfillment: "direct_ship", dosageForm: "Cream",
    fccMedicationName: "Sildenafil / Arginine / Papaverine", sortOrder: 6,
    nameEn: "Intimate Wellness Cream", nameEs: "Crema de Bienestar Íntimo",
    shortEn: "Scream Cream 1 — Sildenafil/Arginine/Papaverine, 30g. Compounded arousal cream.",
    shortEs: "Crema Scream 1 — Sildenafil/Arginina/Papaverina, 30g. Crema de activación compuesta.",
    variants: [{ sku: "FH-SCREAM1-30G", label: "30g Cream", supplyDuration: "one-time", price: 6500, sortOrder: 1 }],
  });

  await upsertProduct({
    slug: "intimate-wellness-cream-plus", sku: "FH-SCREAM2", category: "feminine_health",
    programTag: "feminine-health, sexual-wellness, arousal, compounded-exclusive",
    fulfillment: "direct_ship", dosageForm: "Cream",
    fccMedicationName: "Sildenafil / Arginine / Papaverine / Testosterone", sortOrder: 7,
    nameEn: "Intimate Wellness Cream Plus", nameEs: "Crema de Bienestar Íntimo Plus",
    shortEn: "Scream Cream 2 — adds Testosterone for enhanced effect, 30g. Compounded.",
    shortEs: "Crema Scream 2 — añade Testosterona para mayor efecto, 30g. Compuesta.",
    variants: [{ sku: "FH-SCREAM2-30G", label: "30g Cream", supplyDuration: "one-time", price: 7500, sortOrder: 1 }],
  });

  await upsertProduct({
    slug: "connection-rx-oxytocin", sku: "FH-OXYTOCIN", category: "feminine_health",
    programTag: "feminine-health, sexual-wellness, oxytocin, compounded-exclusive",
    fulfillment: "direct_ship", dosageForm: "Nasal Spray",
    fccMedicationName: "Oxytocin", fccConcentration: "25 IU/0.1mL", sortOrder: 8,
    nameEn: "Connection Rx (Oxytocin)", nameEs: "Rx Conexión (Oxitocina)",
    shortEn: "Oxytocin 25 IU/0.1mL nasal spray, 15mL. Enhances bonding and intimacy.",
    shortEs: "Spray nasal Oxitocina 25 IU/0.1mL, 15mL. Mejora el vínculo y la intimidad.",
    variants: [{ sku: "FH-OXYTOCIN-15ML", label: "15mL Nasal Spray", supplyDuration: "1-month", price: 7900, sortOrder: 1 }],
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 9. MENTAL WELLNESS
  // ═══════════════════════════════════════════════════════════════════════
  console.log("\n🧠 Mental wellness...");

  const mwPharmacy = [
    { slug: "calm-rx-anxiety", sku: "MW-ANXIETY", name: "Calm Rx (Anxiety)", nameEs: "Rx Calma (Ansiedad)", concern: "Generalized Anxiety", rx: "Buspirone 5–15mg", order: 1 },
    { slug: "stage-ready-performance", sku: "MW-STAGE", name: "Stage Ready (Performance Anxiety)", nameEs: "Stage Ready (Ansiedad de Rendimiento)", concern: "Stage Fright", rx: "Propranolol 10–20mg", order: 2 },
    { slug: "sleep-rx-trazodone", sku: "MW-SLEEP-TRAZ", name: "Sleep Rx (Trazodone)", nameEs: "Rx Sueño (Trazodona)", concern: "Insomnia", rx: "Trazodone 25–50mg", order: 3 },
    { slug: "sleep-rx-hydroxyzine", sku: "MW-SLEEP-HYD", name: "Sleep Rx (Hydroxyzine)", nameEs: "Rx Sueño (Hidroxizina)", concern: "Insomnia + Anxiety", rx: "Hydroxyzine 25mg", order: 4 },
    { slug: "lift-rx-ssri", sku: "MW-SSRI", name: "Lift Rx (Depression — SSRI)", nameEs: "Rx Lift (Depresión — ISRS)", concern: "Depression", rx: "Sertraline/Escitalopram/Fluoxetine", order: 5 },
    { slug: "lift-rx-plus-snri", sku: "MW-SNRI", name: "Lift Rx Plus (Depression — SNRI)", nameEs: "Rx Lift Plus (Depresión — IRSN)", concern: "Moderate-Severe Depression", rx: "Venlafaxine or Duloxetine", order: 6 },
    { slug: "momentum-rx-bupropion", sku: "MW-BUPROPION", name: "Momentum Rx (Low Motivation)", nameEs: "Rx Momentum (Baja Motivación)", concern: "Low Motivation", rx: "Bupropion XL 150mg", order: 7 },
  ];
  for (const mw of mwPharmacy) {
    await upsertProduct({
      slug: mw.slug, sku: mw.sku, category: "mental_wellness",
      programTag: "mental-wellness, pharmacy-rx, non-controlled",
      fulfillment: "pharmacy_rx", dosageForm: "Oral",
      pathBConsultPrice: 4900, pathBOngoingPrice: 2500, sortOrder: mw.order,
      nameEn: mw.name, nameEs: mw.nameEs,
      shortEn: `${mw.rx} Rx to pharmacy. $49 consultation + $25/mo ongoing management.`,
      shortEs: `Receta ${mw.rx} a farmacia. $49 consulta + $25/mes gestión continua.`,
      variants: [
        { sku: `${mw.sku}-CONSULT`, label: "Initial Consultation", supplyDuration: "one-time", price: 4900, sortOrder: 1 },
        { sku: `${mw.sku}-MGMT`, label: "Ongoing Management (Monthly)", supplyDuration: "1-month", price: 2500, sortOrder: 2 },
      ],
    });
  }

  await upsertProduct({
    slug: "calm-peptide-spray", sku: "MW-SELANK", category: "mental_wellness",
    programTag: "mental-wellness, anxiety, peptide, compounded-exclusive",
    fulfillment: "direct_ship", dosageForm: "Nasal Spray",
    fccMedicationName: "Selank Acetate (TP-7) Nasal Spray", sortOrder: 8,
    nameEn: "Calm Peptide Spray (Premium)", nameEs: "Spray Péptido Calma (Premium)",
    shortEn: "Selank Acetate (TP-7) nasal spray. Fast-acting peptide for anxiety. Compounded-exclusive.",
    shortEs: "Spray nasal Selank Acetato (TP-7). Péptido de acción rápida. Solo compuesto.",
    variants: [{ sku: "MW-SELANK-SPRAY", label: "Nasal Spray (30-day)", supplyDuration: "1-month", price: 12900, sortOrder: 1 }],
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 10. SERVICES
  // ═══════════════════════════════════════════════════════════════════════
  console.log("\n🛎️  Services...");

  await upsertProduct({
    slug: "acute-care-consultation", sku: "SVC-CONSULT-ACUTE", category: "services",
    programTag: "consultation, acute, feminine-health",
    fulfillment: "direct_ship", requiresPrescription: false, sortOrder: 1,
    nameEn: "Acute Care Consultation", nameEs: "Consulta de Atención Aguda",
    shortEn: "One-time provider consult for acute conditions (UTI/Yeast/BV). Rx sent to pharmacy.",
    shortEs: "Consulta única para condiciones agudas (IVU/Hongos/VB). Receta enviada a farmacia.",
    variants: [{ sku: "SVC-CONSULT-ACUTE-FEE", label: "Consultation Fee", supplyDuration: "one-time", price: 3500, sortOrder: 1 }],
  });

  await upsertProduct({
    slug: "new-patient-consultation", sku: "SVC-CONSULT-NEW", category: "services",
    programTag: "consultation, new-patient",
    fulfillment: "direct_ship", requiresPrescription: false, sortOrder: 2,
    nameEn: "New Patient Consultation", nameEs: "Consulta de Nuevo Paciente",
    shortEn: "Initial provider evaluation for new service lines (hair, skin, mental wellness).",
    shortEs: "Evaluación inicial para nuevas líneas de servicio (cabello, piel, bienestar mental).",
    variants: [{ sku: "SVC-CONSULT-NEW-FEE", label: "Consultation Fee", supplyDuration: "one-time", price: 4900, sortOrder: 1 }],
  });

  await upsertProduct({
    slug: "ongoing-care-management", sku: "SVC-MGMT-MONTHLY", category: "services",
    programTag: "management, ongoing",
    fulfillment: "direct_ship", requiresPrescription: false, sortOrder: 3,
    nameEn: "Ongoing Care Management", nameEs: "Gestión de Atención Continua",
    shortEn: "Monthly check-ins, dose adjustments, messaging access, refill management.",
    shortEs: "Revisiones mensuales, ajustes de dosis, acceso a mensajes, gestión de resurtidos.",
    variants: [{ sku: "SVC-MGMT-MONTHLY-FEE", label: "Monthly Fee", supplyDuration: "1-month", price: 2500, sortOrder: 1 }],
  });

  const finalCount = await prisma.product.count();
  const variantCount = await prisma.productVariant.count();
  console.log(`\n✅ Seed complete! ${finalCount} products, ${variantCount} variants in database.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
