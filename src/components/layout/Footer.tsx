import Link from "next/link";
import { useLocale } from "next-intl";

export function Footer() {
  const locale = useLocale();
  const isEs = locale === "es";

  const columns = [
    {
      title: isEs ? "Compañía" : "Company",
      links: [
        { label: isEs ? "Sobre Nosotros" : "About Us",       href: `/${locale}/about` },
        { label: isEs ? "Cómo Funciona" : "How It Works",    href: `/${locale}/how-it-works` },
        { label: isEs ? "Precios" : "Pricing",               href: `/${locale}/pricing` },
      ],
    },
    {
      title: isEs ? "Soporte" : "Support",
      links: [
        { label: isEs ? "Contacto" : "Contact",              href: `/${locale}/contact` },
        { label: "FAQ",                                       href: `/${locale}/faq` },
      ],
    },
    {
      title: isEs ? "Legal" : "Legal",
      links: [
        { label: isEs ? "Política de Privacidad" : "Privacy Policy",     href: `/${locale}/privacy-policy` },
        { label: isEs ? "Términos de Servicio" : "Terms of Service",     href: `/${locale}/terms-of-service` },
        { label: isEs ? "Política de Reembolso" : "Refund Policy",       href: `/${locale}/refund-policy` },
        { label: isEs ? "Política de Envío" : "Shipping Policy",         href: `/${locale}/shipping-policy` },
        { label: "HIPAA Notice",                                          href: `/${locale}/hipaa-notice` },
      ],
    },
  ];

  return (
    <footer className="bg-surface-dim border-t border-border mt-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <p className="font-heading font-bold text-lg text-heading mb-2">
              Body Good<span className="text-brand-red">.</span>
            </p>
            <p className="text-sm text-body-muted leading-relaxed">
              {isEs
                ? "Pérdida de peso con liderazgo médico."
                : "Physician-led telehealth weight loss."}
            </p>
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
            &copy; {new Date().getFullYear()} Body Good Studio. {isEs ? "Todos los derechos reservados." : "All rights reserved."}
          </p>
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-body-muted border border-border px-3 py-1.5 rounded-full hover:border-brand-red hover:text-brand-red transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Staff Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
