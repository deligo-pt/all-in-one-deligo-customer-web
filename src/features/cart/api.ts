import { CART_EVENT } from "@/lib/events";
import type { AddToCartInput, CartLine, CartStore, CartTransport } from "./types";

/**
 * The cart's writes, through the one API client (Phase 17). The session
 * module — and axios with it — loads on the first press, never with a page.
 *
 * Every body below was sent to the live API and its answer recorded: the
 * quantity is set, not added; zero is refused (removal is `delete-item`);
 * a product with sizes refuses a line without `variationSku`
 * (`VARIATION_REQUIRED`); omitted add-ons are kept on the line.
 */
const session = () => import("@/services/session/browser");

/**
 * "The cart changed" — what the header's badge listens for.
 *
 * The badge is a client component that reads the cart once and then only when
 * the path changes; adding a dish happens **on the same page**, so nothing
 * told it to look again and it stayed a step behind until a reload. Announcing
 * it here rather than at each call site means a new caller cannot forget: this
 * is the one module that writes the cart.
 *
 * `router.refresh()` is not enough on its own — it re-renders the server's
 * half of the page, and the badge's number lives in client state. Reading the
 * counts on the server instead would put two ~1s calls into every page render,
 * which is the cost this arrangement exists to avoid.
 */
const announce = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CART_EVENT));
  }
};

const target = (line: CartLine) =>
  line.variationSku
    ? { productId: line.productId, variationSku: line.variationSku }
    : { productId: line.productId };

export const cartApi: CartTransport = {
  async setQuantity(line, quantity) {
    const { browserApi } = await session();
    await browserApi().post("/carts/add-to-cart", {
      items: [{ ...target(line), quantity }],
    });
    announce();
  },
  async setAddonQuantity(line, optionSku, quantity) {
    const { browserApi } = await session();
    await browserApi().post("/carts/add-to-cart", {
      items: [
        {
          ...target(line),
          // Required, and it is a **set**: leaving it out resets the line to
          // one. The old app learned this the expensive way.
          quantity: line.quantity,
          // Merged by `optionSku`, so the add-ons not named here survive.
          // Zero removes this one.
          addons: [{ optionSku, quantity }],
        },
      ],
    });
    announce();
  },
  async remove(lines) {
    if (!lines.length) return;
    const { browserApi } = await session();
    await browserApi().delete("/carts/delete-item", { data: lines.map(target) });
    announce();
  },
  async select(store: CartStore) {
    if (store.active) return;
    const { browserApi } = await session();
    await browserApi().patch("/carts/toggle-item-status", {
      toggleMode: "VENDOR_BULK",
      vendorId: store.vendorId,
    });
    announce();
  },
  async add({ productId, quantity, variationSku, addons }: AddToCartInput) {
    const { browserApi } = await session();
    await browserApi().post("/carts/add-to-cart", {
      items: [
        {
          productId,
          quantity,
          ...(variationSku ? { variationSku } : {}),
          ...(addons?.length ? { addons } : {}),
        },
      ],
    });
    announce();
  },
};
