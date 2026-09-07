import type { Metadata } from "next";
import { getTranslations } from "@/i18n/server";
import { DownloadApp } from "./_sections/DownloadApp";
import { ExploreServices } from "./_sections/ExploreServices";
import { Faq } from "./_sections/Faq";
import { Hero } from "./_sections/Hero";
import { HowItWorks } from "./_sections/HowItWorks";
import { ModernLife } from "./_sections/ModernLife";
import { Partner } from "./_sections/Partner";
import { PlusPlans } from "./_sections/PlusPlans";
import { Testimonials } from "./_sections/Testimonials";

/**
 * The landing page: nine sections, 7,714px in the design.
 *
 * Every section is a Server Component, which is what §6's performance budget
 * actually needs from this page — and it is worth being clear about how that
 * differs from what §6 says. The plan asked for below-fold sections to "mount
 * on intersection". Doing that here would mean making them Client Components,
 * which is the opposite of cheap: their markup would move from HTML into
 * JavaScript, and the page a search engine reads in two languages (the entire
 * reason for D-2) would arrive empty.
 *
 * What is actually deferred is the only thing that costs anything — the
 * JavaScript for the three interactive leaves. The service picker is above the
 * fold and ships with the page; the testimonial carousel and the FAQ accordion
 * are below it and load as their own chunks. Images below the fold are lazy by
 * default in `next/image`; only the hero is `priority`.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home");
  return {
    title: t("heroTitle"),
    description: t("servicesBody"),
  };
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <ExploreServices />
      <ModernLife />
      <HowItWorks />
      <Partner />
      <PlusPlans />
      <Testimonials />
      <DownloadApp />
      <Faq />
    </>
  );
}
