"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { OrderSummary, type SummaryCopy } from "@/features/cart";
import type { Locale } from "@/lib/i18n/locale";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";
import { DeliveryCard, type DeliveryCopy } from "./DeliveryCard";
import { PaymentCard, type PaymentCopy } from "./PaymentCard";
import { ScheduleCard, type ScheduleCopy } from "./ScheduleCard";
import { TipCard, type TipCopy } from "./TipCard";
// Types only, so they are erased and cost nothing — the components themselves
// still arrive through the `dynamic()` calls above. `Parameters<typeof X>` on
// a `dynamic()` result does not resolve: its type is a `ComponentType`, which
// is a union with a class and therefore not callable.
import type { ConfirmedCopy } from "./ConfirmedModal";
import type { LocationCopy } from "./LocationModal";
import type { ScheduleModalCopy } from "./ScheduleModal";
import type { VoucherCopy } from "./VoucherModal";
import { notWiredCheckout } from "./transport";
import type { PaymentMethodId } from "./paymentMethods";
import type {
  Checkout,
  DeliveryAddress,
  DeliveryDay,
  PlacedOrder,
  ScheduledDelivery,
  Voucher,
} from "./types";

/**
 * Four dialogs, none of them in the first paint.
 *
 * Between them they carry a Radix dialog, a map slot, a date grid and a
 * voucher list, and a customer who reaches checkout and pays with the method
 * already selected opens none of them. Same measurement that moved the mobile
 * drawer in Phase 5, the sign-in panel in Phase 6 and the dish modal in Phase
 * 8 — and this route has three more of them than any of those.
 */
const LocationModal = dynamic(
  () => import("./LocationModal").then((m) => m.LocationModal),
  { ssr: false },
);
const VoucherModal = dynamic(
  () => import("./VoucherModal").then((m) => m.VoucherModal),
  { ssr: false },
);
const ScheduleModal = dynamic(
  () => import("./ScheduleModal").then((m) => m.ScheduleModal),
  { ssr: false },
);
const ConfirmedModal = dynamic(
  () => import("./ConfirmedModal").then((m) => m.ConfirmedModal),
  { ssr: false },
);

export type CheckoutCopy = {
  title: string;
  schedule: ScheduleCopy;
  delivery: DeliveryCopy;
  payment: PaymentCopy;
  tip: TipCopy;
  summary: SummaryCopy;
  location: LocationCopy;
  voucher: VoucherCopy;
  scheduleModal: ScheduleModalCopy;
  confirmed: ConfirmedCopy;
  unavailableTitle: string;
  unavailableBody: string;
  notWired: string;
};

/**
 * `/checkout` — the last screen before money moves.
 *
 * Measured from the five `add pizza` frames (1440×1871 and ×1814 for Food,
 * the same two for Groceries, and ×2060 with a scheduled-delivery card on
 * top): a 1312 container, 865 and 415 side by side with 32 between them, and
 * the cards 32 apart down the left.
 *
 * ## The right-hand panel is the cart's, imported
 *
 * It is the same 415px component in the design and the same one in the code —
 * see the note on `features/cart`'s barrel. What changes is what `Place Order`
 * does: on `/cart` it is the entry to this screen, here it is the request.
 *
 * ## Nothing can be submitted, and the button says so rather than lying
 *
 * `notWiredCheckout.placeOrder` rejects. It is the one call in this project
 * that spends money, and a stub that resolved would put a confirmation
 * screen, a reference number and a total in front of a customer for an order
 * that never existed. The button is pressable — Phase 8 settled that a
 * disabled control cannot explain itself — it refuses, and the refusal is
 * announced.
 */
