"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import type { Locale } from "@/lib/i18n/locale";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";
import { OrderSummary, type SummaryCopy } from "./OrderSummary";
import { StoreGroup, type StoreCopy } from "./StoreGroup";
import { VerticalTabs } from "./VerticalTabs";
import { cartApi } from "./api";
import type { CartTab, TabId } from "./summary";
import type { Cart } from "./types";

export type CartCopy = StoreCopy &
  SummaryCopy & {
    title: string;
    subtitle: string;
    filters: string;
    emptyTitle: string;
    emptyBody: string;
    browse: string;
    unavailableTitle: string;
    unavailableBody: string;
    /** Vouchers are Phase 18's. */
    notWired: string;
    actionFailed: string;
    selectToSeeTotal: string;
  };

/**
 * `/cart` — the multi-vendor, multi-vertical cart.
 *
 * Measured from the `cart` frame (1440×2604): a 1312 container; the title at
 * 32/600 over a `ink-warm` subtitle, with a `brand-tint` pill on the end
 * carrying the item count and the cart's value; the filter row; then 864 and
 * 415 side by side with 32 between them.
 *
 * ## Three states, and they are three different sentences
 *
 * *Not connected* is not *empty* and neither is *nothing in this vertical*.
 * The fixes are a deploy, a shopping trip and a click on `All`, and only the
 * last two belong to the customer. Phase 7 learned this on the listing; the
 * cart has one more of them.
 *
 * ## Which store the summary is about
 *
 * The first one, until the customer says otherwise, and never one the current
 * filter has hidden — a panel describing a store that is not on screen is a
 * `Place Order` aimed at something invisible. Derived at render rather than
 * synchronised in an effect, which is the `set-state-in-effect` mistake this
 * project has now made twice.
 *
 * ## The controls are wired to a transport that refuses
 *
 * `notWiredCart` rejects every call and the refusal is shown. Nothing is
 * mutated locally to paper over it: a cart that appears to accept a quantity
 * change it never sent is worse than one that admits it cannot.
 *
 * The success path is written even though nothing can reach it yet, and it is
 * a `router.refresh()` rather than a `setCart`. A quantity moves a subtotal, a
 * delivery fee and possibly a discount threshold, and it moves the counted
 * strings in the header — all of which are the server's to resolve. Keeping a
 * second copy of the cart here is how the panel and the pill come to disagree.
 * Phase 17 replaces `transport.ts` and this file does not change.
 */
export function CartView({
  cart,
  tabs,
  itemsLabels,
  headerLabel,
  copy,
  locale,
  unavailable = false,
  offlineNotice,
}: {
  cart: Cart;
  tabs: readonly CartTab[];
  /** Store id → "2 items", pluralised on the server. */
  itemsLabels: Readonly<Record<string, string>>;
  /** "7 items · 64.80€", composed on the server. */
  headerLabel: string;
  copy: CartCopy;
  locale: Locale;
  unavailable?: boolean;
  /** Development preview: every press shows this and writes nothing. */
  offlineNotice?: string;
}) {
  const router = useRouter();
  const [active, setActive] = useState<TabId>("all");
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const groupName = useId();

  const visible =
    active === "all"
      ? cart.stores
      : cart.stores.filter((store) => store.vertical === active);

  // The summary is the store the API has active — the one checkout will
  // order — and only while the current filter still shows it.
  const summaryStore = visible.find((store) => store.active) ?? null;

  // Every write re-reads the cart from the server afterwards, including the
  // ones that failed: the screen shows the API's cart, never a guess at it.
  async function run(call: () => Promise<void>) {
    if (offlineNotice) return setNotice(offlineNotice);
    setBusy(true);
    setNotice(null);
    try {
      await call();
    } catch (error) {
      setNotice(
        error instanceof Error && error.message ? error.message : copy.actionFailed,
      );
    } finally {
      router.refresh();
      setBusy(false);
    }
  }

  const lineById = (id: string) =>
    cart.stores.flatMap((store) => store.lines).find((line) => line.id === id);

  const body = unavailable ? (
    <EmptyState
      icon={<Icon name="cart" className="size-8" />}
      title={copy.unavailableTitle}
      description={copy.unavailableBody}
    />
  ) : cart.stores.length === 0 ? (
    <EmptyState
      icon={<Icon name="cart" className="size-8" />}
      title={copy.emptyTitle}
      description={copy.emptyBody}
      action={
        <Button asChild>
          <Link href={withLocale(ROUTES.food.path, locale)}>{copy.browse}</Link>
        </Button>
      }
    />
  ) : (
    <div className="flex flex-col gap-8 lg:flex-row">
      <div
        role="radiogroup"
        aria-label={copy.chooseStore}
        className="flex min-w-0 flex-1 flex-col gap-6"
      >
        {visible.map((store) => (
          <StoreGroup
            key={store.id}
            store={store}
            copy={copy}
            itemsLabel={itemsLabels[store.id] ?? ""}
            groupName={groupName}
            selected={store.active}
            onSelect={() => run(() => cartApi.select(store))}
            busy={busy}
            onQuantityChange={(lineId, quantity) => {
              const line = lineById(lineId);
              if (line) void run(() => cartApi.setQuantity(line, quantity));
            }}
            onAddonQuantityChange={(lineId, optionSku, quantity) => {
              const line = lineById(lineId);
              if (line) {
                void run(() => cartApi.setAddonQuantity(line, optionSku, quantity));
              }
            }}
            onRemove={(lineId) => {
              const line = lineById(lineId);
              if (line) void run(() => cartApi.remove([line]));
            }}
          />
        ))}
      </div>

      <div className="lg:w-104 lg:shrink-0">
        <div className="sticky top-[8rem] flex flex-col gap-3">
          {summaryStore ? (
            <OrderSummary
              store={summaryStore}
              copy={copy}
              busy={busy}
              browseHref={withLocale(
                ROUTES.vendor.path.replace("[vendorId]", summaryStore.vendorId),
                locale,
              )}
              onApplyVoucher={() => setNotice(copy.notWired)}
              onPlaceOrder={() => router.push(withLocale(ROUTES.checkout.path, locale))}
            />
          ) : (
            <p className="text-14 text-ink-muted">{copy.selectToSeeTotal}</p>
          )}
          <p role="status" className="text-14 text-ink-muted">
            {notice}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-shell mx-auto flex w-full flex-col gap-8 px-8 py-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-32 text-ink font-semibold">{copy.title}</h1>
          <p className="text-16 text-ink-warm">{copy.subtitle}</p>
        </div>
        {cart.stores.length > 0 ? (
          <p className="bg-brand-tint text-brand text-20 rounded-full px-6 py-3 font-semibold">
            {headerLabel}
          </p>
        ) : null}
      </header>

      {tabs.length > 1 ? (
        <VerticalTabs
          tabs={tabs}
          active={active}
          onSelect={setActive}
          label={copy.filters}
        />
      ) : null}

      {body}
    </div>
  );
}
