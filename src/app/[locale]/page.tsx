import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/Hero";
import { TrustMarquee } from "@/components/sections/TrustMarquee";
import { WhatBringsYou } from "@/components/sections/WhatBringsYou";
import { PainPoints } from "@/components/sections/PainPoints";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Testimonials } from "@/components/sections/Testimonials";
import { Providers } from "@/components/sections/Providers";
import { FounderLetter } from "@/components/sections/FounderLetter";
import { ValueProps } from "@/components/sections/ValueProps";
import { InsuranceCTA } from "@/components/sections/InsuranceCTA";
import { FAQ } from "@/components/sections/FAQ";
import { BottomCTA } from "@/components/sections/BottomCTA";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  // [SEO-AB-CANDIDATE] Option B (specificity-led) lives in messages/en.json as a future swap:
  //   "GLP-1 Weight Loss Programs from $139/mo — Body Good Studio"
  //   "Clinician-prescribed semaglutide and tirzepatide. Bilingual telehealth, insurance check, transparent pricing. Start with a free 60-second quiz."
  const t = await getTranslations({ locale, namespace: "meta" });
  const title = t("title");
  const description = t("description");
  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <TrustMarquee />
      <WhatBringsYou />
      <PainPoints />
      <HowItWorks />
      <Testimonials />
      <Providers />
      <FounderLetter />
      <ValueProps />
      <InsuranceCTA />
      <FAQ />
      <BottomCTA />
    </>
  );
}
