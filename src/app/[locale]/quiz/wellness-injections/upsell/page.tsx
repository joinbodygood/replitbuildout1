import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { WellnessInjectionUpsell } from "@/components/quiz/WellnessInjectionUpsell";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    handle?: string;
    tier?: string;
    goal?: string;
    concern?: string;
  }>;
};

const VALID_HANDLES = [
  "vitamin-b12",
  "lipo-c",
  "lipotropic-super-b",
  "l-carnitine",
  "glutathione",
  "nad-plus",
  "sermorelin",
  "pentadeca-arginate",
  "ascorbic-acid",
];

export default async function WellnessInjectionUpsellPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const handle = sp.handle ?? "";
  const tierRaw = Number(sp.tier ?? "1");
  const tier = ([1, 3, 6].includes(tierRaw) ? tierRaw : 1) as 1 | 3 | 6;

  if (!VALID_HANDLES.includes(handle)) {
    redirect(`/${locale}/checkout`);
  }

  return (
    <WellnessInjectionUpsell
      handle={handle}
      tier={tier}
      locale={locale}
    />
  );
}
