import { setRequestLocale } from "next-intl/server";
import { WellnessInjectionQuiz } from "@/components/quiz/WellnessInjectionQuiz";

type Props = { params: Promise<{ locale: string }> };

export default async function WellnessInjectionQuizPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <WellnessInjectionQuiz />;
}
