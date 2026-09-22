import Link from "next/link";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { getLocale, getTranslations } from "@/i18n/server";
import { formatCurrency } from "@/lib/i18n/format";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";
import type { MessageKey } from "@/i18n/namespaces";

/**
 * Two plans: FREE and PLUS at €4.99/month.
 *
 * The prices are numbers here and are formatted by `formatCurrency` from the
 * active locale — so a Portuguese reader sees `4,99 €` and an English one sees
 * `€4.99`, which is what each expects. The design writes `4.99€/month` as flat
 * text; copying that would have been right for one of the two.
 *
 * There is **no subscription endpoint**. These amounts come from the design and
 * from Plan.md §2.1, not from the API, and they are the one place in this page
 * where a number that looks like product data is written by hand. When the
 * endpoint exists this component takes the plans as props and the constant
 * below is deleted; nothing else changes.
 */
const PRICES = { free: 0, plus: 4.99, freeDeliveryThreshold: 10 };

const FREE_FEATURES = [
  "plusFreeAllServices",
  "plusFreeStandardDelivery",
  "plusFreeEmailSupport",
  "plusFreeBasicTracking",
] as const satisfies ReadonlyArray<MessageKey<"home">>;

const PAID_FEATURES = [
  "plusPaidPriority",
  "plusPaidSupport",
  "plusPaidTracking",
  "plusPaidDiscounts",
  "plusPaidEarlyAccess",
] as const satisfies ReadonlyArray<MessageKey<"home">>;

export async function PlusPlans() {
  const [t, locale] = await Promise.all([getTranslations("home"), getLocale()]);

  const price = (amount: number) =>
    t("plusPerMonth", { price: formatCurrency(amount, locale) });

  return (
    <section className="max-w-narrow mx-auto w-full px-4 sm:px-8 py-12 sm:py-20">
      <SectionHeading
        eyebrow={t("plusEyebrow")}
        title={t("plusTitle")}
        body={t("plusBody")}
        align="center"
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <Card className="h-full min-w-0">
          <CardBody className="flex h-full flex-col gap-6 p-6 sm:p-8">
            <div className="flex flex-col gap-2">
              <p className="text-14 text-ink font-semibold">{t("plusFreeName")}</p>
              <p className="text-20 text-ink font-semibold">{price(PRICES.free)}</p>
            </div>
            <ul className="flex flex-col gap-3">
              {FREE_FEATURES.map((feature) => (
                <li
                  key={feature}
                  className="text-16 text-ink flex items-start gap-3 font-semibold"
                >
                  <Icon name="check-circle" className="text-brand mt-0.5 size-5" />
                  {t(feature)}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card className="border-brand h-full min-w-0 border-2">
          <CardBody className="flex h-full flex-col gap-6 p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-14 text-brand font-semibold">{t("plusPaidName")}</p>
                <p className="text-20 text-ink font-semibold">{price(PRICES.plus)}</p>
              </div>
              <Badge tone="solid">{t("plusMostPopular")}</Badge>
            </div>
            <ul className="flex flex-col gap-3">
              <li className="text-16 text-ink flex items-start gap-3 font-semibold">
                <Icon name="check-circle" className="text-brand mt-0.5 size-5" />
                {t("plusPaidFreeDelivery", {
                  threshold: formatCurrency(PRICES.freeDeliveryThreshold, locale),
                })}
              </li>
              {PAID_FEATURES.map((feature) => (
                <li
                  key={feature}
                  className="text-16 text-ink flex items-start gap-3 font-semibold"
                >
                  <Icon name="check-circle" className="text-brand mt-0.5 size-5" />
                  {t(feature)}
                </li>
              ))}
            </ul>
            <Button className="mt-auto" asChild>
              <Link href={withLocale(ROUTES.plus.path, locale)}>
                {t("plusEyebrow")}
              </Link>
            </Button>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}
