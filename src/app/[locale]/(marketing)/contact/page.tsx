import type { Metadata } from "next";
import { ContentPage } from "@/components/shared/ContentPage";
import { getTranslations } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account");
  return { title: t("contactTitle") };
}

/** One of the twelve prose pages the design does not draw and whose words are
 *  not ours to write — see `ContentPage` and D-16. */
export default async function ContactPage() {
  const t = await getTranslations("account");
  return (
    <ContentPage
      title={t("contactTitle")}
      pendingTitle={t("contentPendingTitle")}
      pendingBody={t("contentPendingBody")}
    />
  );
}
