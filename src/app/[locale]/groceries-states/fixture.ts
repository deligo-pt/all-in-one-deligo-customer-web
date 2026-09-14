import type { CartStore } from "@/features/cart";
import type { Vendor } from "@/features/food";
import type { GroceryProduct, GroceryStore, StoreListing } from "@/features/groceries";

/**
 * The design's sample groceries, for the development states page.
 *
 * **Not data, and never imported by a page that ships.** Transcribed from
 * `Gro Home` (1561 and 2719) — "FreshMart", "1.99€", "1kg (approx. 6 units)".
 * `verify:groceries` asserts nothing but the page beside it imports this file.
 *
 * Two of the design's own mistakes are not copied: a pizzeria in the grocery
 * listing, and a burger photograph on the grocery cart line.
 */
const UNIT = "1kg (approx. 6 units)";

const product = (id: string, name: string, unit = UNIT): GroceryProduct => ({
  id,
  name,
  unit,
  price: "1.99€",
});

const store = (id: string, name: string, extra: Partial<Vendor> = {}): Vendor => ({
  id,
  name,
  cuisines: ["Groceries", "Fresh Produce"],
  rating: "4.8",
  distance: "1.2 mi",
  deliveryTime: "20–30 min",
  status: "closing-soon",
  statusDetail: "Closing soon • Closes in 35 min",
  ...extra,
});

const SHELF = [
  store("freshmart", "FreshMart", { discountLabel: "30% OFF" }),
  store("greenbasket", "GreenBasket"),
  store("urban-grocer", "Urban Grocer", {
    status: "open",
    statusDetail: "Open now · Closes at 11:30 PM",
  }),
];

export const LISTING_FIXTURE: StoreListing = {
  countLabel: "120+",
  promotion: {
    id: "stock-up",
    title: "Stock Up & Save\nup to 30% OFF",
    body: "Fresh groceries and everyday essentials from stores near you, delivered quickly and conveniently to your door.",
  },
  shelves: [
    { id: "fresh-produce", title: "Fresh Produce", stores: SHELF },
    { id: "essential-market", title: "Essential Market", stores: SHELF },
    { id: "quickbite-market", title: "QuickBite Market", stores: SHELF },
  ],
};

export const ADDRESS_FIXTURE = "Avenida da Liberdade, Lisbon";

export const STORE_FIXTURE: GroceryStore = {
  ...SHELF[0]!,
  status: "open",
  address: "Avenida da Liberdade, Lisbon",
  reviewsLabel: "(10k+ Reviews)",
  deals: [
    {
      id: "d1",
      badge: "Up to 30% OFF",
      title: "Up to 30% off selected items",
      description: "Get up to 30% off on selected menu items.",
      terms: "Automatically applied · Max discount 6€",
    },
    {
      id: "d2",
      badge: "30% OFF",
      title: "30% off selected items",
      description: "Get 30% off on selected menu items.",
      terms: "Automatically applied · Max discount 6€",
    },
  ],
  aisles: [
    {
      id: "recommended",
      name: "Recommended",
      products: [
        product("green-tea", "Green Tea pack"),
        product("whole-milk", "Fresh Whole Milk", "500 mL or 1L or 2L"),
        product("strawberries", "Strawberries"),
        product("vanilla-ice-cream", "Vanilla Ice Cream"),
      ],
    },
    {
      id: "fruits",
      name: "Fruits",
      products: [
        product("bananas", "Madeira Bananas"),
        product("apples", "Apples"),
        product("oranges", "Oranges"),
        product("strawberries-2", "Strawberries"),
        product("avocados", "Avocados"),
        product("blueberries", "Blueberries"),
      ],
    },
    {
      id: "vegetables",
      name: "Vegetables",
      products: [
        product("red-pepper", "Red Pepper"),
        product("broccoli", "Broccoli"),
        product("cucumber", "Cucumber"),
        product("baby-spinach", "Baby Spinach"),
        product("cauliflower", "Cauliflower"),
        product("leafy-spinach", "Leafy Spinach"),
      ],
    },
    {
      id: "meat",
      name: "Meat",
      products: [
        product("chicken", "Chicken"),
        product("meat", "Meat"),
        product("beef", "Beef"),
      ],
    },
    {
      id: "fish",
      name: "Fish",
      products: [
        product("salmon", "Atlantic Salmon"),
        product("tuna", "Tuna Fillets"),
        product("cod", "Cod Fillets"),
        product("sardines", "Sardines"),
      ],
    },
  ],
};

export const CART_FIXTURE: CartStore = {
  id: "store-freshmart",
  vendorId: "freshmart",
  name: "FreshMart",
  vertical: "groceries",
  active: true,
  subtotal: "28.49€",
  lines: [
    {
      id: "g1",
      productId: "green-tea",
      name: "Green Tea Pack",
      description: UNIT,
      price: "18.50€",
      quantity: 1,
    },
  ],
  totals: {
    total: "32.98€",
    charges: [
      { kind: "subtotal", amount: "28.49€" },
      { kind: "delivery", amount: "2.99€" },
      { kind: "service", amount: "1.50€" },
    ],
  },
};
