import { notFound } from "next/navigation";
import { CartView, buildTabs, cartItemCount, storeItemCount } from "@/features/cart";
import { TranslationProvider } from "@/i18n/TranslationProvider";
import { getLocale } from "@/i18n/server";
import { loadNamespace } from "@/i18n/namespaces";
import { BCP47 } from "@/lib/i18n/locale";
import { translatePlural, type Messages } from "@/lib/i18n/translate";
import { CART_FIXTURE, EMPTY_CART_FIXTURE } from "./fixture";
import { cartCopy } from "./copy";

/**
 * The cart, in each of its three states.
 *
 * It exists because of the same awkwardness Phase 7 met: the transport is not
 * wired (Phase 17 does that), so `/cart` renders its unavailable state and the
 * design cannot be reviewed from the product. A screen nobody can render is a
 * screen nobody has looked at.
 *
 * So the view is rendered here against a fixture. **Development only, and it
 * 404s in production** — the same treatment as `/tokens`, `/primitives`,
 * `/formats`, `/auth-states` and `/food-states`. The fixture is in its own
 * file so no import path from a shipping page can reach it, and so
 * `verify:cart` can assert that none does.
 *
 * What is *not* reviewable here, deliberately: changing a quantity or removing
 * a line. Those go through the transport, the transport refuses, and the
 * refusal is one of the states worth looking at. Faking a local mutation would
 * make this page show behaviour the product does not have.
 *
 * Every label comes from the `cart` and `nav` dictionaries, so this page has no
 * prose of its own and needs no keys.
 */
export default async function CartStatesPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const locale = await getLocale();
  const [cart, nav, common] = await Promise.all([
    loadNamespace(locale, "cart"),
    loadNamespace(locale, "nav"),
    loadNamespace(locale, "common"),
  ]);

  const lookup = (messages: Messages) => (key: string) => messages[key] ?? key;
  const t = lookup(cart);
  const n = lookup(nav);
  const items = (count: number) => translatePlural(cart, "items", count, BCP47[locale]);

  const copy = cartCopy(t, n);
  const tabs = buildTabs(CART_FIXTURE, {
    all: t("filterAll"),
    food: n("food"),
    groceries: n("groceries"),
    electronics: n("electronics"),
  });
  const itemsLabels = Object.fromEntries(
    CART_FIXTURE.stores.map((store) => [store.id, items(storeItemCount(store))]),
  );
  // The pill counts and carries no money — the route does the same, and for
  // the same reason: the count is the cart's, the total is one store's.
  const headerLabel = items(cartItemCount(CART_FIXTURE));

  return (
    <TranslationProvider locale={locale} messages={{ common, cart, nav }}>
      <div className="flex flex-col gap-16 py-8">
        <CartView
          cart={CART_FIXTURE}
          tabs={tabs}
          itemsLabels={itemsLabels}
          headerLabel={headerLabel}
          copy={copy}
          locale={locale}
          offlineNotice={t("previewOnly")}
        />
        <CartView
          cart={EMPTY_CART_FIXTURE}
          tabs={[]}
          itemsLabels={{}}
          headerLabel={items(0)}
          copy={copy}
          locale={locale}
          offlineNotice={t("previewOnly")}
        />
        <CartView
          cart={EMPTY_CART_FIXTURE}
          tabs={[]}
          itemsLabels={{}}
          headerLabel={items(0)}
          copy={copy}
          locale={locale}
          unavailable
        />
      </div>
    </TranslationProvider>
  );
}
