import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Accordion } from "@/components/ui/Accordion";

type Props = { params: Promise<{ locale: string }> };

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FaqContent locale={locale} />;
}

const sections = [
  {
    heading: "Safety & Efficacy",
    items: [
      {
        question: "Is compounded semaglutide as effective as Ozempic or Wegovy?",
        answer: "Yes, absolutely. The active ingredient — semaglutide — is chemically identical whether it's compounded by a pharmacy or manufactured by Novo Nordisk (Ozempic/Wegovy). The difference is in the delivery method and manufacturing process, not the medication's efficacy. In Dr. Moleon's clinical practice, she has prescribed both brand-name and compounded semaglutide to hundreds of patients, and the weight loss results are equivalent. Compounding offers the same therapeutic effect at a fraction of the cost.",
      },
      {
        question: "How quickly will I see weight loss results?",
        answer: "Most patients notice reduced appetite within the first 1–2 weeks and see initial weight loss (2–5 pounds) within the first month. However, GLP-1 medications work gradually — we start at a low dose and increase slowly to minimize side effects and optimize results. Peak weight loss typically occurs around 16–20 weeks as we reach therapeutic doses. On average, patients lose 1–2 pounds per week, with total weight loss of 15–20% of their body weight over 6–12 months.",
      },
      {
        question: "Is semaglutide safe for long-term use?",
        answer: "Yes. Clinical trials demonstrate semaglutide's safety for at least 2+ years of continuous use, and many patients have been on it longer with excellent tolerance. Obesity is a chronic condition, much like high blood pressure or diabetes, and long-term medication is often necessary for sustained results. We monitor patients regularly with lab work and check-ins to ensure ongoing safety.",
      },
      {
        question: "Does semaglutide cause thyroid cancer in humans?",
        answer: "No. This is a common concern because the FDA requires a \"black box\" warning based on animal studies showing thyroid tumors in rodents at extremely high doses. However, there is no evidence that semaglutide causes thyroid cancer in humans. Millions of people have used GLP-1 medications since 2017, and human clinical trials have not shown increased thyroid cancer risk. As a precaution, we don't prescribe semaglutide to patients with a personal or family history of medullary thyroid carcinoma or MEN2 syndrome.",
      },
      {
        question: "What are the most common side effects, and how do you manage them?",
        answer: "The most common side effects are nausea (20–30% of patients), diarrhea or constipation (10–15%), fatigue, and headaches. These are typically mild and resolve within 4–8 weeks as your body adjusts to the medication. We manage side effects by starting at a low dose and increasing gradually (slow titration), recommending smaller protein-rich meals, staying hydrated, and avoiding greasy or spicy foods. If nausea persists, we may slow down dose increases or prescribe anti-nausea medication.",
      },
      {
        question: "What's the typical dosing schedule for semaglutide?",
        answer: "We start patients at 0.25 mg weekly for the first 4 weeks to minimize side effects. Then we increase to 0.5 mg for 4 weeks, then 1.0 mg, 1.7 mg, and finally 2.4 mg if needed for optimal weight loss. This gradual titration allows your body to adjust comfortably. Some patients achieve excellent results at 1.0–1.7 mg and don't need the maximum dose. Dosing is personalized based on individual response, tolerance, and weight loss goals.",
      },
      {
        question: "Does it matter what time of day I inject semaglutide?",
        answer: "No, you can inject semaglutide at any time of day, with or without food. The medication stays active in your system for about a week, so the specific timing doesn't significantly impact efficacy. We recommend choosing a consistent day and time each week (e.g., Sunday morning) to make it part of your routine.",
      },
      {
        question: "What happens if I miss a dose?",
        answer: "If you realize you missed your dose within 5 days, take it as soon as you remember and resume your regular weekly schedule. If it's been more than 5 days, skip the missed dose and take your next dose on your regular day. Never double up on doses to \"catch up.\" Missing one dose won't ruin your progress, but try to maintain consistency for best results.",
      },
      {
        question: "Can I inject semaglutide anywhere on my body?",
        answer: "Semaglutide is injected subcutaneously (under the skin) in areas with more fatty tissue — primarily the abdomen, thighs, or upper arms. The abdomen (around the belly button area, avoiding the 2-inch radius directly around your navel) tends to have the most consistent absorption. We recommend rotating injection sites each week to prevent irritation or lumps under the skin. The injection itself is quick and relatively painless using the thin needles provided.",
      },
      {
        question: "Is tirzepatide better than semaglutide?",
        answer: "Tirzepatide (Mounjaro/Zepbound) is a dual GIP/GLP-1 agonist, meaning it activates two hormone receptors instead of one. Clinical trials show slightly higher average weight loss with tirzepatide (20–25% of body weight) compared to semaglutide (15–20%). However, individual response varies significantly. Some patients respond better to semaglutide, while others prefer tirzepatide. Cost is also a factor — compounded semaglutide is often more affordable. We'll recommend the best option based on your health history and goals.",
      },
      {
        question: "Can I switch from Ozempic to compounded semaglutide?",
        answer: "Yes, absolutely. Many patients have switched from brand-name Ozempic or Wegovy to compounded semaglutide to save money — the active ingredient is identical, so the transition is seamless. We simply match your current dose and continue your treatment without interruption. Your results and side effect profile should remain the same, but you'll save significantly on cost.",
      },
      {
        question: "What if I've tried other weight loss medications and they didn't work?",
        answer: "GLP-1 medications like semaglutide and tirzepatide represent a breakthrough in obesity treatment. They work differently than older weight loss drugs (like phentermine or orlistat) by targeting the hormones that regulate appetite, blood sugar, and metabolism. Many patients who had minimal success with previous medications achieve significant weight loss with GLP-1 therapy. Clinical trial data shows 80–85% of patients lose ≥5% of their body weight on these medications.",
      },
      {
        question: "Can I use GLP-1 medications if I don't have diabetes?",
        answer: "Yes! Wegovy (semaglutide) and Zepbound (tirzepatide) are FDA-approved specifically for weight loss in people without diabetes. The criteria are: BMI ≥30, or BMI ≥27 with at least one weight-related condition (high blood pressure, high cholesterol, sleep apnea, etc.). Many patients use GLP-1 medications solely for weight management and metabolic health, not diabetes treatment.",
      },
      {
        question: "Do I still need to diet and exercise on semaglutide?",
        answer: "While semaglutide will help you lose weight even without major lifestyle changes (by reducing appetite and cravings), combining the medication with healthy eating and regular exercise significantly enhances results and long-term success. We recommend focusing on protein-rich meals (to preserve muscle mass), resistance training 2–3x per week, and daily movement.",
      },
      {
        question: "What happens when I stop taking semaglutide?",
        answer: "Many patients regain some weight after stopping semaglutide because appetite regulation returns to baseline. To maintain your weight loss, you'll need to continue healthy eating habits, regular exercise, and the metabolic awareness you developed during treatment. Many patients choose to stay on a maintenance dose of semaglutide indefinitely — the same way someone with high blood pressure stays on their medication long-term.",
      },
      {
        question: "How much protein should I eat while on semaglutide?",
        answer: "We recommend at least 0.8–1.0 grams of protein per pound of ideal body weight daily to preserve muscle mass during weight loss. For most patients, this means 80–120 grams of protein per day spread across meals. Since semaglutide reduces appetite, it's important to prioritize protein-rich foods first at each meal before filling up on carbohydrates or fats.",
      },
      {
        question: "Can I drink alcohol while on semaglutide?",
        answer: "Moderate alcohol consumption is generally safe on semaglutide, but many patients report reduced alcohol tolerance and less interest in drinking. Alcohol may increase nausea and gastrointestinal side effects, especially when you're first starting treatment. We recommend limiting alcohol to 1–2 drinks per week, staying well-hydrated, and avoiding drinking on an empty stomach.",
      },
    ],
  },
  {
    heading: "Cost & Insurance",
    items: [
      {
        question: "Why is compounded semaglutide so much cheaper than Wegovy?",
        answer: "Compounding pharmacies prepare custom formulations for individual patients using the same FDA-approved active ingredient (semaglutide). They don't carry the massive R&D, marketing, and patent costs of brand-name manufacturers, which allows them to offer the medication at $229/month instead of $1,000–1,500/month. The quality is excellent — compounding pharmacies are regulated by state boards of pharmacy and follow strict sterility and quality standards.",
      },
      {
        question: "Does insurance cover compounded semaglutide?",
        answer: "Most insurance plans do not cover compounded medications. However, at $229/month, compounded semaglutide is often cheaper than insurance copays for brand-name Wegovy. You can use HSA/FSA funds to pay for compounded semaglutide since it's a prescription medication for a diagnosed medical condition. Many patients find the self-pay compounded route more convenient and affordable than dealing with insurance prior authorization.",
      },
      {
        question: "How long does insurance prior authorization take?",
        answer: "At Body Good, we handle all prior authorization paperwork for you. Typical turnaround is 48–72 hours, though some plans take up to 5–7 business days. We submit all necessary documentation (BMI, weight-related conditions, medical necessity) to maximize approval chances. If your insurance denies coverage, you have two options: appeal the decision (which we can help with) or switch to our affordable self-pay compounded program at $229/month.",
      },
      {
        question: "What if I can't afford $229/month?",
        answer: "We understand that cost is a barrier for many patients. Here are some options: (1) Check if your insurance covers brand-name Wegovy/Zepbound — we'll handle prior authorization, (2) Use HSA/FSA funds if available, (3) Some patients start with every-other-week dosing to reduce costs (though this may slow results). At $229/month, compounded semaglutide is already one of the most affordable GLP-1 options available — compare that to $1,500/month for brand-name without insurance.",
      },
    ],
  },
  {
    heading: "Who Can Use It",
    items: [
      {
        question: "Is semaglutide safe for women with PCOS?",
        answer: "Yes! Semaglutide is often very beneficial for women with PCOS (polycystic ovary syndrome). Many patients see improvements in insulin resistance, menstrual regularity, testosterone levels, and fertility in addition to weight loss. However, if you're planning to conceive, you should stop semaglutide at least 2 months before trying to get pregnant, as there's insufficient data on pregnancy safety. Use reliable contraception while on treatment.",
      },
      {
        question: "Can men use semaglutide for weight loss?",
        answer: "Absolutely! Semaglutide is FDA-approved and highly effective for weight loss in both men and women. Clinical trials included both sexes, and men often achieve excellent results with GLP-1 therapy. Men may even lose weight slightly faster than women due to higher baseline metabolic rates and muscle mass. The dosing, side effects, and benefits are the same regardless of gender.",
      },
      {
        question: "What's the minimum age for semaglutide?",
        answer: "Semaglutide is FDA-approved for weight loss in adults (18+) and adolescents (12+) with obesity. For patients under 18, we require parental consent and often recommend a more conservative approach focusing on lifestyle modification first. For adults of any age, semaglutide is safe and effective — age alone is not a barrier to GLP-1 therapy.",
      },
      {
        question: "Can I use semaglutide if I have high blood pressure or diabetes?",
        answer: "Yes! In fact, semaglutide often helps improve both conditions. Many patients see reduced blood pressure and better blood sugar control with weight loss. We may need to adjust your blood pressure or diabetes medications as you lose weight to prevent hypoglycemia or low blood pressure. Regular monitoring is important, but these conditions don't disqualify you from GLP-1 therapy — they're often the very reasons we prescribe it.",
      },
    ],
  },
];

