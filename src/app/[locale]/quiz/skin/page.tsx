import { setRequestLocale } from "next-intl/server";
import { SkinQuiz } from "@/components/quiz/SkinQuiz";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function SkinQuizPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SkinQuiz />;
}
