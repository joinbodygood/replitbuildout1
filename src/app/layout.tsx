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

export const metadata: Metadata = {
  // [SEO-AB-CANDIDATE] Option B (specificity-led) to A/B test against the current Option A:
  //   title: "GLP-1 Weight Loss Programs from $139/mo — Body Good Studio"
  //   description: "Clinician-prescribed semaglutide and tirzepatide. Bilingual telehealth, insurance check, transparent pricing. Start with a free 60-second quiz."
  title: "Medical Weight Loss with GLP-1 — Body Good Studio",
  description:
    "Physician-led GLP-1 weight loss programs. Bilingual care, transparent pricing, insurance-friendly. Take our 60-second eligibility quiz.",
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
