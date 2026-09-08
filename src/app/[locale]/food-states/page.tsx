import { notFound } from "next/navigation";
import { VendorListing, VendorMenu, type VendorDetail } from "@/features/food";
import { TranslationProvider } from "@/i18n/TranslationProvider";
import { getLocale } from "@/i18n/server";
import { loadNamespace } from "@/i18n/namespaces";
import { FOOD_FIXTURE } from "./fixture";
import { listingCopy, menuCopy } from "./copy";

/**
 * The food screens, populated.
 *
 * It exists because of an honest awkwardness in Track B: the catalogue is not
 * wired (Phase 16 does that), so `/food/restaurants` and `/vendors/[id]`
 * render their unavailable state and the design cannot be reviewed from the
 * product. A screen nobody can render is a screen nobody has looked at, and
 * "it will be fine once the API lands" is how a vertical arrives in Phase 16
 * with half its states unseen.
 *
 * So the components are rendered here against a fixture. **Development only,
 * and it 404s in production** — the same treatment as `/tokens`,
 * `/primitives`, `/formats` and `/auth-states`, and for the same reason. The
 * fixture is in its own file so that no import path from a shipping page can
 * reach it, and so `verify:food` can assert that none does.
 *
 * Every label on this page comes from the `food` dictionary, so it has no
 * prose of its own and needs no keys.
 */
export default async function FoodStatesPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const locale = await getLocale();
  const [food, common] = await Promise.all([
    loadNamespace(locale, "food"),
    loadNamespace(locale, "common"),
  ]);
  const t = (key: string) => (food[key] as string | undefined) ?? key;

  const vendor: VendorDetail = FOOD_FIXTURE.vendor;

  return (
    <TranslationProvider locale={locale} messages={{ common, food }}>
      <div className="flex flex-col gap-16 py-8">
        <VendorListing
          locale={locale}
          vendors={FOOD_FIXTURE.vendors}
          cuisines={FOOD_FIXTURE.cuisines}
          facets={FOOD_FIXTURE.facets}
          copy={listingCopy(t)}
          address={FOOD_FIXTURE.address}
          countLabel={FOOD_FIXTURE.countLabel}
        />
        {/* `loadProduct` is what Phase 16 supplies from `/products/:id`. Here
            it reads the fixture, so the dish modal — its required groups, its
            refusal, its stepper — can be opened and looked at. */}
        <VendorMenu
          vendor={vendor}
          copy={menuCopy(t)}
          loadProduct={(id) => FOOD_FIXTURE.products[id]}
        />
      </div>
    </TranslationProvider>
  );
}
