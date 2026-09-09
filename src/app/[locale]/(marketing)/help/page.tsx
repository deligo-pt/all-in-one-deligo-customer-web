import type { Metadata } from "next";
import { ContentPage } from "@/components/shared/ContentPage";
import { getTranslations } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account");
  return { title: t("helpTitle") };
}

/** One of the twelve prose pages the design does not draw and whose words are
 *  not ours to write — see `ContentPage` and D-16. */
export default async function HelpPage() {
  const t = await getTranslations("account");
  return (
    <ContentPage
      title={t("helpTitle")}
      pendingTitle={t("contentPendingTitle")}
      pendingBody={t("contentPendingBody")}
    />
  );
}
