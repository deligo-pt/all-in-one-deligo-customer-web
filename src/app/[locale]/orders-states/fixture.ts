import type { CartStore } from "@/features/cart";
import type { NotificationGroup, Order } from "@/features/orders";

/**
 * The design's sample orders, for the development states page.
 *
 * **Not data, and never imported by a page that ships.** Every value is from
 * the mobile `order` frames, the `Notification` page and the `Review` modal —
 * "Burger Forge Porto", "15.60€", "ETA: 12 mins". `verify:orders` asserts that
 * nothing but the states page beside it imports this file.
 */
const STORE: CartStore = {
  id: "store-burger-forge",
  vendorId: "burger-forge-porto",
  name: "Burger Forge Porto",
  vertical: "food",
  subtotal: "15.60€",
  deliveryEstimate: "25-35 min",
  orderRef: "#DG-20458",
  lines: [
    {
      id: "l1",
      productId: "truffle-mushroom-burger",
      name: "Truffle Mushroom Burger",
      description: "Truffle aioli, Swiss, caramelised onion.",
      price: "11.60€",
      quantity: 1,
    },
    { id: "l2", productId: "fries", name: "Fries", price: "4.00€", quantity: 1 },
  ],
  totals: {
    total: "15.60€",
    charges: [
      { kind: "subtotal", amount: "15.60€" },
      { kind: "delivery", amount: "2.99€" },
    ],
  },
};

const LIST = [
  {
    id: "dg-20458",
    reference: "#DG-20458",
    vendorName: "Burger Forge Porto",
    itemsLabel: "1x Truffle Mushroom Burger, 1x Fries",
    placedOn: "28 Oct 2026",
    total: "15.60€",
    bucket: "ongoing",
    statusLabel: "Preparing",
    step: "kitchen",
    eta: "ETA: 12 mins",
    deliveryCode: "4821",
    canCancel: true,
    store: STORE,
    rider: {
      name: "Tiago Santos",
      stats: "4.9 • 2,134 Trips",
      vehicle: "TOYOTA COROLLA",
      plate: "AB-47-CD",
    },
  },
  {
    id: "dg-20301",
    reference: "#DG-20301",
    vendorName: "Pasta Paradiso",
    itemsLabel: "1x Lasagna Bolognese, 1x Garlic Bread",
    placedOn: "25 Oct 2026",
    total: "22.40€",
    bucket: "complete",
    statusLabel: "Delivered",
    canReorder: true,
    canReview: true,
    invoiceUrl: "#",
    store: STORE,
    rider: { name: "João Silva", stats: "4.8 • 980 Trips" },
  },
  {
    id: "dg-20112",
    reference: "#DG-20112",
    vendorName: "Sushi Nori",
    itemsLabel: "1x Salmon Set",
    placedOn: "19 Oct 2026",
    total: "18.00€",
    bucket: "cancelled",
    statusLabel: "Cancelled",
    canReorder: true,
  },
] as const satisfies readonly Order[];

/** Indexed rather than a bare array, so the states page names the order it is
 *  rendering instead of trusting `[0]` to stay put. */
export const ORDERS_FIXTURE: readonly Order[] = LIST;
export const LIVE_ORDER: Order = LIST[0];
export const FINISHED_ORDER: Order = LIST[1];

export const ACTIVE_STORE = STORE;

export const NOTIFICATIONS_FIXTURE: readonly NotificationGroup[] = [
  {
    id: "today",
    label: "Today",
    notifications: [
      {
        id: "n1",
        title: "Your Pizza Hut order is arriving soon!",
        body: "Driver Alex is 3 minutes away. Get ready to enjoy your hot Pepperoni Lover's Pizza.",
        when: "10 mins ago",
        unread: true,
        vertical: "food",
        action: { label: "Track Order", href: "#" },
      },
      {
        id: "n2",
        title: "Ride completed: Airport Transfer",
        body: "Your trip with Sarah has finished. How was your ride?",
        when: "2 hours ago",
        vertical: "ride",
        action: { label: "Rate Ride", href: "#" },
      },
    ],
  },
  {
    id: "yesterday",
    label: "Yesterday",
    notifications: [
      {
        id: "n3",
        title: "Parcel picked up successfully",
        body: "Your document package to Downtown Office has been collected by courier Mike.",
        when: "Yesterday, 14:30",
        vertical: "parcel",
        action: { label: "View Details", href: "#" },
      },
      {
        id: "n4",
        title: "Flash Sale: 20% off Smartwatches",
        body: "Upgrade your tech game. Premium smartwatches are now 20% off for the next 24 hours.",
        when: "Yesterday, 09:00",
        vertical: "electronics",
        action: { label: "Shop Now", href: "#" },
      },
    ],
  },
];
