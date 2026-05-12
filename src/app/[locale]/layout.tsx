import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/sections/AnnouncementBar";
import { Analytics } from "@/components/analytics/Analytics";
import { CartProvider } from "@/context/CartContext";
import { CartFlowToast } from "@/components/cart/CartFlowToast";
import { ChatwootWidget } from "@/components/ChatwootWidget";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Locale-aware default canonical. Pages may still override via their own
// generateMetadata(). Resolved against metadataBase set in the root layout
// (https://joinbodygood.com), so the emitted URL is always the production host
// regardless of the host the page is rendered on.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = `/${locale}`;
  return {
    alternates: {
      canonical: canonicalPath,
      languages: {
        en: "/en",
        es: "/es",
      },
    },
    openGraph: {
      url: canonicalPath,
      locale,
    },
  };
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
        <CartFlowToast />
        <Footer />
        <Analytics />
        <ChatwootWidget
          baseUrl={process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL!}
          token={process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN!}
        />
      </CartProvider>
    </NextIntlClientProvider>
  );
}
