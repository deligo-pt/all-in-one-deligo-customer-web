import type { Metadata } from "next";
import { ComingSoon } from "@/components/shared/ComingSoon";
import { getTranslations } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("groceries");
  return { title: t("parcelTitle"), description: t("parcelBody") };
}

/**
 * `/parcel` — a launch notice, the same page `/electronics` is. The home
 * picker lists Parcel (`comingSoon` in routes.ts) and its Explore lands here,
 * which is how a customer learns the service is not open yet. The image is
 * the design's own parcel picture from the services grid.
 */
export default async function ParcelPage() {
  const t = await getTranslations("groceries");
  return (
    <ComingSoon
      image="/images/service-5.webp"
      copy={{
        badge: t("parcelBadge"),
        title: t("parcelTitle"),
        body: t("parcelBody"),
        imageAlt: t("parcelImageAlt"),
      }}
    />
  );
}
