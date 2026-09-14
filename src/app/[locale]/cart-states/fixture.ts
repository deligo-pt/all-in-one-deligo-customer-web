import type { Cart } from "@/features/cart";

/**
 * The design's own sample cart, for the development states page.
 *
 * **This is not data and must never be imported by a page that ships.** Every
 * value is transcribed from the `cart` frame — "Pizza Hut Lisbon", "12.50€",
 * "Delivery est: 25–35 min", "#DG-8291" — which makes it a picture of the
 * design, not an approximation of a cart. `verify:cart` asserts that nothing
 * but the states page beside it imports this file.
 *
 * Two things in the frame are transcribed as they are rather than corrected.
 * Its three store groups are all named "Pizza Hut Lisbon" and all carry the
 * same two lines, and its numbers do not reconcile — the header says
 * "7 Items · 64.80€", each group subtotals 18.40€, and the summary panel
 * totals 30.97€ for a different store entirely. That is design filler, and the
 * fixture keeps the shape while giving the three groups distinct names and
 * verticals, because the one thing the frame is genuinely showing is a cart
 * spanning three services. **No total here was computed** — each is a string
 * lifted from the file, which is exactly the discipline the real screen has to
 * keep.
 */
export const CART_FIXTURE: Cart = {
  total: "64.80€",
  stores: [
    {
      id: "store-pizza-hut",
      vendorId: "pizza-hut-lisbon",
      name: "Pizza Hut Lisbon",
      vertical: "food",
      active: true,
      subtotal: "18.40€",
      deliveryEstimate: "25–35 min",
      orderRef: "#DG-8291",
      lines: [
        {
          id: "line-1",
          productId: "pepperoni-lovers-medium",
          name: "Pepperoni Lovers Medium",
          description: "Double pepperoni, extra mozzarella, signature tomato sauce.",
          price: "12.50€",
          quantity: 1,
          optionsLabel: "Medium · Classic crust",
        },
        {
          id: "line-2",
          productId: "cheesy-garlic-bread",
          name: "Cheesy Garlic Bread",
          description: "Oven-baked bread topped with garlic butter and mozzarella.",
          price: "5.90€",
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
    },
    {
      id: "store-mercado",
      vendorId: "mercado-do-bairro",
      name: "Mercado do Bairro",
      vertical: "groceries",
      active: false,
      subtotal: "18.40€",
      deliveryEstimate: "25–35 min",
      orderRef: "#DG-8292",
      lines: [
        {
          id: "line-3",
          productId: "pepperoni-lovers-medium",
          name: "Pepperoni Lovers Medium",
          description: "Double pepperoni, extra mozzarella, signature tomato sauce.",
          price: "12.50€",
          quantity: 1,
        },
        {
          id: "line-4",
          productId: "cheesy-garlic-bread",
          name: "Cheesy Garlic Bread",
          description: "Oven-baked bread topped with garlic butter and mozzarella.",
          price: "5.90€",
          quantity: 1,
        },
      ],
      totals: {
        total: "30.97€",
        charges: [
          { kind: "subtotal", amount: "28.49€" },
          { kind: "delivery", amount: "2.99€" },
          { kind: "service", amount: "1.50€" },
        ],
      },
    },
    {
      id: "store-tech",
      vendorId: "lisboa-tech",
      name: "Lisboa Tech",
      vertical: "electronics",
      active: false,
      subtotal: "18.40€",
      deliveryEstimate: "25–35 min",
      lines: [
        {
          id: "line-5",
          productId: "cheesy-garlic-bread",
          name: "Cheesy Garlic Bread",
          description: "Oven-baked bread topped with garlic butter and mozzarella.",
          // Three, so the derived count reaches the frame's "7 Items". The
          // frame's own numbers do not reconcile — see above — and the header
          // pill counts while the money is verbatim, so a fixture that summed
          // to six would show a contradiction that reads as a bug.
          price: "5.90€",
          quantity: 3,
        },
      ],
      totals: {
        total: "30.97€",
        charges: [
          { kind: "subtotal", amount: "28.49€" },
          { kind: "delivery", amount: "2.99€" },
        ],
      },
    },
  ],
};

/** The same screen with nothing in it — the state a customer sees most often
 *  and the one the design never draws. */
export const EMPTY_CART_FIXTURE: Cart = { stores: [] };
