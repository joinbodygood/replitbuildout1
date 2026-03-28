import { setRequestLocale } from "next-intl/server";
import { HairQuiz } from "@/components/quiz/HairQuiz";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HairQuizPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HairQuiz />;
}
