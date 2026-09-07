import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { BCP47, LOCALES, isLocale } from "@/lib/i18n/locale";
import { loadNamespace } from "@/i18n/namespaces";
import { TranslationProvider } from "@/i18n/TranslationProvider";

// Inter is the design's only typeface: 7,721 of the 7,733 text runs in the
// Figma page use it. `latin` alone covers both Portuguese and English —
// `latin-ext` would add ~40 KB of glyphs for characters neither language has.
// `display: swap` is the default and is what we want: text is readable in a
// fallback face while Inter loads, rather than invisible.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// This is the root layout. There is no `app/layout.tsx` above it: every route in
// the app lives under a locale, so the locale segment is the outermost thing
// there is and `<html>` belongs here, where the language is known. A root layout
// above this one could only render `<html lang="en">` and hope — which is
// exactly what the previous app did, for its whole life, on a Portuguese product.
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const common = await loadNamespace(locale, "common");

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: common.appName,
    description: common.tagline,
    // hreflang. The reason the locale is in the URL at all (D-2): a search
    // engine can only index a Portuguese page and an English page separately if
    // they are separate addresses.
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(LOCALES.map((l) => [BCP47[l], `/${l}`])),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  // `common` is sent to every client component in the app because it is, by
  // definition, the namespace that is not owned by a screen. `errors` joins it
  // for one reason: `error.tsx` is a Client Component by requirement, it can
  // render under any route, and it cannot mount a provider of its own — by the
  // time it renders, the tree that would have done so has thrown.
  //
  // Every other namespace is mounted by the layout or page that needs it, so a
  // route never serialises strings it never renders.
  const [common, errors] = await Promise.all([
    loadNamespace(locale, "common"),
    loadNamespace(locale, "errors"),
  ]);

  return (
    <html lang={BCP47[locale]} className={`${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <TranslationProvider locale={locale} messages={{ common, errors }}>
          {children}
        </TranslationProvider>
      </body>
    </html>
  );
}
