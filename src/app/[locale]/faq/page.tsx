import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Accordion } from "@/components/ui/Accordion";

type Props = { params: Promise<{ locale: string }> };

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FaqContent />;
}

function FaqContent() {
  const t = useTranslations("faq");

  const faqItems = [
    {
      question: "What are GLP-1 medications?",
      answer: "GLP-1 medications (like semaglutide and tirzepatide) are FDA-approved treatments that help regulate appetite and blood sugar. They work by mimicking a natural hormone that signals fullness to your brain, helping you eat less and lose weight effectively.",
    },
    {
      question: "How much weight can I expect to lose?",
      answer: "Clinical studies show patients lose 15-20% of their body weight on average with GLP-1 medications. Individual results vary based on medication type, dosage, diet, and activity level.",
    },
    {
      question: "Do you accept insurance?",
      answer: "Yes! We offer an Insurance Navigation Program that helps determine if your insurance covers GLP-1 medications. Start with our free insurance coverage probability check, or purchase a full eligibility verification for $25.",
    },
    {
      question: "What's the difference between compounded and branded medications?",
      answer: "Branded medications (Wegovy, Zepbound) are manufactured by pharmaceutical companies and are FDA-approved. Compounded medications contain the same active ingredients but are prepared by licensed compounding pharmacies at lower cost. Both are prescribed by our licensed providers.",
    },
    {
      question: "How does the $45 branded prescription work?",
      answer: "For $45, one of our board-certified providers writes you a prescription for Wegovy or Zepbound. You then fill the prescription at your pharmacy or through the manufacturer (NovoCare for Wegovy, LillyDirect for Zepbound) and pay them directly for the medication.",
    },
  ];

  return (
    <>
      <section className="py-20 bg-brand-pink-soft">
        <Container narrow>
          <h1 className="font-heading text-heading text-4xl font-bold text-center mb-4">
            {t("title")}
          </h1>
          <p className="text-body-muted text-lg text-center">{t("subtitle")}</p>
        </Container>
      </section>

      <section className="py-16">
        <Container narrow>
          <Accordion items={faqItems} />
        </Container>
      </section>
    </>
  );
}
