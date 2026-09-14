import type { Cuisine, ProductDetail, Vendor, VendorDetail } from "@/features/food";

/**
 * The design's own sample content, for the development states page.
 *
 * **This is not data and must never be imported by a page that ships.** Every
 * value is transcribed from the Figma frames — "The Burger Lab", "4.8",
 * "9.90€", "20–30 min" — which makes it a picture of the design, not an
 * approximation of the catalogue. It exists so the components can be looked
 * at before Phase 16 connects the real one.
 *
 * It lives in its own file, beside the only page allowed to use it, precisely
 * so that "does anything else import this?" is a question with a mechanical
 * answer. `verify:food` asks it.
 *
 * The prices are the design's and are strings, for the same reason the type
 * makes them strings: nothing here should ever be arithmetic.
 */
const CUISINES: readonly Cuisine[] = [
  { id: "burgers", name: "Burgers" },
  { id: "pizza", name: "Pizza" },
  { id: "chicken", name: "Chicken" },
  { id: "fast-food", name: "Fast Food" },
  { id: "desserts", name: "Desserts" },
  { id: "breakfast", name: "Breakfast" },
];

const VENDORS: readonly Vendor[] = [
  {
    id: "the-burger-lab",
    name: "The Burger Lab",
    cuisines: ["Burgers", "Fast Food"],
    rating: "4.8",
    distance: "1.2 mi",
    deliveryTime: "20–30 min",
    status: "closing-soon",
    statusDetail: "Closing soon · Closes in 35 min",
    discountLabel: "30% OFF",
  },
  {
    id: "casa-da-pizza",
    name: "Casa da Pizza",
    cuisines: ["Pizza", "Italian"],
    rating: "4.8",
    distance: "1.2 mi",
    deliveryTime: "20–30 min",
    status: "open",
    statusDetail: "Open now · Closes at 11:30 PM",
  },
  {
    id: "lisbon-chicken-house",
    name: "Lisbon Chicken House",
    cuisines: ["Chicken", "Fast Food"],
    rating: "4.8",
    distance: "1.2 mi",
    deliveryTime: "20–30 min",
    status: "open",
    statusDetail: "Open now · Closes at 11:30 PM",
  },
];

const VENDOR: VendorDetail = {
  ...VENDORS[0]!,
  address: "Avenida da Liberdade, Lisbon",
  reviewsLabel: "(10k+ Reviews)",
  deals: [
    {
      id: "up-to-30",
      badge: "Up to 30% OFF",
      title: "Up to 30% off selected items",
      description: "Get up to 30% off on selected menu items.",
      terms: "Automatically applied · Max discount 6€",
    },
    {
      id: "flat-30",
      badge: "30% OFF",
      title: "30% off selected items",
      description: "Get 30% off on selected menu items.",
      terms: "Automatically applied · Max discount 6€",
    },
  ],
  menu: [
    {
      id: "popular",
      name: "Popular",
      items: [
        {
          id: "pepperoni-classic",
          name: "Pepperoni Classic",
          description: "Stone-baked pizza with pepperoni, mozzarella & Italian herbs.",
          price: "9.90€",
          badge: "BESTSELLER",
        },
        {
          id: "crispy-chicken-burger",
          name: "Crispy Chicken Burger",
          description: "Crispy chicken, lettuce, cheese & signature sauce.",
          price: "9.90€",
        },
        {
          id: "loaded-fries",
          name: "Loaded Fries",
          description: "Crispy fries, melted cheese & house sauce.",
          price: "9.90€",
          badge: "20% OFF",
        },
        {
          id: "chocolate-milkshake",
          name: "Chocolate Milkshake",
          description: "Creamy chocolate shake topped with whipped cream.",
          price: "9.90€",
        },
      ],
    },
    {
      id: "burger",
      name: "Burger",
      items: [
        {
          id: "classic-smash-burger",
          name: "Classic Smash Burger",
          description: "Double beef patty, cheddar, pickles & house sauce.",
          price: "9.90€",
          badge: "BESTSELLER",
        },
        {
          id: "double-cheese-burger",
          name: "Double Cheese Burger",
          description: "Two beef patties, cheddar, pickles & special sauce.",
          price: "9.90€",
        },
        {
          id: "spicy-chicken-burger",
          name: "Spicy Chicken Burger",
          description: "Crispy chicken with a spiced coating and house sauce.",
          price: "9.90€",
        },
      ],
    },
    {
      id: "drinks",
      name: "Drinks",
      items: [
        {
          id: "still-water",
          name: "Still Water",
          description: "500ml bottle.",
          price: "1.50€",
        },
      ],
    },
  ],
};

/**
 * The dish the modal opens on, transcribed from the app's `add ons` frame —
 * the same "Pepperoni Classic" at 16.90€, its two required groups and the
 * optional extras beneath them. Two of the three groups are `minSelectable: 1`
 * precisely so the modal's refusal can be seen without a backend.
 */
const PRODUCTS: Readonly<Record<string, ProductDetail>> = {
  "pepperoni-classic": {
    id: "pepperoni-classic",
    name: "Pepperoni Classic",
    description:
      "Stone-baked pizza topped with spicy pepperoni, rich tomato sauce, premium mozzarella, and finished with aromatic Italian herbs.",
    price: "16.90€",
    badge: "BESTSELLER",
    options: [
      {
        id: "size",
        name: "Choice of Size",
        minSelectable: 1,
        maxSelectable: 1,
        choices: [
          { id: "medium", name: 'Medium (10")', priceDelta: "Include" },
          { id: "large", name: 'Large (12")', priceDelta: "+4.50€" },
          { id: "family", name: 'Family (14")', priceDelta: "+7.50€" },
        ],
      },
      {
        id: "crust",
        name: "Choice of Crust",
        minSelectable: 1,
        maxSelectable: 1,
        choices: [
          { id: "classic", name: "Classic Crust", priceDelta: "Include" },
          { id: "thin", name: "Thin & Crispy", priceDelta: "+1.50€" },
        ],
      },
      {
        id: "extras",
        name: "Extra Toppings",
        minSelectable: 0,
        maxSelectable: 3,
        choices: [
          { id: "cheese", name: "Extra Cheese", priceDelta: "+1.50€" },
          { id: "mushrooms", name: "Mushrooms", priceDelta: "+1.00€" },
          { id: "olives", name: "Olives", priceDelta: "+1.00€" },
          { id: "jalapenos", name: "Jalapeños", priceDelta: "+1.00€", soldOut: true },
        ],
      },
    ],
  },
};

export const FOOD_FIXTURE = {
  products: PRODUCTS,
  address: "Avenida da Liberdade, Lisbon",
  countLabel: "120+",
  cuisines: CUISINES,
  vendors: VENDORS,
  vendor: VENDOR,
} as const;
