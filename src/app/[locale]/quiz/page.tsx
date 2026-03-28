import { setRequestLocale } from "next-intl/server";
import { QuizEngine } from "@/components/quiz/QuizEngine";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function QuizPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <QuizEngine />;
}
