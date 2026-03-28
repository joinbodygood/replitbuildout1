import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/Hero";
import { TrustMarquee } from "@/components/sections/TrustMarquee";
import { ThreePaths } from "@/components/sections/ThreePaths";
import { PainPoints } from "@/components/sections/PainPoints";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Testimonials } from "@/components/sections/Testimonials";
import { Providers } from "@/components/sections/Providers";
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
      <ThreePaths />
      <PainPoints />
      <HowItWorks />
      <Testimonials />
      <Providers />
      <BottomCTA />
    </>
  );
}
