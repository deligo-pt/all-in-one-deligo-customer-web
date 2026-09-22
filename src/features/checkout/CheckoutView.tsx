"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { OrderSummary, type SummaryCopy } from "@/features/cart";
import type { Locale } from "@/lib/i18n/locale";
import type { PickupHours } from "@/lib/pickup";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";
import { checkoutApi } from "./api";
import { DeliveryCard, type DeliveryCopy } from "./DeliveryCard";
import { FulfilmentCard, type FulfilmentCopy } from "./FulfilmentCard";
import {
  NEW_CARD,
  PaymentCard,
  type CardChoice,
  type PaymentCopy,
} from "./PaymentCard";
// Types only, so they are erased — the dialogs arrive through `dynamic()`.
import type { AddressCopy } from "./AddressModal";
import type { PickupCopy } from "./PickupModal";
import type { VoucherCopy } from "./VoucherModal";
import type { PaymentMethodId } from "./paymentMethods";
import type { Checkout, SavedAddress, SavedCard, Voucher } from "./types";

/** Two dialogs, neither in the first paint. */
const AddressModal = dynamic(
  () => import("./AddressModal").then((m) => m.AddressModal),
  { ssr: false },
);
const VoucherModal = dynamic(
  () => import("./VoucherModal").then((m) => m.VoucherModal),
  { ssr: false },
);
const PickupModal = dynamic(() => import("./PickupModal").then((m) => m.PickupModal), {
  ssr: false,
});

export type CheckoutCopy = {
  title: string;
  fulfilment: FulfilmentCopy;
  pickup: PickupCopy;
  delivery: DeliveryCopy;
  payment: PaymentCopy;
  summary: SummaryCopy;
  payNow: string;
  address: AddressCopy;
  voucher: VoucherCopy;
  chooseMethod: string;
  actionFailed: string;
};

/**
 * `/checkout?id=` — the last screen before money moves (Phase 18).
 *
 * Measured from the five `add pizza` frames: a 1312 container, 865 and 415 side
 * by side with 32 between them, and the cards 32 apart down the left. The
 * right-hand panel is the cart's `OrderSummary`, carrying the summary's
 * backend-priced rows.
 *
 * **What the design draws and the API cannot take is not here.** The
 * scheduled-delivery card, its Smart Delivery picker and the rider tip have no
 * field on `/checkout`, whose schema was measured to reject both; the card form
 * was replaced by the provider's page (D-14). See Plan.md, Phase 18.
 *
 * Every write re-reads from the server: a voucher changes this summary in
 * place (`router.refresh()`), while removing it or changing the address builds
 * a new summary and replaces the URL, so Back cannot restore the old one.
 */
