"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { PAYMENT_METHODS, type PaymentMethodId } from "./paymentMethods";
import type { SavedCard } from "./types";

export type PaymentCopy = {
  title: string;
  showAll: string;
  /** Keyed by id. A `Record`, not a function: this object crosses from the
   *  server to a client component. */
  methodName: Record<PaymentMethodId, string>;
  methodDescription: Record<PaymentMethodId, string>;
  savedCards: string;
  newCard: string;
  saveCard: string;
  saveCardBody: string;
  gatewayNotice: string;
  instantNotice: string;
};

/** A saved card's id, or `"new"` for the provider's page. */
export type CardChoice = string;
export const NEW_CARD: CardChoice = "new";

/** How many rows are visible below `lg` before `Show all`. The design draws two. */
const COLLAPSED = 2;

/**
 * How the order gets paid for.
 *
 * Measured: the card at 24px radius over a `line` border; the heading at
 * 20/600; each option a 72px row at 16px radius with a 40×40 `brand-tint` tile
 * at 8px radius, a radio on the end, and 16 between rows; `Show all` at 16/500
 * in brand. The method's name leads and its description follows (the file has
 * them the wrong way round on all six rows).
 *
 * ## No card form (D-14, answered)
 *
 * The design's four card inputs are gone. Every method is paid on REDUNIQ's
 * own page, so a card number never enters this site; what Card offers here is
 * what the API has — the customer's **saved cards** (`/payment-tokens`, a
 * brand and four digits) charged in one call, or the provider's page with an
 * optional "save this card".
 */
export function PaymentCard({
  value,
  onChange,
  cards,
  card,
  onCardChange,
  saveCard,
  onSaveCardChange,
  copy,
}: {
  value: PaymentMethodId | null;
  onChange: (next: PaymentMethodId) => void;
  cards: readonly SavedCard[];
  card: CardChoice;
  onCardChange: (next: CardChoice) => void;
  saveCard: boolean;
  onSaveCardChange: (next: boolean) => void;
  copy: PaymentCopy;
}) {
  const [expanded, setExpanded] = useState(false);
  const instant = value === "card" && card !== NEW_CARD;

  return (
    <section className="border-line rounded-24 bg-surface flex flex-col gap-6 border px-6 py-8">
      <h2 className="text-20 text-ink font-semibold">{copy.title}</h2>

      <div className="flex flex-col gap-4" role="radiogroup" aria-label={copy.title}>
        {PAYMENT_METHODS.map((method, index) => {
          const selected = value === method.id;
          return (
            <div key={method.id} className="flex flex-col gap-4">
              <label
                className={[
                  "rounded-16 flex cursor-pointer items-center gap-4 border p-4 transition-colors",
                  index >= COLLAPSED && !expanded && !selected ? "max-lg:hidden" : "",
                  selected
                    ? "border-brand bg-brand-tint"
                    : "border-line hover:bg-surface-muted",
                ].join(" ")}
              >
                <span
                  aria-hidden
                  className="bg-brand-tint text-brand rounded-8 flex size-10 shrink-0 items-center justify-center"
                >
                  <Icon name={method.icon} className="size-6" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-16 text-ink font-medium">
                    {copy.methodName[method.id]}
                  </span>
                  <span className="text-14 text-ink-muted">
                    {copy.methodDescription[method.id]}
                  </span>
                </span>
                <input
                  type="radio"
                  name="checkout-payment-method"
                  className="accent-brand size-5 shrink-0"
                  checked={selected}
                  onChange={() => onChange(method.id)}
                />
              </label>

              {method.id === "card" && selected ? (
                <CardOptions
                  cards={cards}
                  card={card}
                  onCardChange={onCardChange}
                  saveCard={saveCard}
                  onSaveCardChange={onSaveCardChange}
                  copy={copy}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      {value ? (
        <p className="text-14 text-ink-muted">
          {instant ? copy.instantNotice : copy.gatewayNotice}
        </p>
      ) : null}

      {!expanded ? (
        <Button
          variant="link"
          className="text-16 self-start font-medium lg:hidden"
          onClick={() => setExpanded(true)}
        >
          {copy.showAll}
        </Button>
      ) : null}
    </section>
  );
}

function CardOptions({
  cards,
  card,
  onCardChange,
  saveCard,
  onSaveCardChange,
  copy,
}: {
  cards: readonly SavedCard[];
  card: CardChoice;
  onCardChange: (next: CardChoice) => void;
  saveCard: boolean;
  onSaveCardChange: (next: boolean) => void;
  copy: PaymentCopy;
}) {
  const row =
    "rounded-16 flex cursor-pointer items-center gap-4 border p-4 transition-colors";

  return (
    <div className="border-line rounded-24 flex flex-col gap-3 border px-6 py-5">
      {cards.length > 0 ? (
        <div
          role="radiogroup"
          aria-label={copy.savedCards}
          className="flex flex-col gap-3"
        >
          <p className="text-14 text-ink-warm font-semibold">{copy.savedCards}</p>
          {cards.map((saved) => (
            <label
              key={saved.id}
              className={[row, card === saved.id ? "border-brand" : "border-line"].join(
                " ",
              )}
            >
              <Icon name="card" className="text-brand size-5 shrink-0" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-16 text-ink font-medium">{saved.label}</span>
                <span className="text-12 text-ink-muted">{saved.expiry}</span>
              </span>
              <input
                type="radio"
                name="checkout-saved-card"
                className="accent-brand size-5 shrink-0"
                checked={card === saved.id}
                onChange={() => onCardChange(saved.id)}
              />
            </label>
          ))}
          <label
            className={[row, card === NEW_CARD ? "border-brand" : "border-line"].join(
              " ",
            )}
          >
            <Icon name="plus" className="text-brand size-5 shrink-0" />
            <span className="text-16 text-ink flex-1 font-medium">{copy.newCard}</span>
            <input
              type="radio"
              name="checkout-saved-card"
              className="accent-brand size-5 shrink-0"
              checked={card === NEW_CARD}
              onChange={() => onCardChange(NEW_CARD)}
            />
          </label>
        </div>
      ) : null}

      {card === NEW_CARD ? (
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="accent-brand mt-1 size-4 shrink-0"
            checked={saveCard}
            onChange={(event) => onSaveCardChange(event.target.checked)}
          />
          <span className="flex flex-col gap-0.5">
            <span className="text-14 text-ink font-semibold">{copy.saveCard}</span>
            <span className="text-12 text-ink-muted">{copy.saveCardBody}</span>
          </span>
        </label>
      ) : null}
    </div>
  );
}
