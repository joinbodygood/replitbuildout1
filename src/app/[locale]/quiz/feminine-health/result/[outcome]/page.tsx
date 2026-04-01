import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { FeminineHealthResultPage } from "@/components/quiz/FeminineHealthResultPage";
import { InfectionPickerPage } from "@/components/quiz/InfectionPickerPage";

type Props = {
  params: Promise<{ locale: string; outcome: string }>;
  searchParams: Promise<{
    concern?: string;
    life_stage?: string;
    severity?: string;
    preference?: string;
    duration?: string;
  }>;
};

const VALID = [
  "acute-infection",
  "vaginal-dryness",
  "intimacy",
  "prevention",
  "acute-yeast",
  "acute-bv",
];

export default async function FeminineHealthResultRoute({ params, searchParams }: Props) {
  const { locale, outcome } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  if (!VALID.includes(outcome)) notFound();

  if (outcome === "acute-infection") {
    return <InfectionPickerPage locale={locale} />;
  }

  return (
    <FeminineHealthResultPage
      outcome={outcome}
      concern={sp.concern ?? ""}
      lifeStage={sp.life_stage ?? ""}
      severity={sp.severity ?? ""}
      preference={sp.preference ?? ""}
      duration={sp.duration ?? ""}
      locale={locale}
    />
  );
}
