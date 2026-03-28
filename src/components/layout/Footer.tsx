import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();

  const columns = [
    {
      title: t("company"),
      links: [
        { label: t("about"), href: `/${locale}/about` },
        { label: t("howItWorks"), href: `/${locale}/how-it-works` },
        { label: t("pricing"), href: `/${locale}/pricing` },
        { label: t("faq"), href: `/${locale}/faq` },
      ],
    },
    {
      title: t("support"),
      links: [
        { label: t("contact"), href: `/${locale}/contact` },
        { label: t("faq"), href: `/${locale}/faq` },
      ],
    },
    {
      title: t("legal"),
      links: [
        { label: t("privacy"), href: `/${locale}/privacy` },
        { label: t("terms"), href: `/${locale}/terms` },
        { label: t("hipaa"), href: `/${locale}/hipaa-notice` },
        { label: t("telehealth"), href: `/${locale}/telehealth-consent` },
        { label: t("refund"), href: `/${locale}/refund-policy` },
      ],
    },
  ];

  return (
    <footer className="bg-surface-dim border-t border-border mt-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <p className="font-heading font-bold text-lg text-heading mb-2">
              Body Good<span className="text-brand-red">.</span>
            </p>
            <p className="text-sm text-body-muted">{t("tagline")}</p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="font-heading font-semibold text-sm text-heading mb-3">
                {col.title}
              </p>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-body-muted hover:text-brand-red transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-sm text-body-muted">
            &copy; {new Date().getFullYear()} {t("copyright")}
          </p>
          <Link
            href="/admin/login"
            className="text-xs text-body-muted opacity-40 hover:opacity-70 transition-opacity"
          >
            Team Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