export function CheckoutView({
  checkout,
  vouchers,
  days,
  locale,
  copy,
  placed: placedOnArrival,
  unavailable = false,
  vouchersUnavailable = false,
  slotsUnavailable = false,
}: {
  checkout: Checkout | null;
  vouchers: readonly Voucher[];
  days: readonly DeliveryDay[];
  locale: Locale;
  copy: CheckoutCopy;
  /**
   * An order that was already placed when the page loaded.
   *
   * Not a test hook. A payment that leaves the site — MB WAY, PayPal, a 3-D
   * Secure step — comes back to a **return URL**, and what the customer must
   * see on arrival is the confirmation, not a checkout form they have already
   * paid for. The server resolves that order and hands it over; the same
   * screen then serves both paths.
   */
  placed?: PlacedOrder;
  unavailable?: boolean;
  vouchersUnavailable?: boolean;
  slotsUnavailable?: boolean;
}) {
  const [address, setAddress] = useState<DeliveryAddress | undefined>(
    checkout?.address,
  );
  const [schedule, setSchedule] = useState<ScheduledDelivery | undefined>(
    checkout?.schedule,
  );
  const [instruction, setInstruction] = useState("");
  const [method, setMethod] = useState<PaymentMethodId | null>(null);
  const [tip, setTip] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState<
    "location" | "voucher" | "schedule" | null
  >(null);
  const [placed, setPlaced] = useState<PlacedOrder | null>(placedOnArrival ?? null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function placeOrder() {
    if (!checkout) return;
    setBusy(true);
    setNotice(null);
    try {
      setPlaced(
        await notWiredCheckout.placeOrder({
          storeId: checkout.store.id,
          addressId: address?.id,
          instruction: instruction.trim() || undefined,
          paymentMethodId: method ?? "",
          tip: tip ?? undefined,
        }),
      );
    } catch {
      setNotice(copy.notWired);
    } finally {
      setBusy(false);
    }
  }

  if (unavailable || !checkout) {
    return (
      <div className="max-w-shell mx-auto w-full px-8 py-16">
        <EmptyState
          icon={<Icon name="card" className="size-8" />}
          title={copy.unavailableTitle}
          description={copy.unavailableBody}
        />
      </div>
    );
  }

  return (
    <div className="max-w-shell mx-auto flex w-full flex-col gap-8 px-8 py-8">
      <h1 className="text-32 text-ink font-semibold">{copy.title}</h1>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          <ScheduleCard
            schedule={schedule}
            copy={copy.schedule}
            onChange={() => setOpenModal("schedule")}
          />
          <DeliveryCard
            address={address}
            instruction={instruction}
            onInstructionChange={setInstruction}
            onEditAddress={() => setOpenModal("location")}
            copy={copy.delivery}
          />
          <PaymentCard value={method} onChange={setMethod} copy={copy.payment} />
          <TipCard value={tip} onChange={setTip} copy={copy.tip} />
        </div>

        <div className="lg:w-104 lg:shrink-0">
          <div className="sticky top-[8rem] flex flex-col gap-3">
            <OrderSummary
              store={checkout.store}
              copy={copy.summary}
              busy={busy}
              browseHref={withLocale(
                ROUTES.vendor.path.replace("[vendorId]", checkout.store.vendorId),
                locale,
              )}
              onApplyVoucher={() => setOpenModal("voucher")}
              onPlaceOrder={placeOrder}
            />
            <p role="status" className="text-14 text-ink-muted">
              {notice}
            </p>
          </div>
        </div>
      </div>

      {/* Mounted on first open and kept, so closing plays the exit transition
          rather than removing the dialog mid-animation. */}
      {openModal === "location" ? (
        <LocationModal
          open
          onOpenChange={(next) => !next && setOpenModal(null)}
          initial={address?.line}
          copy={copy.location}
          onConfirm={(line) => {
            setAddress({ id: address?.id ?? "chosen", line });
            setOpenModal(null);
          }}
        />
      ) : null}

      {openModal === "voucher" ? (
        <VoucherModal
          open
          onOpenChange={(next) => !next && setOpenModal(null)}
          vouchers={vouchers}
          unavailable={vouchersUnavailable}
          copy={copy.voucher}
          onApply={() => setNotice(copy.notWired)}
        />
      ) : null}

      {openModal === "schedule" ? (
        <ScheduleModal
          open
          onOpenChange={(next) => !next && setOpenModal(null)}
          days={days}
          unavailable={slotsUnavailable}
          copy={copy.scheduleModal}
          onSelect={(day, slot) => {
            setSchedule({ day: day.label, window: slot.window });
            setOpenModal(null);
          }}
        />
      ) : null}

      {placed ? (
        <ConfirmedModal
          open
          onOpenChange={(next) => !next && setPlaced(null)}
          order={placed}
          homeHref={withLocale(ROUTES.home.path, locale)}
          copy={copy.confirmed}
        />
      ) : null}
    </div>
  );
}
