import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { WellnessInjectionResultPage } from "@/components/quiz/WellnessInjectionResultPage";

type Props = {
  params: Promise<{ locale: string; handle: string }>;
  searchParams: Promise<{ goal?: string; budget?: string; exp?: string }>;
};

const VALID_HANDLES = [
  "vitamin-b12",
  "lipo-c",
  "lipotropic-super-b",
  "l-carnitine",
  "glutathione",
  "nad-plus",
  "sermorelin",
];

export default async function WellnessInjectionResultRoute({ params, searchParams }: Props) {
  const { locale, handle } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  if (!VALID_HANDLES.includes(handle)) notFound();

  return (
    <WellnessInjectionResultPage
      handle={handle}
      locale={locale}
      goal={sp.goal}
      budget={sp.budget}
      experience={sp.exp}
    />
  );
}
