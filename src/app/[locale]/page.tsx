import { setRequestLocale } from "next-intl/server";
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
