import { setRequestLocale } from "next-intl/server";
import { QuizEngine } from "@/components/quiz/QuizEngine";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ reset?: string }>;
};

export default async function QuizPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { reset } = await searchParams;
  setRequestLocale(locale);

  return <QuizEngine forceReset={reset === "true"} />;
}
