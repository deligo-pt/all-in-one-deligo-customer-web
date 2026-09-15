"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cartApi } from "./api";
import { CartLineRow, type LineCopy } from "./CartLineRow";
import type { CartStore, ChargeKind } from "./types";

export type StoreCartCopy = {
  title: string;
  empty: string;
  line: LineCopy;
  charge: Record<ChargeKind, string>;
  grandTotal: string;
  checkout: string;
  selectForCheckout: string;
  actionFailed: string;
};

/**
 * The cart beside a store's menu or shelves (Phase 17) — this store's part of
 * the live cart.
 *
 * Measured from the food vendor page (416 wide, an empty state) and the
 * grocery `Frame 1606` (lines, charges, grand total, checkout). Totals are the
 * API's and exist only while the store is the active one; an inactive store
 * offers to become it, because the API orders one store at a time (D-4).
 *
 * Every press writes, then re-reads the page from the server — failed or not.
 *
 * The grocery frame's Instant/Schedule toggle is not drawn: it sent nothing,
 * and the API has no delivery scheduling. Delivery or self-pickup is chosen at
 * checkout, where the API takes it.
 */
export function StoreCartPanel({
  store,
  checkoutHref,
  copy,
  offlineNotice,
}: {
  store?: CartStore;
  checkoutHref: string;
  copy: StoreCartCopy;
  /** Development preview: every press shows this and writes nothing. */
  offlineNotice?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

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

  if (!store || store.lines.length === 0) {
    return (
      <section
        aria-label={copy.title}
        className="border-line rounded-16 bg-surface flex flex-col gap-8 border p-6"
      >
        <h2 className="text-20 text-ink font-semibold">{copy.title}</h2>
        <div className="flex flex-col items-center gap-8 py-8">
          <span
            aria-hidden
            className="bg-brand-tint text-brand flex size-32 items-center justify-center rounded-full"
          >
            <Icon name="cart" className="size-12" />
          </span>
          <p className="text-16 text-ink-muted font-medium">{copy.empty}</p>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label={copy.title}
      className="border-line rounded-16 bg-surface flex flex-col gap-6 border p-6"
    >
      <h2 className="text-20 text-ink-strong font-semibold">{copy.title}</h2>

      <ul className="flex flex-col gap-4">
        {store.lines.map((line) => (
          <li key={line.id} className="border-line rounded-24 border p-4">
            <CartLineRow
              line={line}
              copy={copy.line}
              busy={busy}
              onQuantityChange={(_, quantity) =>
                void run(() => cartApi.setQuantity(line, quantity))
              }
              onRemove={() => void run(() => cartApi.remove([line]))}
            />
          </li>
        ))}
      </ul>

      {notice ? (
        <p
          role="status"
          className="bg-surface-warm text-ink-warm text-14 rounded-12 p-4"
        >
          {notice}
        </p>
      ) : null}

      {store.totals ? (
        <>
          <dl className="flex flex-col gap-4">
            {store.totals.charges.map((charge) => (
              <div
                key={charge.kind}
                className="text-16 text-ink-muted flex justify-between gap-4"
              >
                <dt>
                  {copy.charge[charge.kind]}
                  {charge.code ? ` (${charge.code})` : ""}
                </dt>
                <dd>{charge.amount}</dd>
              </div>
            ))}
            <div className="border-line text-16 flex justify-between gap-4 border-t pt-4">
              <dt className="text-ink-strong">{copy.grandTotal}</dt>
              <dd className="text-20 text-brand font-semibold">{store.totals.total}</dd>
            </div>
          </dl>
          <Button block asChild>
            <Link href={checkoutHref}>{copy.checkout}</Link>
          </Button>
        </>
      ) : (
        <Button
          block
          variant="outline"
          loading={busy}
          onClick={() => void run(() => cartApi.select(store))}
        >
          {copy.selectForCheckout}
        </Button>
      )}
    </section>
  );
}
