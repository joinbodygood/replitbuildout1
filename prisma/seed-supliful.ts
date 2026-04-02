/**
 * Supliful Supplement Catalog Seed
 * Creates 24 real Supliful products with locally-hosted images.
 * Also deactivates the 10 placeholder supplements from the initial seed.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const SUPPLEMENTS: Array<{
  slug: string;
  sku: string;
  category: string;
  dosageForm: string;
  nameEn: string;
  nameEs: string;
  descShortEn: string;
  descShortEs: string;
  descLongEn: string;
  descLongEs: string;
  price: number;
  compareAtPrice: number | null;
  variantLabel: string;
  image: string;
  isActive: boolean;
  sortOrder: number;
}> = [
  // ── Oral Supplements ────────────────────────────────────────────────────
  {
    slug: "ashwagandha",
    sku: "VOX4ASHW",
    category: "stress-wellness",
    dosageForm: "capsule",
    nameEn: "Ashwagandha",
    nameEs: "Ashwagandha",
    descShortEn: "Ancient adaptogen that calms stress and supports energy, cognition, and overall wellness.",
    descShortEs: "Adaptógeno ancestral que calma el estrés y apoya la energía, la cognición y el bienestar.",
    descLongEn:
      "Ancient Ayurvedic adaptogen that helps calm stress levels. Contains potent chemicals that support overall health including stress response, cognitive function, and energy levels. Clinically studied for its role in reducing cortisol — the primary stress hormone — while supporting adrenal function and sustained energy throughout the day.",
    descLongEs:
      "Adaptógeno ayurvédico ancestral que ayuda a calmar los niveles de estrés. Contiene compuestos potentes que apoyan la salud general, incluyendo la respuesta al estrés, la función cognitiva y los niveles de energía. Estudiado clínicamente por su papel en la reducción del cortisol, la hormona del estrés principal.",
    price: 2390,
    compareAtPrice: null,
    variantLabel: "60 Capsules",
    image: "/images/supplements/VOX4ASHW.jpg",
    isActive: true,
    sortOrder: 10,
  },
  {
    slug: "berberine",
    sku: "JTP4BERB",
    category: "metabolism-support",
    dosageForm: "capsule",
    nameEn: "Berberine",
    nameEs: "Berberina",
    descShortEn: "Supports healthy blood sugar, heart health, and weight management.",
    descShortEs: "Apoya el azúcar en sangre saludable, la salud cardíaca y el control de peso.",
    descLongEn:
      "Supports normal blood sugar levels, promotes heart health, and assists with weight management. Contains Granular Berberine Hydrochloride. Take 2 capsules daily. Berberine activates AMPK — the \"metabolic master switch\" — making it one of the most researched natural compounds for metabolic health.",
    descLongEs:
      "Apoya niveles normales de azúcar en sangre, promueve la salud cardíaca y ayuda con el control de peso. Contiene Clorhidrato de Berberina Granular. La berberina activa el AMPK — el 'interruptor metabólico maestro' — convirtiéndola en uno de los compuestos naturales más investigados para la salud metabólica.",
    price: 3990,
    compareAtPrice: null,
    variantLabel: "60 Capsules",
    image: "/images/supplements/JTP4BERB.jpg",
    isActive: true,
    sortOrder: 20,
  },
  {
    slug: "complete-multivitamin",
    sku: "VOX4COMP",
    category: "daily-essentials",
    dosageForm: "capsule",
    nameEn: "Complete Multivitamin",
    nameEs: "Multivitamínico Completo",
    descShortEn: "Comprehensive daily nutrition with all crucial vitamins, minerals, and antioxidants.",
    descShortEs: "Nutrición diaria completa con todas las vitaminas, minerales y antioxidantes esenciales.",
    descLongEn:
      "Loaded with all crucial vitamins and minerals including a vitamin B complex plus a full range of natural antioxidants. Comprehensive daily nutritional foundation. Especially important during GLP-1 therapy when reduced food intake may limit nutrient variety.",
    descLongEs:
      "Cargado con todas las vitaminas y minerales esenciales, incluyendo un complejo de vitamina B más una gama completa de antioxidantes naturales. Base nutricional diaria integral. Especialmente importante durante la terapia GLP-1 cuando la ingesta reducida de alimentos puede limitar la variedad de nutrientes.",
    price: 3290,
    compareAtPrice: null,
    variantLabel: "60 Capsules / 2-month supply",
    image: "/images/supplements/VOX4COMP.jpg",
    isActive: true,
    sortOrder: 30,
  },
  {
    slug: "creatine-monohydrate",
    sku: "RLC4CREA",
    category: "performance",
    dosageForm: "powder",
    nameEn: "Creatine Monohydrate",
    nameEs: "Monohidrato de Creatina",
    descShortEn: "Clinical-grade creatine for muscle preservation, exercise performance, and recovery.",
    descShortEs: "Creatina de grado clínico para la preservación muscular, el rendimiento y la recuperación.",
    descLongEn:
      "Supports exercise performance, muscle preservation, and recovery. Clinical-grade creatine monohydrate for optimal skeletal muscle function. Particularly valuable for GLP-1 patients who want to preserve lean muscle mass during weight loss. Mix with water or your favorite beverage.",
    descLongEs:
      "Apoya el rendimiento en el ejercicio, la preservación muscular y la recuperación. Monohidrato de creatina de grado clínico para una función muscular esquelética óptima. Especialmente valioso para pacientes con GLP-1 que desean preservar la masa muscular magra durante la pérdida de peso.",
    price: 3390,
    compareAtPrice: null,
    variantLabel: "300g / 60 servings",
    image: "/images/supplements/RLC4CREA.jpg",
    isActive: true,
    sortOrder: 40,
  },
  {
    slug: "gentle-colon-cleanse",
    sku: "NRT5COLO",
    category: "digestive-support",
    dosageForm: "capsule",
    nameEn: "Gentle Colon Cleanse",
    nameEs: "Limpieza de Colon Suave",
    descShortEn: "Promotes regular bowel movements and eases digestive discomfort with fiber, natural extracts, and enzymes.",
    descShortEs: "Promueve movimientos intestinales regulares y alivia el malestar digestivo.",
    descLongEn:
      "Supports and maintains digestive health. Promotes regular bowel movements and eases digestive discomfort with a blend of fiber, natural extracts, and digestive enzymes. GLP-1 medications slow gastric emptying — this formula supports comfortable digestion and regularity without harsh laxative effects.",
    descLongEs:
      "Apoya y mantiene la salud digestiva. Promueve movimientos intestinales regulares y alivia el malestar digestivo con una mezcla de fibra, extractos naturales y enzimas digestivas. Los medicamentos GLP-1 enlentecen el vaciado gástrico — esta fórmula apoya una digestión cómoda y regular.",
    price: 3500,
    compareAtPrice: null,
    variantLabel: "60 Capsules",
    image: "/images/supplements/NRT5COLO.jpg",
    isActive: true,
    sortOrder: 50,
  },
  {
    slug: "gut-detox",
    sku: "VOX4MAXD",
    category: "digestive-support",
    dosageForm: "capsule",
    nameEn: "Gut Detox (Acai Detox)",
    nameEs: "Detox Intestinal (Detox de Acaí)",
    descShortEn: "Natural gut cleansing formula with acai and botanicals to support digestive health.",
    descShortEs: "Fórmula de limpieza intestinal natural con acaí y botánicos para la salud digestiva.",
    descLongEn:
      "A detox supplement combining carefully selected natural ingredients traditionally used for gut cleansing and digestive support. Supports a healthy lifestyle through gentle cleansing. Formulated with Acai extract and botanicals known for their antioxidant and gut-supportive properties.",
    descLongEs:
      "Un suplemento de detox que combina ingredientes naturales cuidadosamente seleccionados, utilizados tradicionalmente para la limpieza intestinal y el apoyo digestivo. Apoya un estilo de vida saludable a través de una limpieza suave. Formulado con extracto de Acaí y botánicos conocidos por sus propiedades antioxidantes.",
    price: 2990,
    compareAtPrice: null,
    variantLabel: "60 Capsules",
    image: "/images/supplements/VOX4MAXD.jpg",
    isActive: true,
    sortOrder: 60,
  },
  {
    slug: "hair-skin-nails-essentials",
    sku: "VOX4HAIR",
    category: "beauty",
    dosageForm: "capsule",
    nameEn: "Hair, Skin & Nails Essentials",
    nameEs: "Esenciales para Cabello, Piel y Uñas",
    descShortEn: "Biotin, B6, and Folate to support elastin and maintain hair, skin, and nail health.",
    descShortEs: "Biotina, B6 y Folato para apoyar la elastina y mantener la salud del cabello, piel y uñas.",
    descLongEn:
      "Vitamin B6, Folate, and Biotin work together to maintain elastin in the hair, skin, and nails. Supports natural glow and healthy tissue function. Biotin at therapeutic levels promotes keratin synthesis, while B6 and Folate support cell renewal. A popular complement to our hair loss programs.",
    descLongEs:
      "Vitamina B6, Folato y Biotina trabajan juntos para mantener la elastina en el cabello, la piel y las uñas. Apoya el brillo natural y la función saludable de los tejidos. La biotina a niveles terapéuticos promueve la síntesis de queratina, mientras que B6 y Folato apoyan la renovación celular.",
    price: 3290,
    compareAtPrice: null,
    variantLabel: "60 Capsules / 2-month supply",
    image: "/images/supplements/VOX4HAIR.jpg",
    isActive: true,
    sortOrder: 70,
  },
  {
    slug: "hydration-powder-passion-fruit",
    sku: "OSM0PASS",
    category: "hydration",
    dosageForm: "powder",
    nameEn: "Hydration Powder — Passion Fruit",
    nameEs: "Polvo de Hidratación — Fruta de la Pasión",
    descShortEn: "Essential electrolyte hydration drink with a refreshing passion fruit flavor.",
    descShortEs: "Bebida de hidratación con electrolitos esenciales y sabor refrescante a fruta de la pasión.",
    descLongEn:
      "Essential electrolyte hydration drink with a refreshing passion fruit flavor. Keeps you hydrated and energized for any activity level. Provides key electrolytes (sodium, potassium, magnesium) to support cellular hydration. Especially useful for GLP-1 patients who may experience reduced thirst cues.",
    descLongEs:
      "Bebida esencial de hidratación con electrolitos y un refrescante sabor a fruta de la pasión. Te mantiene hidratado y energizado para cualquier nivel de actividad. Proporciona electrolitos clave (sodio, potasio, magnesio) para apoyar la hidratación celular.",
    price: 3499,
    compareAtPrice: null,
    variantLabel: "30 Servings",
    image: "/images/supplements/OSM0PASS.jpg",
    isActive: true,
    sortOrder: 80,
  },
  {
    slug: "hydration-powder-peach-mango",
    sku: "OSM0HYMA",
    category: "hydration",
    dosageForm: "powder",
    nameEn: "Hydration Powder — Peach Mango",
    nameEs: "Polvo de Hidratación — Melocotón y Mango",
    descShortEn: "Essential electrolyte hydration drink with a refreshing peach mango flavor.",
    descShortEs: "Bebida de hidratación con electrolitos esenciales y sabor refrescante a melocotón y mango.",
    descLongEn:
      "Essential electrolyte hydration drink with a refreshing peach mango flavor. Keeps you hydrated and energized for any activity level. Provides key electrolytes (sodium, potassium, magnesium) to support cellular hydration. A delicious way to meet your daily hydration goals.",
    descLongEs:
      "Bebida esencial de hidratación con electrolitos y un refrescante sabor a melocotón y mango. Te mantiene hidratado y energizado para cualquier nivel de actividad. Proporciona electrolitos clave (sodio, potasio, magnesio) para apoyar la hidratación celular.",
    price: 3499,
    compareAtPrice: null,
    variantLabel: "30 Servings",
    image: "/images/supplements/OSM0HYMA.jpg",
    isActive: true,
    sortOrder: 90,
  },
  {
    slug: "magnesium-glycinate",
    sku: "VOX4MGNE",
    category: "daily-essentials",
    dosageForm: "capsule",
    nameEn: "Magnesium Glycinate",
    nameEs: "Glicinato de Magnesio",
    descShortEn: "The most bioavailable magnesium form for sleep, stress relief, and muscle recovery.",
    descShortEs: "La forma de magnesio más biodisponible para el sueño, el alivio del estrés y la recuperación muscular.",
    descLongEn:
      "The most bioavailable form of magnesium, chelated with glycine for maximum absorption and zero digestive discomfort. Supports sleep, stress relief, and muscle recovery. GLP-1 patients commonly experience muscle cramps and disrupted sleep — magnesium glycinate addresses both effectively.",
    descLongEs:
      "La forma más biodisponible de magnesio, quelado con glicina para máxima absorción y cero malestar digestivo. Apoya el sueño, el alivio del estrés y la recuperación muscular. Los pacientes con GLP-1 comúnmente experimentan calambres musculares y sueño interrumpido — el glicinato de magnesio aborda ambos eficazmente.",
    price: 2690,
    compareAtPrice: null,
    variantLabel: "60 Capsules / 2-month supply",
    image: "/images/supplements/VOX4MGNE.jpg",
    isActive: true,
    sortOrder: 100,
  },
  {
    slug: "nad-plus-oral",
    sku: "JTP4NADP",
    category: "anti-aging",
    dosageForm: "capsule",
    nameEn: "NAD+ (Oral Supplement)",
    nameEs: "NAD+ (Suplemento Oral)",
    descShortEn: "500mg NAD+ for cellular energy production, metabolic function, and repair.",
    descShortEs: "500mg de NAD+ para la producción de energía celular, función metabólica y reparación.",
    descLongEn:
      "500mg NAD+ (Nicotinamide Adenine Dinucleotide) supporting cellular energy production, metabolic function, and cellular repair processes. NAD+ declines with age — supplementation supports the mitochondrial pathways that power every cell in your body. The oral alternative to NAD+ injections.",
    descLongEs:
      "500mg de NAD+ (Nicotinamida Adenina Dinucleótido) que apoya la producción de energía celular, la función metabólica y los procesos de reparación celular. El NAD+ disminuye con la edad — la suplementación apoya las vías mitocondriales que alimentan cada célula del cuerpo. La alternativa oral a las inyecciones de NAD+.",
    price: 6000,
    compareAtPrice: null,
    variantLabel: "60 Capsules / 2-month supply",
    image: "/images/supplements/JTP4NADP.jpg",
    isActive: true,
    sortOrder: 110,
  },
  {
    slug: "plant-protein-chocolate",
    sku: "JTP7PPCH",
    category: "protein",
    dosageForm: "powder",
    nameEn: "Plant Protein — Chocolate",
    nameEs: "Proteína Vegetal — Chocolate",
    descShortEn: "Vegan chocolate protein with complete amino acids for muscle repair and recovery.",
    descShortEs: "Proteína vegana de chocolate con aminoácidos completos para la reparación y recuperación muscular.",
    descLongEn:
      "Delicious chocolate plant protein with a complete amino acid profile for muscle repair and growth. Vegan, ideal post-workout recovery shake. Helps preserve lean muscle mass during GLP-1-assisted weight loss. No artificial sweeteners, no bloating — just clean, effective plant-based protein.",
    descLongEs:
      "Deliciosa proteína vegetal de chocolate con un perfil completo de aminoácidos para la reparación y el crecimiento muscular. Vegana, ideal como batido de recuperación post-entrenamiento. Ayuda a preservar la masa muscular magra durante la pérdida de peso asistida por GLP-1.",
    price: 4490,
    compareAtPrice: null,
    variantLabel: "30 Servings",
    image: "/images/supplements/JTP7PPCH.jpg",
    isActive: true,
    sortOrder: 120,
  },
  {
    slug: "plant-protein-vanilla",
    sku: "JTP7PPVA",
    category: "protein",
    dosageForm: "powder",
    nameEn: "Plant Protein — Vanilla",
    nameEs: "Proteína Vegetal — Vainilla",
    descShortEn: "Vegan vanilla protein with complete amino acids for muscle repair and recovery.",
    descShortEs: "Proteína vegana de vainilla con aminoácidos completos para la reparación y recuperación muscular.",
    descLongEn:
      "Delicious vanilla plant protein with a complete amino acid profile for muscle repair and growth. Vegan, ideal post-workout recovery shake. Helps preserve lean muscle mass during GLP-1-assisted weight loss. Versatile vanilla flavor that blends well with fruit, nut butter, or coffee.",
    descLongEs:
      "Deliciosa proteína vegetal de vainilla con un perfil completo de aminoácidos para la reparación y el crecimiento muscular. Vegana, ideal como batido de recuperación post-entrenamiento. El versátil sabor vainilla mezcla bien con frutas, mantequilla de nueces o café.",
    price: 4490,
    compareAtPrice: null,
    variantLabel: "30 Servings",
    image: "/images/supplements/JTP7PPVA.jpg",
    isActive: true,
    sortOrder: 130,
  },
  {
    slug: "probiotic-40-billion",
    sku: "VOX4PROB",
    category: "digestive-support",
    dosageForm: "capsule",
    nameEn: "Probiotic 40 Billion with Prebiotics",
    nameEs: "Probiótico 40 Mil Millones con Prebióticos",
    descShortEn: "Four probiotic strains with 40 billion CFU to support gut health and metabolic response.",
    descShortEs: "Cuatro cepas probióticas con 40 mil millones de UFC para apoyar la salud intestinal y la respuesta metabólica.",
    descLongEn:
      "Blend of four probiotic strains (Lactobacillus Acidophilus, Bifidobacterium Lactis, Lactobacillus Plantarum, Lactobacillus Paracasei) with 40 billion CFU to support gut health and metabolic response. GLP-1 medications affect gut motility — this probiotic formula helps maintain microbiome balance during treatment.",
    descLongEs:
      "Mezcla de cuatro cepas probióticas (Lactobacillus Acidophilus, Bifidobacterium Lactis, Lactobacillus Plantarum, Lactobacillus Paracasei) con 40 mil millones de UFC para apoyar la salud intestinal y la respuesta metabólica. Los medicamentos GLP-1 afectan la motilidad intestinal — esta fórmula probiótica ayuda a mantener el equilibrio del microbioma.",
    price: 3090,
    compareAtPrice: null,
    variantLabel: "30 Capsules / 1-month supply",
    image: "/images/supplements/VOX4PROB.jpg",
    isActive: true,
    sortOrder: 140,
  },
  {
    slug: "sleep-well-gummies",
    sku: "VOX4SLPW",
    category: "sleep",
    dosageForm: "gummy",
    nameEn: "Sleep Well Gummies",
    nameEs: "Gomitas para Dormir Bien",
    descShortEn: "Melatonin sleep gummies to help you fall asleep and reach restorative REM sleep.",
    descShortEs: "Gomitas de melatonina para ayudarte a dormir y alcanzar el sueño REM restaurador.",
    descLongEn:
      "Sleep support gummies with melatonin to help fall asleep and enter REM sleep. Supports rest and optimal body and mind functionality. Quality sleep is critical for weight loss success — poor sleep disrupts hunger hormones and reduces GLP-1 effectiveness.",
    descLongEs:
      "Gomitas de apoyo al sueño con melatonina para ayudar a conciliar el sueño y entrar en el sueño REM. Apoya el descanso y la funcionalidad óptima del cuerpo y la mente. El sueño de calidad es fundamental para el éxito en la pérdida de peso — el sueño deficiente altera las hormonas del hambre.",
    price: 2490,
    compareAtPrice: null,
    variantLabel: "60 Gummies",
    image: "/images/supplements/VOX4SLPW.webp",
    isActive: false, // DRAFT — out of stock
    sortOrder: 150,
  },
  {
    slug: "vitamin-d3",
    sku: "RLC3VTD3",
    category: "daily-essentials",
    dosageForm: "capsule",
    nameEn: "Vitamin D3 2,000 IU",
    nameEs: "Vitamina D3 2,000 UI",
    descShortEn: "Essential D3 for immunity, bone health, and mood. Over 40% of Americans are deficient.",
    descShortEs: "D3 esencial para la inmunidad, la salud ósea y el estado de ánimo. Más del 40% de los estadounidenses son deficientes.",
    descLongEn:
      "Essential daily vitamin D3 (cholecalciferol) for immunity, bone health, and mood support. Over 40% of Americans are deficient. Vitamin D3 deficiency is linked to weight gain, depression, poor immune function, and reduced bone density. Particularly recommended during GLP-1 therapy.",
    descLongEs:
      "Vitamina D3 (colecalciferol) esencial para la inmunidad, la salud ósea y el apoyo emocional. Más del 40% de los estadounidenses son deficientes. La deficiencia de vitamina D3 está relacionada con el aumento de peso, la depresión, la función inmune deficiente y la reducción de la densidad ósea.",
    price: 1990,
    compareAtPrice: null,
    variantLabel: "90 Softgels / 3-month supply",
    image: "/images/supplements/RLC3VTD3.jpg",
    isActive: true,
    sortOrder: 160,
  },
  {
    slug: "womens-hormone-balance",
    sku: "VTL4WOVI",
    category: "womens-health",
    dosageForm: "capsule",
    nameEn: "Women's Hormone Balance",
    nameEs: "Balance Hormonal para Mujeres",
    descShortEn: "Botanical blend with Dong Quai, Red Clover, and Black Cohosh for hormonal balance and well-being.",
    descShortEs: "Mezcla botánica con Dong Quai, Trébol Rojo y Cimicifuga para el equilibrio hormonal y el bienestar.",
    descLongEn:
      "Botanical blend of Dong Quai, Red Clover, and Black Cohosh to support normal hormonal balance, reproductive health, and overall well-being during natural hormonal changes. These adaptogens have centuries of use for managing PMS, perimenopause symptoms, and monthly hormonal fluctuations.",
    descLongEs:
      "Mezcla botánica de Dong Quai, Trébol Rojo y Cimicifuga para apoyar el equilibrio hormonal normal, la salud reproductiva y el bienestar general durante los cambios hormonales naturales. Estos adaptógenos tienen siglos de uso para el manejo del SPM, síntomas de perimenopausia y fluctuaciones hormonales mensuales.",
    price: 3050,
    compareAtPrice: null,
    variantLabel: "60 Capsules / 2-month supply",
    image: "/images/supplements/VTL4WOVI.jpg",
    isActive: true,
    sortOrder: 170,
  },

  // ── Topical / Skincare / Hair Care ──────────────────────────────────────
  {
    slug: "botanical-hair-growth-serum",
    sku: "FMN6ROHA",
    category: "hair-care",
    dosageForm: "topical-serum",
    nameEn: "Botanical Hair Growth Serum",
    nameEs: "Sérum Botánico para el Crecimiento del Cabello",
    descShortEn: "Rosemary and Ginger Root extracts to support scalp health and natural hair vitality.",
    descShortEs: "Extractos de romero y raíz de jengibre para la salud del cuero cabelludo y la vitalidad del cabello.",
    descLongEn:
      "Infused with Rosemary Extract and Ginger Root Extract to support scalp health and enhance natural hair vitality and growth. Rosemary has been clinically shown to perform comparably to minoxidil for hair density improvement. Apply directly to the scalp for best results.",
    descLongEs:
      "Infundido con Extracto de Romero y Extracto de Raíz de Jengibre para apoyar la salud del cuero cabelludo y mejorar la vitalidad y el crecimiento natural del cabello. El romero ha demostrado clínicamente un rendimiento comparable al minoxidil para mejorar la densidad del cabello.",
    price: 5500,
    compareAtPrice: null,
    variantLabel: "60mL / 2-month supply",
    image: "/images/supplements/FMN6ROHA.jpg",
    isActive: true,
    sortOrder: 180,
  },
  {
    slug: "gentle-cleansing-gel",
    sku: "EVL0GCGE",
    category: "skincare",
    dosageForm: "topical-gel",
    nameEn: "Gentle Cleansing Gel",
    nameEs: "Gel Limpiador Suave",
    descShortEn: "Oil-free gel cleanser with watermelon and apple extracts to purify without stripping.",
    descShortEs: "Gel limpiador sin aceite con extractos de sandía y manzana para purificar sin resecar.",
    descLongEn:
      "Oil-free gel cleanser with watermelon and apple fruit extracts. Removes impurities and makeup without stripping skin's natural integrity. Suitable for all skin types including sensitive and acne-prone. pH-balanced formula maintains the skin barrier while thoroughly cleansing.",
    descLongEs:
      "Gel limpiador sin aceite con extractos de sandía y manzana. Elimina impurezas y maquillaje sin quitar la integridad natural de la piel. Adecuado para todos los tipos de piel, incluyendo piel sensible y propensa al acné. La fórmula equilibrada en pH mantiene la barrera cutánea.",
    price: 2499,
    compareAtPrice: null,
    variantLabel: "150mL",
    image: "/images/supplements/EVL0GCGE.jpg",
    isActive: true,
    sortOrder: 190,
  },
  {
    slug: "hair-oil-scalp-health",
    sku: "FMN0HAGR",
    category: "hair-care",
    dosageForm: "topical-oil",
    nameEn: "Hair Oil for Scalp Health & Hair Growth",
    nameEs: "Aceite Capilar para la Salud del Cuero Cabelludo y el Crecimiento del Cabello",
    descShortEn: "Castor, Jasmine, Rosemary, and Vitamin A oil blend for scalp health and hair growth.",
    descShortEs: "Mezcla de aceites de ricino, jazmín, romero y vitamina A para el cuero cabelludo y el crecimiento del cabello.",
    descLongEn:
      "Blend of Castor Oil, Jasmine Oil, Rosemary Oil, and Vitamin A to promote scalp health and support healthy hair growth. Castor oil is rich in ricinoleic acid which increases circulation to hair follicles. Rosemary stimulates growth while Jasmine Oil conditions and adds shine.",
    descLongEs:
      "Mezcla de Aceite de Ricino, Aceite de Jazmín, Aceite de Romero y Vitamina A para promover la salud del cuero cabelludo y apoyar el crecimiento saludable del cabello. El aceite de ricino es rico en ácido ricinoleico que aumenta la circulación hacia los folículos capilares.",
    price: 2890,
    compareAtPrice: null,
    variantLabel: "60mL",
    image: "/images/supplements/FMN0HAGR.jpg",
    isActive: true,
    sortOrder: 200,
  },
  {
    slug: "peptide-hair-growth-serum",
    sku: "FMN6PEHA",
    category: "hair-care",
    dosageForm: "topical-serum",
    nameEn: "Peptide Hair Growth Serum",
    nameEs: "Sérum de Péptidos para el Crecimiento del Cabello",
    descShortEn: "Five bioactive peptides including sh-Polypeptide-1 for thicker, more voluminous hair.",
    descShortEs: "Cinco péptidos bioactivos incluyendo sh-Polipéptido-1 para un cabello más grueso y voluminoso.",
    descLongEn:
      "Powerful blend of five bioactive peptides and natural botanical extracts. sh-Polypeptide-1 and sh-Oligopeptide-10 support the appearance of thicker, more voluminous hair. Peptides signal follicle activity and extend the hair growth cycle, making this our most advanced topical hair treatment.",
    descLongEs:
      "Poderosa mezcla de cinco péptidos bioactivos y extractos botánicos naturales. sh-Polipéptido-1 y sh-Oligopéptido-10 apoyan la apariencia de un cabello más grueso y voluminoso. Los péptidos señalizan la actividad folicular y extienden el ciclo de crecimiento del cabello.",
    price: 6500,
    compareAtPrice: null,
    variantLabel: "60mL / 2-month supply",
    image: "/images/supplements/FMN6PEHA.jpg",
    isActive: true,
    sortOrder: 210,
  },
  {
    slug: "peptide-moisturizer",
    sku: "EVL0PPMO",
    category: "skincare",
    dosageForm: "topical-cream",
    nameEn: "Peptide Moisturizer",
    nameEs: "Hidratante de Péptidos",
    descShortEn: "Cranberry extract and rejuvenating peptides to replenish and protect skin against stressors.",
    descShortEs: "Extracto de arándano y péptidos rejuvenecedores para reponer y proteger la piel de los factores estresantes.",
    descLongEn:
      "Combines antioxidant-rich cranberry extract with rejuvenating peptides to replenish and revitalize skin. Protects against environmental stressors. Peptides stimulate collagen production while cranberry extract provides potent antioxidant defense. Ideal for all skin types.",
    descLongEs:
      "Combina extracto de arándano rico en antioxidantes con péptidos rejuvenecedores para reponer y revitalizar la piel. Protege contra los factores estresantes ambientales. Los péptidos estimulan la producción de colágeno mientras el extracto de arándano proporciona una potente defensa antioxidante.",
    price: 2799,
    compareAtPrice: null,
    variantLabel: "50mL",
    image: "/images/supplements/EVL0PPMO.jpg",
    isActive: false, // DRAFT
    sortOrder: 220,
  },
  {
    slug: "vitamin-c-serum",
    sku: "FMN0VITC",
    category: "skincare",
    dosageForm: "topical-serum",
    nameEn: "Vitamin C Serum",
    nameEs: "Sérum de Vitamina C",
    descShortEn: "Brightens complexion, reduces dark spots, and provides antioxidant protection with MAP and Ferulic Acid.",
    descShortEs: "Ilumina el cutis, reduce manchas oscuras y proporciona protección antioxidante con MAP y Ácido Ferúlico.",
    descLongEn:
      "Enriched with Magnesium Ascorbyl Phosphate (MAP), Ferulic Acid, and Ascorbic Acid. Brightens complexion, reduces dark spots, and provides antioxidant protection. MAP is the most stable form of Vitamin C — no oxidation, no orange skin. Ferulic Acid doubles the antioxidant power of Vitamin C and E.",
    descLongEs:
      "Enriquecido con Fosfato de Ascorbilo de Magnesio (MAP), Ácido Ferúlico y Ácido Ascórbico. Ilumina el cutis, reduce las manchas oscuras y proporciona protección antioxidante. El MAP es la forma más estable de vitamina C — sin oxidación. El Ácido Ferúlico duplica el poder antioxidante.",
    price: 2000,
    compareAtPrice: null,
    variantLabel: "30mL",
    image: "/images/supplements/FMN0VITC.jpg",
    isActive: true,
    sortOrder: 230,
  },

  // ── Bundle ───────────────────────────────────────────────────────────────
  {
    slug: "body-transformation-bundle",
    sku: "BUNDLE-BTWEB",
    category: "bundles",
    dosageForm: "bundle",
    nameEn: "Body Transformation Wellness Essential Bundle",
    nameEs: "Paquete Esencial de Bienestar para la Transformación Corporal",
    descShortEn: "6-supplement curated bundle: Creatine, Probiotic, Magnesium, Multivitamin, Protein, and Gut Health.",
    descShortEs: "Paquete de 6 suplementos: Creatina, Probiótico, Magnesio, Multivitamínico, Proteína y Salud Intestinal.",
    descLongEn:
      "Complete nutritional support for your weight loss journey. Curated collection of 6 premium supplements providing the nutritional foundation for transformation. Includes: Creatine Monohydrate, Probiotic 40 Billion, Magnesium Glycinate, Complete Multivitamin, Plant Protein, and Gut Detox. Save $20 vs purchasing individually.",
    descLongEs:
      "Apoyo nutricional completo para tu viaje de pérdida de peso. Colección curada de 6 suplementos premium que proporcionan la base nutricional para la transformación. Incluye: Monohidrato de Creatina, Probiótico 40 Mil Millones, Glicinato de Magnesio, Multivitamínico Completo, Proteína Vegetal y Detox Intestinal. Ahorra $20 vs comprar individualmente.",
    price: 17900,
    compareAtPrice: 19900,
    variantLabel: "6-Supplement Bundle",
    image: "/images/supplements/BUNDLE.png",
    isActive: true,
    sortOrder: 240,
  },
];

async function main() {
  console.log("Step 1: Deactivating placeholder supplements (SUPP-* SKUs)...");
  const deactivated = await db.product.updateMany({
    where: {
      productType: "supplement",
      sku: { startsWith: "SUPP-" },
    },
    data: { isActive: false },
  });
  console.log(`  Deactivated ${deactivated.count} placeholder products.`);

  console.log("\nStep 2: Seeding 24 Supliful supplement products...");

  for (const s of SUPPLEMENTS) {
    const product = await db.product.upsert({
      where: { slug: s.slug },
      update: {
        sku: s.sku,
        category: s.category,
        productType: "supplement",
        dosageForm: s.dosageForm,
        fulfillment: "supliful",
        requiresPrescription: false,
        isActive: s.isActive,
        isFeatured: false,
        sortOrder: s.sortOrder,
      },
      create: {
        slug: s.slug,
        sku: s.sku,
        category: s.category,
        productType: "supplement",
        dosageForm: s.dosageForm,
        fulfillment: "supliful",
        requiresPrescription: false,
        isActive: s.isActive,
        isFeatured: false,
        sortOrder: s.sortOrder,
      },
    });

    // English translation
    await db.productTranslation.upsert({
      where: { productId_locale: { productId: product.id, locale: "en" } },
      update: { name: s.nameEn, descriptionShort: s.descShortEn, descriptionLong: s.descLongEn },
      create: {
        productId: product.id,
        locale: "en",
        name: s.nameEn,
        descriptionShort: s.descShortEn,
        descriptionLong: s.descLongEn,
      },
    });

    // Spanish translation
    await db.productTranslation.upsert({
      where: { productId_locale: { productId: product.id, locale: "es" } },
      update: { name: s.nameEs, descriptionShort: s.descShortEs, descriptionLong: s.descLongEs },
      create: {
        productId: product.id,
        locale: "es",
        name: s.nameEs,
        descriptionShort: s.descShortEs,
        descriptionLong: s.descLongEs,
      },
    });

    // Variant (one per product)
    const existingVariant = await db.productVariant.findFirst({ where: { productId: product.id } });
    if (!existingVariant) {
      await db.productVariant.create({
        data: {
          productId: product.id,
          sku: `${s.sku}-VAR`,
          label: s.variantLabel,
          price: s.price,
          compareAtPrice: s.compareAtPrice,
          isAvailable: s.isActive,
          sortOrder: 0,
        },
      });
    } else {
      await db.productVariant.update({
        where: { id: existingVariant.id },
        data: { label: s.variantLabel, price: s.price, compareAtPrice: s.compareAtPrice },
      });
    }

    // Product image (upsert by checking existing)
    const existingImage = await db.productImage.findFirst({ where: { productId: product.id } });
    if (!existingImage) {
      await db.productImage.create({
        data: { productId: product.id, url: s.image, altText: s.nameEn, sortOrder: 0 },
      });
    } else {
      await db.productImage.update({
        where: { id: existingImage.id },
        data: { url: s.image, altText: s.nameEn },
      });
    }

    const statusTag = s.isActive ? "✓" : "◦ (draft)";
    console.log(`  ${statusTag} ${s.nameEn}`);
  }

  console.log(`\nDone! Seeded ${SUPPLEMENTS.length} Supliful products.`);
  console.log(`  Active:  ${SUPPLEMENTS.filter((s) => s.isActive).length}`);
  console.log(`  Draft:   ${SUPPLEMENTS.filter((s) => !s.isActive).length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
