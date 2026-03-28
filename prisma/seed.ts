import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productTranslation.deleteMany();
  await prisma.product.deleteMany();
  await prisma.faqTranslation.deleteMany();
  await prisma.faqItem.deleteMany();

  // ─── Products ───────────────────────────────────────

  // 1. Compounded Semaglutide
  const semaglutide = await prisma.product.create({
    data: {
      slug: "compounded-semaglutide",
      category: "compounded",
      requiresPrescription: true,
      isActive: true,
      isFeatured: true,
      sortOrder: 1,
      translations: {
        create: [
          {
            locale: "en",
            name: "Compounded Semaglutide",
            descriptionShort: "Affordable GLP-1 weight loss medication — same active ingredient as Ozempic & Wegovy.",
            descriptionLong: "Compounded semaglutide is a GLP-1 receptor agonist that helps regulate appetite and blood sugar. Our compounded version contains the same active ingredient as brand-name Ozempic and Wegovy, prepared by licensed US compounding pharmacies at a fraction of the cost. Includes weekly subcutaneous injections, provider monitoring, and ongoing support.",
            seoTitle: "Compounded Semaglutide for Weight Loss | Body Good Studio",
            seoDescription: "Affordable compounded semaglutide starting at $139/mo. Same active ingredient as Wegovy. Prescribed by board-certified physicians. All-inclusive pricing.",
          },
          {
            locale: "es",
            name: "Semaglutida Compuesta",
            descriptionShort: "Medicamento GLP-1 asequible para bajar de peso — el mismo ingrediente activo que Ozempic y Wegovy.",
            descriptionLong: "La semaglutida compuesta es un agonista del receptor GLP-1 que ayuda a regular el apetito y el azúcar en sangre. Nuestra versión compuesta contiene el mismo ingrediente activo que Ozempic y Wegovy de marca, preparada por farmacias de composición con licencia en EE.UU. a una fracción del costo. Incluye inyecciones subcutáneas semanales, monitoreo del proveedor y soporte continuo.",
            seoTitle: "Semaglutida Compuesta para Bajar de Peso | Body Good Studio",
            seoDescription: "Semaglutida compuesta asequible desde $139/mes. Mismo ingrediente activo que Wegovy. Recetada por médicos certificados.",
          },
        ],
      },
      variants: {
        create: [
          { sku: "SEM-1MO", doseLevel: "All doses", supplyDuration: "1-month", price: 17900, compareAtPrice: null, sortOrder: 1 },
          { sku: "SEM-3MO", doseLevel: "All doses", supplyDuration: "3-month", price: 14900, compareAtPrice: 17900, sortOrder: 2 },
          { sku: "SEM-6MO", doseLevel: "All doses", supplyDuration: "6-month", price: 13900, compareAtPrice: 17900, sortOrder: 3 },
        ],
      },
    },
  });

  // 2. Compounded Tirzepatide (Starter)
  const tirzepatideStarter = await prisma.product.create({
    data: {
      slug: "compounded-tirzepatide-starter",
      category: "compounded",
      requiresPrescription: true,
      isActive: true,
      isFeatured: true,
      sortOrder: 2,
      translations: {
        create: [
          {
            locale: "en",
            name: "Compounded Tirzepatide — Starter",
            descriptionShort: "Dual-action GLP-1/GIP weight loss medication for doses 2.25–9mg.",
            descriptionLong: "Compounded tirzepatide targets both GLP-1 and GIP receptors for enhanced weight loss results. The starter tier covers doses from 2.25mg to 9mg, ideal for patients beginning their weight loss journey. Clinical studies show 20-25% average weight loss. Includes weekly injections, dose titration guidance, and provider support.",
            seoTitle: "Compounded Tirzepatide Starter (2.25-9mg) | Body Good Studio",
            seoDescription: "Compounded tirzepatide starting at $259/mo. Dual-action GLP-1/GIP for enhanced weight loss. Doses 2.25-9mg.",
          },
          {
            locale: "es",
            name: "Tirzepatida Compuesta — Inicio",
            descriptionShort: "Medicamento de doble acción GLP-1/GIP para dosis de 2.25–9mg.",
            descriptionLong: "La tirzepatida compuesta actúa sobre los receptores GLP-1 y GIP para resultados mejorados de pérdida de peso. El nivel de inicio cubre dosis de 2.25mg a 9mg, ideal para pacientes que comienzan su viaje de pérdida de peso. Estudios clínicos muestran 20-25% de pérdida de peso promedio.",
            seoTitle: "Tirzepatida Compuesta Inicio (2.25-9mg) | Body Good Studio",
            seoDescription: "Tirzepatida compuesta desde $259/mes. Doble acción GLP-1/GIP para pérdida de peso mejorada.",
          },
        ],
      },
      variants: {
        create: [
          { sku: "TRZ-S-1MO", doseLevel: "2.25-9mg", supplyDuration: "1-month", price: 29900, compareAtPrice: null, sortOrder: 1 },
          { sku: "TRZ-S-3MO", doseLevel: "2.25-9mg", supplyDuration: "3-month", price: 27900, compareAtPrice: 29900, sortOrder: 2 },
          { sku: "TRZ-S-6MO", doseLevel: "2.25-9mg", supplyDuration: "6-month", price: 25900, compareAtPrice: 29900, sortOrder: 3 },
        ],
      },
    },
  });

  // 3. Compounded Tirzepatide (Maintenance)
  const tirzepatideMaint = await prisma.product.create({
    data: {
      slug: "compounded-tirzepatide-maintenance",
      category: "compounded",
      requiresPrescription: true,
      isActive: true,
      sortOrder: 3,
      translations: {
        create: [
          {
            locale: "en",
            name: "Compounded Tirzepatide — Maintenance",
            descriptionShort: "Higher-dose tirzepatide for patients on 11.25mg+ maintenance doses.",
            descriptionLong: "For patients who have titrated up to maintenance doses of 11.25mg or higher. Continuation of the dual-action GLP-1/GIP therapy with ongoing provider monitoring and support.",
            seoTitle: "Compounded Tirzepatide Maintenance (11.25mg+) | Body Good Studio",
            seoDescription: "Compounded tirzepatide maintenance from $319/mo. For patients on 11.25mg+ doses.",
          },
          {
            locale: "es",
            name: "Tirzepatida Compuesta — Mantenimiento",
            descriptionShort: "Tirzepatida de dosis más alta para pacientes en dosis de mantenimiento de 11.25mg+.",
            descriptionLong: "Para pacientes que han titulado hasta dosis de mantenimiento de 11.25mg o más. Continuación de la terapia de doble acción GLP-1/GIP con monitoreo y soporte continuo del proveedor.",
            seoTitle: "Tirzepatida Compuesta Mantenimiento (11.25mg+) | Body Good Studio",
            seoDescription: "Tirzepatida compuesta mantenimiento desde $319/mes. Para pacientes en dosis de 11.25mg+.",
          },
        ],
      },
      variants: {
        create: [
          { sku: "TRZ-M-1MO", doseLevel: "11.25mg+", supplyDuration: "1-month", price: 34900, compareAtPrice: null, sortOrder: 1 },
          { sku: "TRZ-M-3MO", doseLevel: "11.25mg+", supplyDuration: "3-month", price: 32900, compareAtPrice: 34900, sortOrder: 2 },
          { sku: "TRZ-M-6MO", doseLevel: "11.25mg+", supplyDuration: "6-month", price: 31900, compareAtPrice: 34900, sortOrder: 3 },
        ],
      },
    },
  });

  // 4. Tirzepatide One-Time
  await prisma.product.create({
    data: {
      slug: "tirzepatide-one-time",
      category: "compounded",
      requiresPrescription: true,
      isActive: true,
      sortOrder: 4,
      translations: {
        create: [
          {
            locale: "en",
            name: "Tirzepatide — One-Time Purchase",
            descriptionShort: "Single month of compounded tirzepatide at any dose level.",
            descriptionLong: "Try compounded tirzepatide without a subscription commitment. One-time purchase at a flat rate for any dose level. Perfect for patients wanting to try before committing to a plan.",
            seoTitle: "Tirzepatide One-Time Purchase | Body Good Studio",
            seoDescription: "One-time compounded tirzepatide for $315. Any dose. No subscription required.",
          },
          {
            locale: "es",
            name: "Tirzepatida — Compra Única",
            descriptionShort: "Un mes de tirzepatida compuesta a cualquier nivel de dosis.",
            descriptionLong: "Prueba tirzepatida compuesta sin compromiso de suscripción. Compra única a tarifa plana para cualquier nivel de dosis.",
            seoTitle: "Tirzepatida Compra Única | Body Good Studio",
            seoDescription: "Tirzepatida compuesta por $315. Cualquier dosis. Sin suscripción.",
          },
        ],
      },
      variants: {
        create: [
          { sku: "TRZ-OT", doseLevel: "All doses", supplyDuration: "one-time", price: 31500, sortOrder: 1 },
        ],
      },
    },
  });

  // 5. Oral GLP-1
  await prisma.product.create({
    data: {
      slug: "oral-glp1",
      category: "oral",
      requiresPrescription: true,
      isActive: true,
      isFeatured: true,
      sortOrder: 5,
      translations: {
        create: [
          {
            locale: "en",
            name: "Oral GLP-1",
            descriptionShort: "No needles — oral weight loss medication you take daily.",
            descriptionLong: "For patients who prefer no injections. Our oral GLP-1 option provides effective weight loss in a convenient daily pill format. Same appetite-suppressing benefits without needles. Includes provider monitoring and support.",
            seoTitle: "Oral GLP-1 Weight Loss Medication | Body Good Studio",
            seoDescription: "Oral GLP-1 weight loss medication from $109/mo. No needles required. Daily pill format.",
          },
          {
            locale: "es",
            name: "GLP-1 Oral",
            descriptionShort: "Sin agujas — medicamento oral para bajar de peso que tomas diariamente.",
            descriptionLong: "Para pacientes que prefieren no inyectarse. Nuestra opción de GLP-1 oral proporciona pérdida de peso efectiva en un formato conveniente de pastilla diaria. Los mismos beneficios de supresión del apetito sin agujas.",
            seoTitle: "Medicamento Oral GLP-1 para Bajar de Peso | Body Good Studio",
            seoDescription: "Medicamento oral GLP-1 desde $109/mes. Sin agujas. Formato de pastilla diaria.",
          },
        ],
      },
      variants: {
        create: [
          { sku: "ORAL-OT", doseLevel: null, supplyDuration: "one-time", price: 14900, sortOrder: 1 },
          { sku: "ORAL-1MO", doseLevel: null, supplyDuration: "1-month", price: 12900, sortOrder: 2 },
          { sku: "ORAL-3MO", doseLevel: null, supplyDuration: "3-month", price: 11900, compareAtPrice: 12900, sortOrder: 3 },
          { sku: "ORAL-6MO", doseLevel: null, supplyDuration: "6-month", price: 10900, compareAtPrice: 12900, sortOrder: 4 },
        ],
      },
    },
  });

  // 6. Branded GLP-1 Rx
  await prisma.product.create({
    data: {
      slug: "branded-glp1-rx",
      category: "branded_rx",
      requiresPrescription: true,
      isActive: true,
      isFeatured: true,
      sortOrder: 6,
      translations: {
        create: [
          {
            locale: "en",
            name: "Branded GLP-1 Prescription",
            descriptionShort: "$45 for your prescription — Wegovy or Zepbound. You fill at the pharmacy.",
            descriptionLong: "Get a legitimate prescription for FDA-approved branded GLP-1 medications from a board-certified provider for a flat $45 fee. Choose from Wegovy (pill or injection) or Zepbound (KwikPen or vial). You fill the prescription at your pharmacy or through the manufacturer (NovoCare for Wegovy, LillyDirect for Zepbound) and pay them directly. No subscription. No membership.",
            seoTitle: "Branded GLP-1 Prescription — Wegovy & Zepbound | Body Good Studio",
            seoDescription: "$45 for a Wegovy or Zepbound prescription. Board-certified providers. Fill at your pharmacy. No subscription fees.",
          },
          {
            locale: "es",
            name: "Receta de GLP-1 de Marca",
            descriptionShort: "$45 por tu receta — Wegovy o Zepbound. Tú la surtes en la farmacia.",
            descriptionLong: "Obtén una receta legítima para medicamentos GLP-1 de marca aprobados por la FDA de un proveedor certificado por $45. Elige entre Wegovy (pastilla o inyección) o Zepbound (KwikPen o vial). Surtes la receta en tu farmacia o a través del fabricante y pagas directamente. Sin suscripción. Sin membresía.",
            seoTitle: "Receta GLP-1 de Marca — Wegovy y Zepbound | Body Good Studio",
            seoDescription: "$45 por receta de Wegovy o Zepbound. Proveedores certificados. Sin cuotas de suscripción.",
          },
        ],
      },
      variants: {
        create: [
          { sku: "BRX-RX", doseLevel: null, supplyDuration: "one-time", price: 4500, sortOrder: 1 },
        ],
      },
    },
  });

  // 7. Branded Rx Management
  await prisma.product.create({
    data: {
      slug: "branded-rx-management",
      category: "branded_mgmt",
      requiresPrescription: false,
      isActive: true,
      sortOrder: 7,
      translations: {
        create: [
          {
            locale: "en",
            name: "Branded Rx Management",
            descriptionShort: "Ongoing provider support for patients on branded GLP-1 medications.",
            descriptionLong: "Monthly management service for patients already on branded GLP-1 medications (Wegovy, Zepbound, Ozempic, Mounjaro). Includes dose titration guidance, side effect management, refill coordination, and ongoing provider access.",
            seoTitle: "Branded Rx Management | Body Good Studio",
            seoDescription: "Ongoing branded GLP-1 management from $25/mo. Dose guidance, refill coordination, provider access.",
          },
          {
            locale: "es",
            name: "Manejo de Rx de Marca",
            descriptionShort: "Soporte continuo del proveedor para pacientes con medicamentos GLP-1 de marca.",
            descriptionLong: "Servicio de manejo mensual para pacientes que ya toman medicamentos GLP-1 de marca. Incluye guía de titulación de dosis, manejo de efectos secundarios, coordinación de resurtidos y acceso continuo al proveedor.",
            seoTitle: "Manejo de Rx de Marca | Body Good Studio",
            seoDescription: "Manejo continuo de GLP-1 de marca desde $25/mes. Guía de dosis, coordinación de resurtidos.",
          },
        ],
      },
      variants: {
        create: [
          { sku: "BMGMT-1MO", doseLevel: null, supplyDuration: "1-month", price: 5500, sortOrder: 1 },
          { sku: "BMGMT-3MO", doseLevel: null, supplyDuration: "3-month", price: 4500, compareAtPrice: 5500, sortOrder: 2 },
          { sku: "BMGMT-6MO", doseLevel: null, supplyDuration: "6-month", price: 2500, compareAtPrice: 5500, sortOrder: 3 },
        ],
      },
    },
  });

  // 8-11. Insurance products
  const insuranceProducts = [
    { slug: "insurance-eligibility-check", sku: "INS-ELIG", name: "Insurance Eligibility Check", nameEs: "Verificación de Elegibilidad de Seguro", short: "Find out if your insurance covers GLP-1 medications.", shortEs: "Descubre si tu seguro cubre medicamentos GLP-1.", price: 2500 },
    { slug: "insurance-prior-auth", sku: "INS-PA", name: "Insurance Prior Authorization", nameEs: "Autorización Previa de Seguro", short: "We handle the prior authorization paperwork with your insurer.", shortEs: "Nos encargamos del papeleo de autorización previa con tu aseguradora.", price: 5000 },
    { slug: "insurance-approval", sku: "INS-APPR", name: "Insurance Approval", nameEs: "Aprobación de Seguro", short: "Full approval process to get your GLP-1 covered by insurance.", shortEs: "Proceso completo de aprobación para que tu GLP-1 sea cubierto por el seguro.", price: 8500 },
    { slug: "insurance-ongoing-mgmt", sku: "INS-MGMT", name: "Insurance Ongoing Management", nameEs: "Manejo Continuo de Seguro", short: "Monthly management of your insurance-covered GLP-1 prescription.", shortEs: "Manejo mensual de tu receta GLP-1 cubierta por seguro.", price: 7500 },
  ];

  for (const ins of insuranceProducts) {
    await prisma.product.create({
      data: {
        slug: ins.slug,
        category: "insurance",
        requiresPrescription: false,
        isActive: true,
        sortOrder: 8,
        translations: {
          create: [
            { locale: "en", name: ins.name, descriptionShort: ins.short, descriptionLong: ins.short },
            { locale: "es", name: ins.nameEs, descriptionShort: ins.shortEs, descriptionLong: ins.shortEs },
          ],
        },
        variants: {
          create: [
            { sku: ins.sku, supplyDuration: ins.sku === "INS-MGMT" ? "1-month" : "one-time", price: ins.price, sortOrder: 1 },
          ],
        },
      },
    });
  }

  // ─── FAQ Items ──────────────────────────────────────

  const faqs = [
    { cat: "general", q: "What are GLP-1 medications?", a: "GLP-1 medications (like semaglutide and tirzepatide) are FDA-approved treatments that help regulate appetite and blood sugar. They work by mimicking a natural hormone that signals fullness to your brain, helping you eat less and lose weight effectively.", qEs: "¿Qué son los medicamentos GLP-1?", aEs: "Los medicamentos GLP-1 (como semaglutida y tirzepatida) son tratamientos aprobados por la FDA que ayudan a regular el apetito y el azúcar en sangre." },
    { cat: "general", q: "How much weight can I expect to lose?", a: "Clinical studies show patients lose 15-20% of their body weight on average with GLP-1 medications. Individual results vary based on medication type, dosage, diet, and activity level.", qEs: "¿Cuánto peso puedo esperar perder?", aEs: "Los estudios clínicos muestran que los pacientes pierden 15-20% de su peso corporal en promedio con medicamentos GLP-1." },
    { cat: "insurance", q: "Do you accept insurance?", a: "Yes! We offer an Insurance Navigation Program that helps determine if your insurance covers GLP-1 medications. Start with our free coverage probability check, or purchase a full eligibility verification for $25.", qEs: "¿Aceptan seguro?", aEs: "¡Sí! Ofrecemos un Programa de Navegación de Seguros que ayuda a determinar si tu seguro cubre medicamentos GLP-1." },
    { cat: "glp1", q: "What's the difference between compounded and branded medications?", a: "Branded medications (Wegovy, Zepbound) are manufactured by pharmaceutical companies and are FDA-approved. Compounded medications contain the same active ingredients but are prepared by licensed compounding pharmacies at lower cost. Both are prescribed by our licensed providers.", qEs: "¿Cuál es la diferencia entre medicamentos compuestos y de marca?", aEs: "Los medicamentos de marca (Wegovy, Zepbound) son fabricados por compañías farmacéuticas y están aprobados por la FDA. Los medicamentos compuestos contienen los mismos ingredientes activos pero son preparados por farmacias de composición con licencia a menor costo." },
    { cat: "glp1", q: "How does the $45 branded prescription work?", a: "For $45, one of our board-certified providers writes you a prescription for Wegovy or Zepbound. You then fill the prescription at your pharmacy or through the manufacturer (NovoCare for Wegovy, LillyDirect for Zepbound) and pay them directly for the medication.", qEs: "¿Cómo funciona la receta de marca de $45?", aEs: "Por $45, uno de nuestros proveedores certificados te escribe una receta para Wegovy o Zepbound. Luego surtes la receta en tu farmacia o a través del fabricante y pagas directamente por el medicamento." },
    { cat: "billing", q: "What payment methods do you accept?", a: "We accept PayPal (wallet and credit/debit cards through PayPal). Commitment plans (3-month and 6-month) offer lower monthly rates.", qEs: "¿Qué métodos de pago aceptan?", aEs: "Aceptamos PayPal (billetera y tarjetas de crédito/débito a través de PayPal). Los planes de compromiso (3 meses y 6 meses) ofrecen tarifas mensuales más bajas." },
    { cat: "billing", q: "Can I cancel my subscription?", a: "Yes, you can pause (up to 30 days) or cancel your subscription anytime from your account. We'll walk you through options that might work better before you cancel.", qEs: "¿Puedo cancelar mi suscripción?", aEs: "Sí, puedes pausar (hasta 30 días) o cancelar tu suscripción en cualquier momento desde tu cuenta." },
  ];

  for (let i = 0; i < faqs.length; i++) {
    const f = faqs[i];
    await prisma.faqItem.create({
      data: {
        category: f.cat,
        sortOrder: i + 1,
        isActive: true,
        translations: {
          create: [
            { locale: "en", question: f.q, answer: f.a },
            { locale: "es", question: f.qEs, answer: f.aEs },
          ],
        },
      },
    });
  }

  // ─── Discount Codes ─────────────────────────────────
  await prisma.discountCode.deleteMany();

  await prisma.discountCode.create({
    data: { code: "WELCOME25", type: "fixed", value: 2500, minOrderValue: 10000, isActive: true },
  });
  await prisma.discountCode.create({
    data: { code: "SAVE10", type: "percentage", value: 10, isActive: true },
  });
  await prisma.discountCode.create({
    data: { code: "FRIEND25", type: "fixed", value: 2500, isActive: true },
  });

  console.log(`Discount codes: ${await prisma.discountCode.count()}`);

  // ─── Reviews ────────────────────────────────────────
  await prisma.review.deleteMany();

  const reviews = [
    { name: "Maria G.", rating: 5, title: "Life changing!", body: "I've lost 35 lbs in 4 months on semaglutide. The team at Body Good made everything so easy. Dr. Linda is amazing!", productSlug: "compounded-semaglutide", isVerified: true, isApproved: true },
    { name: "Jessica R.", rating: 5, title: "Finally something that works", body: "After years of trying everything, tirzepatide has been the answer. Down 42 lbs and feeling incredible. The bilingual support was a huge plus for my mom who joined too.", productSlug: "compounded-tirzepatide-starter", isVerified: true, isApproved: true },
    { name: "Ana L.", rating: 5, title: "Excelente servicio", body: "Me encanta que todo está en español. La Dra. Linda es muy atenta y el proceso fue muy fácil. Ya perdí 20 libras!", productSlug: "compounded-semaglutide", isVerified: true, isApproved: true, locale: "es" },
    { name: "David M.", rating: 4, title: "Great experience overall", body: "The oral GLP-1 option was perfect for me since I hate needles. Lost 18 lbs in 3 months. Only giving 4 stars because shipping took a bit longer than expected.", productSlug: "oral-glp1", isVerified: true, isApproved: true },
    { name: "Sarah K.", rating: 5, title: "Insurance program saved me thousands", body: "Body Good helped me get my Wegovy covered by insurance. I was paying $350/month out of pocket before. Now I pay my $30 copay. The $25 eligibility check was the best money I ever spent.", productSlug: "insurance-eligibility-check", isVerified: true, isApproved: true },
    { name: "Carmen V.", rating: 5, title: "Muy profesional", body: "El programa de receta de marca por $45 fue increíble. Obtuve mi receta de Zepbound rápidamente y la surté en LillyDirect. Muy transparente y profesional.", productSlug: "branded-glp1-rx", isVerified: true, isApproved: true, locale: "es" },
  ];

  for (const r of reviews) {
    await prisma.review.create({
      data: {
        email: `${r.name.toLowerCase().replace(/[^a-z]/g, "")}@example.com`,
        ...r,
      },
    });
  }

  console.log(`Reviews: ${await prisma.review.count()}`);

  // ─── Blog Posts ─────────────────────────────────────
  await prisma.blogPostTranslation.deleteMany();
  await prisma.blogPost.deleteMany();

  const posts = [
    {
      slug: "what-are-glp1-medications",
      category: "glp1-education",
      en: {
        title: "What Are GLP-1 Medications and How Do They Work?",
        excerpt: "Everything you need to know about semaglutide, tirzepatide, and how GLP-1 receptor agonists help you lose weight.",
        body: "## What Are GLP-1 Medications?\n\nGLP-1 (glucagon-like peptide-1) receptor agonists are a class of medications originally developed for type 2 diabetes that have shown remarkable results for weight loss.\n\n### How They Work\n\nGLP-1 medications mimic a natural hormone your body produces after eating. This hormone:\n\n- **Signals fullness** to your brain, reducing appetite\n- **Slows stomach emptying**, helping you feel satisfied longer\n- **Regulates blood sugar**, reducing cravings\n\n### Types of GLP-1 Medications\n\n**Semaglutide** (Ozempic/Wegovy class) targets GLP-1 receptors and produces an average of 15% body weight loss.\n\n**Tirzepatide** (Mounjaro/Zepbound class) targets both GLP-1 AND GIP receptors, producing 20-25% average weight loss — the strongest results in clinical trials.\n\n### Is It Right for You?\n\nGLP-1 medications are typically prescribed for adults with a BMI of 27+ (with weight-related conditions) or 30+. Take our quiz to find out which option is right for you.",
      },
      es: {
        title: "¿Qué Son los Medicamentos GLP-1 y Cómo Funcionan?",
        excerpt: "Todo lo que necesitas saber sobre semaglutida, tirzepatida y cómo los agonistas del receptor GLP-1 te ayudan a bajar de peso.",
        body: "## ¿Qué Son los Medicamentos GLP-1?\n\nLos agonistas del receptor GLP-1 son una clase de medicamentos originalmente desarrollados para la diabetes tipo 2 que han mostrado resultados notables para la pérdida de peso.\n\n### Cómo Funcionan\n\nLos medicamentos GLP-1 imitan una hormona natural que tu cuerpo produce después de comer. Esta hormona:\n\n- **Señala saciedad** a tu cerebro, reduciendo el apetito\n- **Retrasa el vaciamiento del estómago**, ayudándote a sentirte satisfecho por más tiempo\n- **Regula el azúcar en sangre**, reduciendo los antojos\n\n### ¿Es Adecuado Para Ti?\n\nLos medicamentos GLP-1 se recetan típicamente para adultos con un BMI de 27+ o 30+. Toma nuestro cuestionario para descubrir cuál opción es la correcta para ti.",
      },
    },
    {
      slug: "compounded-vs-branded-glp1",
      category: "glp1-education",
      en: {
        title: "Compounded vs. Branded GLP-1: What's the Difference?",
        excerpt: "Understanding the differences between compounded semaglutide/tirzepatide and brand-name Wegovy/Zepbound.",
        body: "## Compounded vs. Branded: Understanding Your Options\n\n### Branded Medications\n\nBranded GLP-1 medications like **Wegovy** (semaglutide) and **Zepbound** (tirzepatide) are manufactured by pharmaceutical companies (Novo Nordisk and Eli Lilly) and are FDA-approved.\n\n**Pros:** FDA-approved manufacturing, extensive clinical trial data, manufacturer support programs\n**Cons:** Higher cost ($299-449/month through manufacturer programs)\n\n### Compounded Medications\n\nCompounded GLP-1 medications contain the **same active ingredients** but are prepared by licensed US compounding pharmacies.\n\n**Pros:** Significantly lower cost ($139-349/month), all-inclusive pricing\n**Cons:** Not individually FDA-approved (pharmacies are state-regulated)\n\n### Which Should You Choose?\n\nBoth are prescribed by licensed providers. The choice often comes down to budget and preference. At Body Good, we offer both options with transparent pricing.",
      },
      es: {
        title: "GLP-1 Compuesto vs. de Marca: ¿Cuál es la Diferencia?",
        excerpt: "Entendiendo las diferencias entre semaglutida/tirzepatida compuesta y Wegovy/Zepbound de marca.",
        body: "## Compuesto vs. de Marca: Entendiendo Tus Opciones\n\n### Medicamentos de Marca\n\nLos medicamentos GLP-1 de marca como **Wegovy** y **Zepbound** son fabricados por compañías farmacéuticas y están aprobados por la FDA.\n\n### Medicamentos Compuestos\n\nLos medicamentos GLP-1 compuestos contienen los **mismos ingredientes activos** pero son preparados por farmacias de composición con licencia en EE.UU.\n\n### ¿Cuál Deberías Elegir?\n\nAmbos son recetados por proveedores licenciados. La elección a menudo se reduce al presupuesto y preferencia. En Body Good, ofrecemos ambas opciones con precios transparentes.",
      },
    },
    {
      slug: "does-insurance-cover-glp1",
      category: "insurance-guides",
      en: {
        title: "Does Insurance Cover GLP-1 Weight Loss Medications?",
        excerpt: "A complete guide to getting your insurance to cover Wegovy, Zepbound, and other GLP-1 medications.",
        body: "## Insurance Coverage for GLP-1 Medications\n\nOne of the most common questions we hear: **\"Will my insurance cover GLP-1 medications?\"**\n\nThe answer depends on your carrier, plan type, and state.\n\n### Who Typically Gets Coverage\n\n- PPO plans from major carriers (UnitedHealthcare, BCBS, Aetna) have the highest approval rates\n- Patients with a BMI of 30+ or 27+ with comorbidities\n- Plans that cover \"anti-obesity medications\" in their formulary\n\n### Our Insurance Navigation Program\n\nBody Good offers a step-by-step insurance navigation program:\n\n1. **Free Coverage Check** — instant probability score\n2. **Eligibility Verification ($25)** — definitive answer\n3. **Prior Authorization ($50)** — we handle the paperwork\n4. **Approval ($85)** — full process management\n5. **Ongoing Management ($75/mo)** — monthly prescription support\n\nStart with our free insurance coverage probability checker to see your odds.",
      },
      es: {
        title: "¿El Seguro Cubre Medicamentos GLP-1 para Bajar de Peso?",
        excerpt: "Una guía completa para lograr que tu seguro cubra Wegovy, Zepbound y otros medicamentos GLP-1.",
        body: "## Cobertura de Seguro para Medicamentos GLP-1\n\nUna de las preguntas más comunes que escuchamos: **\"¿Mi seguro cubrirá medicamentos GLP-1?\"**\n\nLa respuesta depende de tu aseguradora, tipo de plan y estado.\n\n### Nuestro Programa de Navegación de Seguros\n\nBody Good ofrece un programa paso a paso:\n\n1. **Verificación Gratuita** — puntuación de probabilidad instantánea\n2. **Verificación de Elegibilidad ($25)**\n3. **Autorización Previa ($50)**\n4. **Aprobación ($85)**\n5. **Manejo Continuo ($75/mes)**\n\nComienza con nuestra verificación gratuita de probabilidad de cobertura.",
      },
    },
  ];

  for (const post of posts) {
    await prisma.blogPost.create({
      data: {
        slug: post.slug,
        category: post.category,
        isPublished: true,
        publishedAt: new Date(),
        translations: {
          create: [
            { locale: "en", ...post.en },
            { locale: "es", ...post.es },
          ],
        },
      },
    });
  }

  console.log(`Blog posts: ${await prisma.blogPost.count()}`);

  console.log("Seed complete!");
  console.log(`Products: ${await prisma.product.count()}`);
  console.log(`Variants: ${await prisma.productVariant.count()}`);
  console.log(`Translations: ${await prisma.productTranslation.count()}`);
  console.log(`FAQs: ${await prisma.faqItem.count()}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
