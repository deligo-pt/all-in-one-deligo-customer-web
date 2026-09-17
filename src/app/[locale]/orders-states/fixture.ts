import type { CartStore } from "@/features/cart";
import type { NotificationGroup, Order } from "@/features/orders";

/**
 * The design's sample orders, for the development states page.
 *
 * **Not data, and never imported by a page that ships.** Names and amounts are
 * from the order frames and the `Notification` page; the shape is the one the
 * live API was measured returning in Phase 19. `verify:orders` asserts that
 * nothing but the states page beside it imports this file.
 */
const STORE: CartStore = {
  id: "store-burger-forge",
  vendorId: "burger-forge-porto",
  name: "Burger Forge Porto",
  vertical: "food",
  active: true,
  deliveryEstimate: "12 min",
  lines: [
    {
      id: "l1",
      productId: "truffle-mushroom-burger",
      name: "Truffle Mushroom Burger",
      price: "11.60€",
      quantity: 1,
      addons: [],
    },
    {
      id: "l2",
      productId: "fries",
      name: "Fries",
      price: "4.00€",
      quantity: 1,
      addons: [],
    },
  ],
  totals: {
    total: "18.83€",
    charges: [
      { kind: "subtotal", amount: "15.60€", note: "incl. VAT 0.88€" },
      { kind: "delivery", amount: "3.04€", note: "incl. VAT 0.57€" },
      { kind: "service", amount: "0.15€", note: "+ VAT 0.04€" },
    ],
  },
};

const base = {
  vendorName: "Burger Forge Porto",
  itemsLabel: "1× Truffle Mushroom Burger, 1× Fries",
  searchText: "Burger Forge Porto Truffle Mushroom Burger Fries",
  placedOn: "28 Oct 2026",
  total: "18.83€",
  image: undefined,
  store: STORE,
  canCancel: false,
  canReorder: false,
  productsToRate: [],
  rateRider: false,
  invoiceReady: false,
} as const;

export const LIVE_ORDER: Order = {
  ...base,
  id: "ORD-DG20458",
  recordId: "fixture-1",
  reference: "#ORD-DG20458",
  bucket: "ongoing",
  statusLabel: "On the way",
  fulfilment: "delivery",
  // Lisbon: the restaurant, the door, and a rider between them — so the
  // states page can show the Phase 20f map with no session and no order.
  route: {
    store: { latitude: 38.7139, longitude: -9.1394, label: "Tasca do Bairro" },
    destination: { latitude: 38.7223, longitude: -9.1449, label: "Rua Augusta 145" },
    rider: { latitude: 38.7178, longitude: -9.1421 },
  },
  step: "on-way",
  eta: "ETA: 12 min",
  deliveryCode: "482193",
  rider: { name: "Tiago Santos" },
  canCancel: true,
};

export const PICKUP_ORDER: Order = {
  ...base,
  id: "ORD-DG20460",
  recordId: "fixture-2",
  reference: "#ORD-DG20460",
  bucket: "ongoing",
  statusLabel: "Ready for pickup",
  fulfilment: "pickup",
  step: "ready",
  pickupCode: "534971",
  canCancel: true,
};

export const FINISHED_ORDER: Order = {
  ...base,
  id: "ORD-DG20301",
  recordId: "fixture-3",
  reference: "#ORD-DG20301",
  vendorName: "Pasta Paradiso",
  bucket: "complete",
  statusLabel: "Delivered",
  fulfilment: "delivery",
  step: "delivered",
  rider: { name: "João Silva" },
  canReorder: true,
  productsToRate: ["truffle-mushroom-burger", "fries"],
  rateRider: true,
};

export const CANCELLED_ORDER: Order = {
  ...base,
  id: "ORD-DG20112",
  recordId: "fixture-4",
  reference: "#ORD-DG20112",
  vendorName: "Sushi Nori",
  bucket: "cancelled",
  statusLabel: "Cancelled",
  fulfilment: "delivery",
  endedReason: "Ordered by mistake",
  refund: "pending",
  canReorder: true,
};

export const ORDERS_FIXTURE: readonly Order[] = [
  LIVE_ORDER,
  PICKUP_ORDER,
  FINISHED_ORDER,
  CANCELLED_ORDER,
];
export const ACTIVE_STORE = STORE;

export const NOTIFICATIONS_FIXTURE: readonly NotificationGroup[] = [
  {
    id: "today",
    label: "Today",
    notifications: [
      {
        id: "n1",
        title: "Order #ORD-DG20458 is on the way",
        body: "Tiago is heading to your location.",
        when: "14:30",
        unread: true,
        action: { label: "View order", href: "#" },
      },
    ],
  },
  {
    id: "yesterday",
    label: "Yesterday",
    notifications: [
      {
        id: "n2",
        title: "Order #ORD-DG20301 - Delivered",
        body: "Enjoy your meal from Pasta Paradiso.",
        when: "20:15",
        unread: false,
        action: { label: "View order", href: "#" },
      },
    ],
  },
];
