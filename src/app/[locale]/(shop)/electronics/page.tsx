import type { Metadata } from "next";
import { ComingSoon } from "@/components/shared/ComingSoon";
import { getTranslations } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("groceries");
  return { title: t("electronicsTitle"), description: t("electronicsBody") };
}

/**
 * `/electronics` — the design's `electronics` frames (1440×940, 412×917) are a
 * launch notice and nothing else. No catalogue, no listing, no cart: building
 * any of them would be inventing a product the design has not.
 */
export default async function ElectronicsPage() {
  const t = await getTranslations("groceries");
  return (
    <ComingSoon
      image="/images/electronics.webp"
      copy={{
        badge: t("electronicsBadge"),
        title: t("electronicsTitle"),
        body: t("electronicsBody"),
        imageAlt: t("electronicsImageAlt"),
      }}
    />
  );
}
