import { setRequestLocale } from "next-intl/server";
import { MentalWellnessQuiz } from "@/components/quiz/MentalWellnessQuiz";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function MentalWellnessQuizPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <MentalWellnessQuiz />;
}
