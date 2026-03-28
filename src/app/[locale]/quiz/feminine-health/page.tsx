import { setRequestLocale } from "next-intl/server";
import { FeminineHealthQuiz } from "@/components/quiz/FeminineHealthQuiz";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function FeminineHealthQuizPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FeminineHealthQuiz />;
}
