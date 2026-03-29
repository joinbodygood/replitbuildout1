import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/sections/AnnouncementBar";
import { Analytics } from "@/components/analytics/Analytics";
import { CartProvider } from "@/context/CartContext";
import { ChatwootWidget } from "@/components/ChatwootWidget";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "es")) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <CartProvider>
        <AnnouncementBar />
        <Header />
        <main>{children}</main>
        <Footer />
        <Analytics />
        {process.env.NEXT_PUBLIC_CHATWOOT_URL && process.env.NEXT_PUBLIC_CHATWOOT_TOKEN && (
          <ChatwootWidget
            baseUrl={process.env.NEXT_PUBLIC_CHATWOOT_URL}
            token={process.env.NEXT_PUBLIC_CHATWOOT_TOKEN}
          />
        )}
      </CartProvider>
    </NextIntlClientProvider>
  );
}
