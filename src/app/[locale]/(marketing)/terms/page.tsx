import type { Metadata } from "next";
import { ContentPage } from "@/components/shared/ContentPage";
import { getTranslations } from "@/i18n/server";
import { readContent } from "@/services/content/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account");
  return { title: t("termsTitle") };
}

/** A prose page with the owner's copy, carried over from the old app
 *  (Phase 20) — see `services/content/server.ts`. */
export default async function Page() {
  const [t, document] = await Promise.all([
    getTranslations("account"),
    readContent("terms"),
  ]);
  return (
    <ContentPage
      title={t("termsTitle")}
      document={document}
      pendingTitle={t("contentPendingTitle")}
      pendingBody={t("contentPendingBody")}
    />
  );
}
