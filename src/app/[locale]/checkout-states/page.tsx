import { notFound } from "next/navigation";
import { CheckoutView } from "@/features/checkout";
import { TranslationProvider } from "@/i18n/TranslationProvider";
import { getLocale } from "@/i18n/server";
import { loadNamespace } from "@/i18n/namespaces";
import type { Messages } from "@/lib/i18n/translate";
import {
  CHECKOUT_FIXTURE,
  PLACED_FIXTURE,
  SLOT_FIXTURE,
  UNSCHEDULED_FIXTURE,
  VOUCHER_FIXTURE,
} from "./fixture";
import { checkoutCopy } from "./copy";

/**
 * Checkout, in each of its states.
 *
 * The same awkwardness every Track B phase has met: nothing is wired, so
 * `/checkout` renders its unavailable state and the design cannot be reviewed
 * from the product. A screen nobody can render is a screen nobody has looked
 * at.
 *
 * So the view is rendered here against a fixture. **Development only, and it
 * 404s in production** — the same treatment as `/tokens`, `/primitives`,
 * `/formats`, `/auth-states`, `/food-states` and `/cart-states`. The fixture
 * is in its own file so no import path from a shipping page can reach it, and
 * so `verify:checkout` can assert that none does.
 *
 * Four instances, because there are four things worth looking at: a scheduled
 * order, the same order with nothing booked yet, the confirmation the payment
 * **return URL** lands on, and the unavailable state the real route shows
 * today. The three dialogs open from the first two — `Edit`, `Apply a
 * voucher`, `Change`.
 *
 * Every label comes from the dictionaries, so this page has no prose of its
 * own and needs no keys.
 */
export default async function CheckoutStatesPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const locale = await getLocale();
  const [checkout, cart, food, common, nav] = await Promise.all([
    loadNamespace(locale, "checkout"),
    loadNamespace(locale, "cart"),
    loadNamespace(locale, "food"),
    loadNamespace(locale, "common"),
    loadNamespace(locale, "nav"),
  ]);

  const lookup = (messages: Messages) => (key: string) => messages[key] ?? key;
  const copy = checkoutCopy(lookup(checkout), lookup(cart), lookup(food));

  return (
    <TranslationProvider locale={locale} messages={{ common, checkout, cart, nav }}>
      <div className="flex flex-col gap-16 py-8">
        <CheckoutView
          checkout={CHECKOUT_FIXTURE}
          vouchers={VOUCHER_FIXTURE}
          days={SLOT_FIXTURE}
          locale={locale}
          copy={copy}
        />
        <CheckoutView
          checkout={UNSCHEDULED_FIXTURE}
          vouchers={VOUCHER_FIXTURE}
          days={SLOT_FIXTURE}
          locale={locale}
          copy={copy}
        />
        <CheckoutView
          checkout={CHECKOUT_FIXTURE}
          vouchers={VOUCHER_FIXTURE}
          days={SLOT_FIXTURE}
          locale={locale}
          copy={copy}
          placed={PLACED_FIXTURE}
        />
        <CheckoutView
          checkout={null}
          vouchers={[]}
          days={[]}
          locale={locale}
          copy={copy}
          unavailable
        />
      </div>
    </TranslationProvider>
  );
}
