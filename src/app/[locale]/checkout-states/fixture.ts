import type { CartStore } from "@/features/cart";
import type {
  Checkout,
  PlacedOrder,
  SavedAddress,
  SavedCard,
  Voucher,
} from "@/features/checkout";

/**
 * The design's own sample checkout, for the development states page.
 *
 * **This is not data and must never be imported by a page that ships.** The
 * store, lines and totals are transcribed from the `add pizza` frames; the
 * VAT captions, the saved card and the voucher terms take the shape the live
 * API was measured sending in Phase 18. `verify:checkout` asserts that nothing
 * but the states page beside it imports this file. Every amount is a string,
 * and nothing here is added up.
 */
const STORE: CartStore = {
  id: "store-burger-lab",
  vendorId: "the-burger-lab",
  name: "The Burger Lab",
  vertical: "food",
  active: true,
  deliveryEstimate: "25 min",
  lines: [
    {
      id: "line-1",
      productId: "classic-smash-burger",
      name: "Classic Smash Burger",
      description: "Double beef patty, cheddar, house sauce.",
      price: "9.90€",
      quantity: 1,
    },
    {
      id: "line-2",
      productId: "classic-smash-burger-2",
      name: "Classic Smash Burger",
      description: "Double beef patty, cheddar, house sauce.",
      price: "9.90€",
      quantity: 1,
    },
  ],
  totals: {
    total: "30.97€",
    charges: [
      { kind: "subtotal", amount: "28.49€", note: "incl. VAT 1.61€" },
      { kind: "delivery", amount: "2.99€", note: "incl. VAT 0.56€" },
      { kind: "service", amount: "1.50€", note: "+ VAT 0.35€" },
      { kind: "discount", amount: "-6.50€", code: "DELIGO20" },
    ],
  },
};

export const CHECKOUT_FIXTURE: Checkout = {
  id: "fixture-checkout",
  store: STORE,
  fulfilment: "delivery",
  address: { line: "Avenida da Liberdade 125, Lisbon", detail: "2.88 km · 12 min" },
  voucherCode: "DELIGO20",
};

export const ADDRESS_FIXTURE: readonly SavedAddress[] = [
  {
    id: "home",
    label: "Home",
    line: "Avenida da Liberdade 125, Lisbon",
    active: true,
  },
  { id: "office", label: "Office", line: "Rua Augusta 50, Lisbon", active: false },
];

export const CARD_FIXTURE: readonly SavedCard[] = [
  {
    id: "card-1",
    label: "Mastercard ending in 4444",
    expiry: "Expires 12/34",
    isDefault: true,
  },
];

export const VOUCHER_FIXTURE: readonly Voucher[] = [
  {
    id: "v-1",
    identifier: "DELIGO20",
    code: "DELIGO20",
    title: "20% off",
    description: "20% off your next order.",
    terms: "20% off · up to 8.00€",
    state: "applied",
  },
  {
    id: "v-2",
    identifier: "FREEDELIVERY",
    code: "FREEDELIVERY",
    title: "Free delivery",
    description: "Enjoy free delivery on selected restaurants in your area.",
    terms: "min. order 20.00€ · until 05/10/2026",
    state: "available",
  },
  {
    id: "v-3",
    identifier: "WELCOME5",
    code: "WELCOME5",
    title: "5€ off",
    description: "Get 5€ off your first DeliGo order.",
    state: "unavailable",
    message: "Only valid for new customers",
  },
];

export const PLACED_FIXTURE: PlacedOrder = {
  reference: "DG-8291",
  addressLine: "Avenida da Liberdade 125, Lisbon",
  paymentLabel: "MB WAY",
  paymentState: "Paid",
  total: "30.97€",
};