export function CheckoutView({
  checkout,
  vouchers,
  vouchersUnavailable = false,
  cards,
  addresses,
  pickupHours,
  pickupAvailable = false,
  locale,
  copy,
  offlineNotice,
}: {
  checkout: Checkout;
  vouchers: readonly Voucher[];
  vouchersUnavailable?: boolean;
  cards: readonly SavedCard[];
  addresses: readonly SavedAddress[];
  /** The active store's hours, for self-pickup slots; absent when unknown. */
  pickupHours?: PickupHours;
  /** Whether the store has a pickup slot left, decided on the server. */
  pickupAvailable?: boolean;
  locale: Locale;
  copy: CheckoutCopy;
  /** Set on the states page: every write refuses with this sentence. */
  offlineNotice?: string;
}) {
  const router = useRouter();
  const [instruction, setInstruction] = useState("");
  const [method, setMethod] = useState<PaymentMethodId | null>(null);
  const [card, setCard] = useState<CardChoice>(NEW_CARD);
  const [saveCard, setSaveCard] = useState(false);
  const [openModal, setOpenModal] = useState<"address" | "voucher" | "pickup" | null>(
    null,
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const checkoutUrl = (id: string) =>
    `${withLocale(ROUTES.checkout.path, locale)}?id=${encodeURIComponent(id)}`;
  const instant = method === "card" && card !== NEW_CARD;

  /** Runs a write; a refusal shows the API's own sentence. `false` on failure. */
  async function run(call: () => Promise<void>): Promise<boolean> {
    if (offlineNotice) {
      setNotice(offlineNotice);
      return false;
    }
    setBusy(true);
    setNotice(null);
    try {
      await call();
      return true;
    } catch (error) {
      setNotice(
        error instanceof Error && error.message ? error.message : copy.actionFailed,
      );
      setBusy(false);
      return false;
    }
  }

  const applyVoucher = (identifier: string) =>
    run(async () => {
      await checkoutApi.applyVoucher(checkout.id, identifier);
      setOpenModal(null);
      setBusy(false);
      router.refresh();
    });

  // No endpoint removes an offer: a summary rebuilt from the cart has none.
  const removeVoucher = () =>
    run(async () => {
      router.replace(checkoutUrl(await checkoutApi.start(checkout.pickupTime)));
    });

  // Pickup and delivery are different summaries (a pickup has no delivery fee),
  // so each choice builds one and replaces the URL.
  const choosePickup = (pickupTime: string) =>
    run(async () => {
      router.replace(checkoutUrl(await checkoutApi.start(pickupTime)));
    });

  const chooseDelivery = () =>
    checkout.fulfilment === "delivery"
      ? undefined
      : run(async () => {
          router.replace(checkoutUrl(await checkoutApi.start()));
        });

  const chooseAddress = (address: SavedAddress) =>
    address.active
      ? setOpenModal(null)
      : run(async () => {
          router.replace(checkoutUrl(await checkoutApi.chooseAddress(address.id)));
        });

  async function placeOrder() {
    if (!method) return setNotice(copy.chooseMethod);
    await run(async () => {
      const result = await checkoutApi.pay(
        checkout.id,
        instant
          ? { kind: "saved-card", cardId: card }
          : { kind: "gateway", method, saveCard: method === "card" && saveCard },
        instruction.trim(),
      );
      if ("redirectUrl" in result) {
        window.location.assign(result.redirectUrl);
        return;
      }
      router.replace(
        result.orderId
          ? `${withLocale(ROUTES.paymentSuccess.path, locale)}?order=${encodeURIComponent(result.orderId)}`
          : withLocale(ROUTES.orders.path, locale),
      );
    });
  }

  return (
    <div className="max-w-shell mx-auto flex w-full flex-col gap-8 px-4 sm:px-8 py-8">
      <h1 className="text-32 text-ink font-semibold">{copy.title}</h1>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          <FulfilmentCard
            fulfilment={checkout.fulfilment}
            storeName={checkout.store.name}
            pickupLabel={checkout.pickupLabel}
            pickupAvailable={Boolean(pickupHours) && pickupAvailable}
            busy={busy}
            onDelivery={() => void chooseDelivery()}
            onPickup={() => {
              setNotice(null);
              setOpenModal("pickup");
            }}
            copy={copy.fulfilment}
          />
          {/* A collected order has no address, no courier and nothing to tell
              one — the old app hid the instruction on pickup too. */}
          {checkout.fulfilment === "delivery" ? (
            <DeliveryCard
              address={checkout.address}
              instruction={instruction}
              onInstructionChange={setInstruction}
              onEditAddress={() => {
                setNotice(null);
                setOpenModal("address");
              }}
              copy={copy.delivery}
            />
          ) : null}
          <PaymentCard
            value={method}
            onChange={(next) => {
              setMethod(next);
              setNotice(null);
            }}
            cards={cards}
            card={card}
            onCardChange={setCard}
            saveCard={saveCard}
            onSaveCardChange={setSaveCard}
            copy={copy.payment}
          />
        </div>

        <div className="lg:w-104 lg:shrink-0">
          <div className="sticky top-[8rem] flex flex-col gap-3">
            <OrderSummary
              store={checkout.store}
              copy={
                instant ? { ...copy.summary, placeOrder: copy.payNow } : copy.summary
              }
              busy={busy}
              browseHref={withLocale(
                ROUTES.vendor.path.replace("[vendorId]", checkout.store.vendorId),
                locale,
              )}
              onApplyVoucher={() => {
                setNotice(null);
                setOpenModal("voucher");
              }}
              onPlaceOrder={placeOrder}
            />
            <p role="status" className="text-14 text-danger">
              {openModal ? null : notice}
            </p>
          </div>
        </div>
      </div>

      {openModal === "address" ? (
        <AddressModal
          open
          onOpenChange={(next) => !next && !busy && setOpenModal(null)}
          addresses={addresses}
          busy={busy}
          notice={notice}
          onChoose={chooseAddress}
          copy={copy.address}
        />
      ) : null}

      {openModal === "pickup" && pickupHours ? (
        <PickupModal
          open
          onOpenChange={(next) => !next && !busy && setOpenModal(null)}
          hours={pickupHours}
          locale={locale}
          busy={busy}
          notice={notice}
          onConfirm={choosePickup}
          copy={copy.pickup}
        />
      ) : null}

      {openModal === "voucher" ? (
        <VoucherModal
          open
          onOpenChange={(next) => !next && !busy && setOpenModal(null)}
          vouchers={vouchers}
          appliedCode={checkout.voucherCode}
          unavailable={vouchersUnavailable}
          busy={busy}
          notice={notice}
          onApply={applyVoucher}
          onRemove={removeVoucher}
          copy={copy.voucher}
        />
      ) : null}
    </div>
  );
}
