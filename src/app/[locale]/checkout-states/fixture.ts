import type { CartStore } from "@/features/cart";
import type { Checkout, DeliveryDay, PlacedOrder, Voucher } from "@/features/checkout";

/**
 * The design's own sample checkout, for the development states page.
 *
 * **This is not data and must never be imported by a page that ships.** Every
 * value is transcribed from the five `add pizza` frames and their three
 * dialogs — "Avenida da Liberdade 125, Lisbon", "DELIGO20", "You save €8.00",
 * "10:00 – 12:00", "30.97€" — which makes it a picture of the design, not a
 * checkout. `verify:checkout` asserts that nothing but the states page beside
 * it imports this file.
 *
 * The money is the file's and every value is a string: nothing here is added
 * up, which is precisely the discipline the real screen has to keep when it is
 * the amount on a card statement.
 */
const STORE: CartStore = {
  id: "store-burger-lab",
  vendorId: "the-burger-lab",
  name: "The Burger Lab",
  vertical: "food",
  active: true,
  subtotal: "28.49€",
  deliveryEstimate: "25-35 min",
  orderRef: "#DG-8291",
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
      { kind: "subtotal", amount: "28.49€" },
      { kind: "delivery", amount: "2.99€" },
      { kind: "service", amount: "1.50€" },
      { kind: "tip", amount: "2.00€" },
      { kind: "discount", amount: "-6.50€", code: "DELIGO20" },
    ],
  },
};

export const CHECKOUT_FIXTURE: Checkout = {
  store: STORE,
  address: { id: "home", label: "Home", line: "Avenida da Liberdade 125, Lisbon" },
  schedule: { day: "Tomorrow · 26 Aug", window: "10:00 – 12:00" },
};

/** The same screen with nothing booked — the state a first-time customer sees,
 *  and the one the design never draws. */
export const UNSCHEDULED_FIXTURE: Checkout = { store: STORE };

export const VOUCHER_FIXTURE: readonly Voucher[] = [
  {
    code: "DELIGO20",
    description: "20% off your next order.",
    terms: "You save €8.00",
    state: "applied",
  },
  {
    code: "FREEDELIVERY",
    description: "Enjoy free delivery on selected restaurants in your area.",
    terms: "Min. order €20 · Use by Oct 5, 2026",
    state: "available",
  },
  {
    code: "WELCOME5",
    description: "Get €5 off your first DeliGo order.",
    terms: "Only valid for new customers",
    state: "unavailable",
  },
];

export const SLOT_FIXTURE: readonly DeliveryDay[] = [
  {
    id: "d-25",
    weekday: "TODAY",
    day: "25",
    label: "Today · 25 Aug",
    slots: [
      { id: "s-1", window: "12:00 – 14:00", availability: "6 slots available" },
      { id: "s-2", window: "14:00 – 16:00", availability: "3 slots left" },
    ],
  },
  {
    id: "d-26",
    weekday: "TMW",
    day: "26",
    label: "Tomorrow · 26 Aug",
    slots: [
      {
        id: "s-3",
        window: "10:00 – 12:00",
        availability: "Best availability · Lower delivery fee",
        recommended: true,
      },
      {
        id: "s-4",
        window: "08:00 – 10:00",
        availability: "Almost full · 2 left",
        tone: "urgent",
      },
      { id: "s-5", window: "12:00 – 14:00", availability: "6 slots available" },
      { id: "s-6", window: "14:00 – 16:00", availability: "3 slots left" },
      { id: "s-7", window: "16:00 – 18:00", availability: "4 slots available" },
      {
        id: "s-8",
        window: "18:00 – 20:00",
        availability: "Filling fast · 1 left",
        tone: "urgent",
      },
    ],
  },
  { id: "d-27", weekday: "THU", day: "27", label: "Thu · 27 Aug", slots: [] },
];

export const PLACED_FIXTURE: PlacedOrder = {
  reference: "DG-8291",
  when: "Tomorrow · 26 Aug · 10:00–12:00",
  addressLine: "Avenida da Liberdade 125, Lisbon",
  paymentLabel: "MB WAY",
  paymentState: "Paid",
  total: "30.97€",
};
