import type { Metadata } from "next";
import { Poppins, Manrope } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

// Production canonical host. We hardcode this so that pages built or rendered
// on dev/preview hosts (Replit *.replit.app) never emit a non-production
// canonical/og:url. Dev/staging deploys won't be indexed regardless.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://joinbodygood.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Body Good Studio | Medical Weight Loss Programs",
  description:
    "Physician-led telehealth weight loss programs. GLP-1 medications starting at $139/mo. Bilingual care in English and Spanish.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: SITE_URL,
    siteName: "Body Good Studio",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={`${poppins.variable} ${manrope.variable}`}>
      <body className="bg-surface text-body font-body text-base leading-relaxed antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
