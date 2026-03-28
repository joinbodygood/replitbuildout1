import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/Hero";
import { HomeCTAs } from "@/components/sections/HomeCTAs";
import { StatsBar } from "@/components/sections/StatsBar";
import { TrustBar } from "@/components/sections/TrustBar";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <HomeCTAs />
      <StatsBar />
      <TrustBar />
    </>
  );
}