const sectionsEs = [
  {
    heading: "Seguridad y Eficacia",
    items: [
      {
        question: "¿Es la semaglutida compuesta igual de efectiva que Ozempic o Wegovy?",
        answer: "Sí, absolutamente. El ingrediente activo — semaglutida — es químicamente idéntico ya sea que lo prepare una farmacia de compuesto o lo fabrique Novo Nordisk (Ozempic/Wegovy). La diferencia está en el método de entrega y el proceso de fabricación, no en la eficacia del medicamento. En la práctica clínica de la Dra. Moleon, ella ha recetado semaglutida de marca y compuesta a cientos de pacientes, y los resultados de pérdida de peso son equivalentes. La semaglutida compuesta ofrece el mismo efecto terapéutico a una fracción del costo.",
      },
      {
        question: "¿Qué tan rápido veré resultados de pérdida de peso?",
        answer: "La mayoría de los pacientes notan una reducción del apetito dentro de las primeras 1–2 semanas y ven una pérdida inicial de peso (1–2 kg) durante el primer mes. Sin embargo, los medicamentos GLP-1 actúan gradualmente — comenzamos con una dosis baja y aumentamos lentamente para minimizar los efectos secundarios y optimizar los resultados. La pérdida máxima de peso ocurre típicamente alrededor de las 16–20 semanas al alcanzar las dosis terapéuticas. En promedio, los pacientes pierden 0.5–1 kg por semana, con una pérdida total del 15–20% de su peso corporal en 6–12 meses.",
      },
      {
        question: "¿Es segura la semaglutida para uso a largo plazo?",
        answer: "Sí. Los ensayos clínicos demuestran la seguridad de la semaglutida durante al menos 2 o más años de uso continuo, y muchos pacientes la han usado por más tiempo con excelente tolerancia. La obesidad es una condición crónica, al igual que la presión arterial alta o la diabetes, y los medicamentos a largo plazo frecuentemente son necesarios para resultados sostenidos. Monitoreamos a los pacientes regularmente con análisis de laboratorio y seguimientos para garantizar la seguridad continua.",
      },
      {
        question: "¿La semaglutida causa cáncer de tiroides en humanos?",
        answer: "No. Esta es una preocupación común porque la FDA requiere una advertencia de \"recuadro negro\" basada en estudios en animales que muestran tumores de tiroides en roedores a dosis extremadamente altas. Sin embargo, no hay evidencia de que la semaglutida cause cáncer de tiroides en humanos. Millones de personas han usado medicamentos GLP-1 desde 2017, y los ensayos clínicos en humanos no han mostrado mayor riesgo de cáncer de tiroides. Como precaución, no recetamos semaglutida a pacientes con historial personal o familiar de carcinoma medular de tiroides o síndrome MEN2.",
      },
      {
        question: "¿Cuáles son los efectos secundarios más comunes y cómo se manejan?",
        answer: "Los efectos secundarios más comunes son náuseas (20–30% de los pacientes), diarrea o estreñimiento (10–15%), fatiga y dolores de cabeza. Estos son típicamente leves y se resuelven dentro de 4–8 semanas a medida que su cuerpo se adapta al medicamento. Manejamos los efectos secundarios comenzando con una dosis baja y aumentando gradualmente (titulación lenta), recomendando comidas pequeñas ricas en proteínas, manteniéndose hidratado y evitando alimentos grasos o picantes. Si las náuseas persisten, podemos ralentizar los aumentos de dosis o recetar medicamentos antináuseas.",
      },
      {
        question: "¿Cuál es el esquema de dosificación típico para la semaglutida?",
        answer: "Comenzamos a los pacientes con 0.25 mg semanales durante las primeras 4 semanas para minimizar los efectos secundarios. Luego aumentamos a 0.5 mg por 4 semanas, luego 1.0 mg, 1.7 mg y finalmente 2.4 mg si es necesario para una pérdida de peso óptima. Esta titulación gradual permite que su cuerpo se adapte cómodamente. Algunos pacientes logran excelentes resultados con 1.0–1.7 mg y no necesitan la dosis máxima. La dosificación se personaliza según la respuesta individual, tolerancia y objetivos de pérdida de peso.",
      },
      {
        question: "¿Importa a qué hora del día me inyecto la semaglutida?",
        answer: "No, puede inyectarse semaglutida a cualquier hora del día, con o sin alimentos. El medicamento permanece activo en su sistema durante aproximadamente una semana, por lo que el horario específico no afecta significativamente la eficacia. Recomendamos elegir un día y hora consistentes cada semana (por ejemplo, el domingo por la mañana) para que se convierta en parte de su rutina.",
      },
      {
        question: "¿Qué sucede si me olvido una dosis?",
        answer: "Si se da cuenta de que olvidó su dosis dentro de los 5 días, tómela tan pronto como recuerde y reanude su programa semanal regular. Si han pasado más de 5 días, omita la dosis olvidada y tome su próxima dosis en su día regular. Nunca duplique las dosis para \"ponerse al día\". Olvidar una dosis no arruinará su progreso, pero trate de mantener la consistencia para mejores resultados.",
      },
      {
        question: "¿Puedo inyectarme semaglutida en cualquier parte del cuerpo?",
        answer: "La semaglutida se inyecta por vía subcutánea (debajo de la piel) en áreas con más tejido graso — principalmente el abdomen, los muslos o la parte superior de los brazos. El abdomen (alrededor del área del ombligo, evitando el radio de 5 cm directamente alrededor del ombligo) tiende a tener la absorción más consistente. Recomendamos rotar los sitios de inyección cada semana para prevenir irritación o bultos debajo de la piel. La inyección en sí es rápida y relativamente indolora con las agujas finas proporcionadas.",
      },
      {
        question: "¿Es la tirzepatida mejor que la semaglutida?",
        answer: "La tirzepatida (Mounjaro/Zepbound) es un agonista dual GIP/GLP-1, lo que significa que activa dos receptores hormonales en lugar de uno. Los ensayos clínicos muestran una pérdida de peso promedio ligeramente mayor con tirzepatida (20–25% del peso corporal) en comparación con semaglutida (15–20%). Sin embargo, la respuesta individual varía significativamente. Algunos pacientes responden mejor a la semaglutida, mientras que otros prefieren la tirzepatida. El costo también es un factor — la semaglutida compuesta frecuentemente es más accesible. Recomendaremos la mejor opción según su historial de salud y objetivos.",
      },
      {
        question: "¿Puedo cambiar de Ozempic a semaglutida compuesta?",
        answer: "Sí, absolutamente. Muchos pacientes han cambiado de Ozempic o Wegovy de marca a semaglutida compuesta para ahorrar dinero — el ingrediente activo es idéntico, por lo que la transición es sin problemas. Simplemente igualamos su dosis actual y continuamos su tratamiento sin interrupción. Sus resultados y perfil de efectos secundarios deben permanecer iguales, pero ahorrará significativamente en costos.",
      },
      {
        question: "¿Qué pasa si he probado otros medicamentos para bajar de peso y no funcionaron?",
        answer: "Los medicamentos GLP-1 como la semaglutida y la tirzepatida representan un avance en el tratamiento de la obesidad. Funcionan de manera diferente a los medicamentos más antiguos para bajar de peso (como la fentermina u orlistat) al dirigirse a las hormonas que regulan el apetito, el azúcar en sangre y el metabolismo. Muchos pacientes que tuvieron un éxito mínimo con medicamentos anteriores logran una pérdida de peso significativa con la terapia GLP-1. Los datos de ensayos clínicos muestran que el 80–85% de los pacientes pierden ≥5% de su peso corporal con estos medicamentos.",
      },
      {
        question: "¿Puedo usar medicamentos GLP-1 si no tengo diabetes?",
        answer: "¡Sí! Wegovy (semaglutida) y Zepbound (tirzepatida) están aprobados por la FDA específicamente para la pérdida de peso en personas sin diabetes. Los criterios son: IMC ≥30, o IMC ≥27 con al menos una condición relacionada con el peso (presión arterial alta, colesterol alto, apnea del sueño, etc.). Muchos pacientes usan medicamentos GLP-1 únicamente para el control de peso y la salud metabólica, no para el tratamiento de la diabetes.",
      },
      {
        question: "¿Todavía necesito hacer dieta y ejercicio tomando semaglutida?",
        answer: "Si bien la semaglutida le ayudará a perder peso incluso sin grandes cambios en el estilo de vida (reduciendo el apetito y los antojos), combinar el medicamento con una alimentación saludable y ejercicio regular mejora significativamente los resultados y el éxito a largo plazo. Recomendamos enfocarse en comidas ricas en proteínas (para preservar la masa muscular), entrenamiento de resistencia 2–3 veces por semana y movimiento diario.",
      },
      {
        question: "¿Qué sucede cuando dejo de tomar semaglutida?",
        answer: "Muchos pacientes recuperan algo de peso después de dejar la semaglutida porque la regulación del apetito vuelve a los niveles iniciales. Para mantener su pérdida de peso, deberá continuar con hábitos alimenticios saludables, ejercicio regular y la conciencia metabólica que desarrolló durante el tratamiento. Muchos pacientes optan por permanecer en una dosis de mantenimiento de semaglutida indefinidamente — de la misma manera que alguien con presión arterial alta toma su medicamento a largo plazo.",
      },
      {
        question: "¿Cuánta proteína debo comer mientras tomo semaglutida?",
        answer: "Recomendamos al menos 1.8–2.2 gramos de proteína por kilogramo de peso corporal ideal diariamente para preservar la masa muscular durante la pérdida de peso. Para la mayoría de los pacientes, esto significa 80–120 gramos de proteína al día distribuidos en las comidas. Como la semaglutida reduce el apetito, es importante priorizar los alimentos ricos en proteínas primero en cada comida antes de llenarse con carbohidratos o grasas.",
      },
      {
        question: "¿Puedo beber alcohol mientras tomo semaglutida?",
        answer: "El consumo moderado de alcohol es generalmente seguro con la semaglutida, pero muchos pacientes reportan menor tolerancia al alcohol y menos interés en beber. El alcohol puede aumentar las náuseas y los efectos secundarios gastrointestinales, especialmente cuando está comenzando el tratamiento. Recomendamos limitar el alcohol a 1–2 bebidas por semana, mantenerse bien hidratado y evitar beber con el estómago vacío.",
      },
    ],
  },
  {
    heading: "Costo y Seguro Médico",
    items: [
      {
        question: "¿Por qué la semaglutida compuesta es mucho más barata que Wegovy?",
        answer: "Las farmacias de compuesto preparan formulaciones personalizadas para pacientes individuales utilizando el mismo ingrediente activo aprobado por la FDA (semaglutida). No tienen los enormes costos de I+D, marketing y patentes de los fabricantes de medicamentos de marca, lo que les permite ofrecer el medicamento a $229/mes en lugar de $1,000–1,500/mes. La calidad es excelente — las farmacias de compuesto están reguladas por los consejos estatales de farmacia y siguen estrictos estándares de esterilidad y calidad.",
      },
      {
        question: "¿El seguro médico cubre la semaglutida compuesta?",
        answer: "La mayoría de los planes de seguro no cubren los medicamentos compuestos. Sin embargo, a $229/mes, la semaglutida compuesta frecuentemente es más barata que los copagos de seguro para Wegovy de marca. Puede usar fondos de HSA/FSA para pagar la semaglutida compuesta ya que es un medicamento con receta para una condición médica diagnosticada. Muchos pacientes encuentran que la ruta de pago directo con medicamento compuesto es más conveniente y accesible que lidiar con la autorización previa del seguro.",
      },
      {
        question: "¿Cuánto tiempo tarda la autorización previa del seguro?",
        answer: "En Body Good, nos encargamos de todo el papeleo de autorización previa por usted. El tiempo de respuesta típico es de 48–72 horas, aunque algunos planes tardan hasta 5–7 días hábiles. Presentamos toda la documentación necesaria (IMC, condiciones relacionadas con el peso, necesidad médica) para maximizar las posibilidades de aprobación. Si su seguro niega la cobertura, tiene dos opciones: apelar la decisión (con lo que podemos ayudarle) o cambiar a nuestro programa compuesto de pago directo a $229/mes.",
      },
      {
        question: "¿Qué pasa si no puedo pagar $229 al mes?",
        answer: "Entendemos que el costo es una barrera para muchos pacientes. Aquí hay algunas opciones: (1) Verifique si su seguro cubre Wegovy/Zepbound de marca — nosotros gestionamos la autorización previa, (2) Use fondos de HSA/FSA si están disponibles, (3) Algunos pacientes comienzan con dosificación cada dos semanas para reducir costos (aunque esto puede ralentizar los resultados). A $229/mes, la semaglutida compuesta ya es una de las opciones GLP-1 más accesibles disponibles — compárela con $1,500/mes para la marca sin seguro.",
      },
    ],
  },
  {
    heading: "¿Quién Puede Usarla?",
    items: [
      {
        question: "¿Es segura la semaglutida para mujeres con SOP?",
        answer: "¡Sí! La semaglutida frecuentemente es muy beneficiosa para mujeres con SOP (síndrome de ovario poliquístico). Muchas pacientes ven mejoras en la resistencia a la insulina, regularidad menstrual, niveles de testosterona y fertilidad, además de la pérdida de peso. Sin embargo, si está planeando concebir, debe dejar la semaglutida al menos 2 meses antes de intentar quedar embarazada, ya que no hay datos suficientes sobre la seguridad durante el embarazo. Use métodos anticonceptivos confiables durante el tratamiento.",
      },
      {
        question: "¿Pueden los hombres usar semaglutida para bajar de peso?",
        answer: "¡Por supuesto! La semaglutida está aprobada por la FDA y es muy efectiva para la pérdida de peso tanto en hombres como en mujeres. Los ensayos clínicos incluyeron ambos sexos, y los hombres frecuentemente logran excelentes resultados con la terapia GLP-1. Los hombres incluso pueden perder peso ligeramente más rápido que las mujeres debido a tasas metabólicas basales y masa muscular más altas. La dosificación, los efectos secundarios y los beneficios son los mismos independientemente del sexo.",
      },
      {
        question: "¿Cuál es la edad mínima para la semaglutida?",
        answer: "La semaglutida está aprobada por la FDA para la pérdida de peso en adultos (18+) y adolescentes (12+) con obesidad. Para pacientes menores de 18 años, requerimos el consentimiento de los padres y frecuentemente recomendamos un enfoque más conservador centrado primero en la modificación del estilo de vida. Para adultos de cualquier edad, la semaglutida es segura y efectiva — la edad por sí sola no es una barrera para la terapia GLP-1.",
      },
      {
        question: "¿Puedo usar semaglutida si tengo presión arterial alta o diabetes?",
        answer: "¡Sí! De hecho, la semaglutida frecuentemente ayuda a mejorar ambas condiciones. Muchos pacientes ven reducción de la presión arterial y mejor control del azúcar en sangre con la pérdida de peso. Es posible que necesitemos ajustar sus medicamentos para la presión arterial o la diabetes a medida que pierda peso para prevenir hipoglucemia o presión arterial baja. El monitoreo regular es importante, pero estas condiciones no lo descalifican de la terapia GLP-1 — a menudo son las mismas razones por las que la recetamos.",
      },
    ],
  },
];

function FaqContent({ locale }: { locale: string }) {
  const isEs = locale === "es";
  const activeSections = isEs ? sectionsEs : sections;
  const heading = isEs ? "Preguntas Frecuentes" : "Frequently Asked Questions";
  const subheading = isEs
    ? "Respuestas de la experta, Dra. Linda Moleon, MD — Especialista Certificada en Medicina de la Obesidad"
    : "Expert answers from Dr. Linda Moleon, MD — Board-Certified Obesity Medicine Specialist";

  return (
    <>
      <section className="py-20 bg-brand-pink-soft">
        <Container narrow>
          <h1 className="font-heading text-heading text-4xl font-bold text-center mb-4">{heading}</h1>
          <p className="text-body-muted text-lg text-center">{subheading}</p>
        </Container>
      </section>

      <section className="py-16">
        <Container narrow>
          <div className="space-y-14">
            {activeSections.map((section) => (
              <div key={section.heading}>
                <h2 className="font-heading text-heading text-2xl font-semibold mb-6 pb-3 border-b border-gray-200">
                  {section.heading}
                </h2>
                <Accordion items={section.items} />
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
