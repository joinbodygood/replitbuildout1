/**
 * Hreflang alternates helper.
 *
 * Google's reciprocal-hreflang rule requires that every page declaring an
 * alternate also be declared back from that alternate. The previous version
 * of this site emitted no hreflang at all, which produced ~10 /es pages
 * surfacing in Search Console as "alternate page with no return link".
 *
 * This helper centralizes the contract:
 *   - `alternates.canonical` is always the current page's full URL.
 *   - `alternates.languages.en` and `.es` are set ONLY when a translation
 *     for that locale actually exists. We never point hreflang at a page
 *     that would render an empty body or 404.
 *   - When `availableLocales` is omitted, callers are signalling "both
 *     translations exist by construction" (e.g. static pages like /faq).
 */

const BASE_URL = "https://joinbodygood.com";

export type SupportedLocale = "en" | "es";

type BuildAlternatesArgs = {
  /** Path beneath the locale segment, with a leading slash. e.g. "/products/x" */
  path: string;
  /** The locale of the page currently being rendered. */
  currentLocale: SupportedLocale;
  /**
   * Locales that have actual content for this path. If undefined we assume
   * both locales render the page (true for all static marketing pages).
   * If empty/missing for a translated resource (blog post, product),
   * only the current locale is emitted.
   */
  availableLocales?: ReadonlyArray<SupportedLocale>;
};

export function buildAlternates({
  path,
  currentLocale,
  availableLocales,
}: BuildAlternatesArgs): {
  canonical: string;
  languages: Partial<Record<SupportedLocale | "x-default", string>>;
} {
  // Normalize the path so callers can pass "/foo" or "foo".
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const trimmedPath = normalizedPath === "/" ? "" : normalizedPath;

  const allLocales: SupportedLocale[] = ["en", "es"];
  const resolved: SupportedLocale[] =
    availableLocales === undefined
      ? allLocales
      : allLocales.filter((l) => availableLocales.includes(l));

  // The canonical is always self — even when no alternate exists we still
  // want a self-referential canonical so Google has an unambiguous URL.
  const canonical = `${BASE_URL}/${currentLocale}${trimmedPath}`;

  const languages: Partial<Record<SupportedLocale | "x-default", string>> = {};
  for (const l of resolved) {
    languages[l] = `${BASE_URL}/${l}${trimmedPath}`;
  }
  // x-default → English when EN exists, otherwise the only available locale.
  if (resolved.length > 0) {
    languages["x-default"] = languages["en"] ?? languages[resolved[0]!]!;
  }

  return { canonical, languages };
}
