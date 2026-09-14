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
  },
  async remove(lines) {
    if (!lines.length) return;
    const { browserApi } = await session();
    await browserApi().delete("/carts/delete-item", { data: lines.map(target) });
  },
  async select(store: CartStore) {
    if (store.active) return;
    const { browserApi } = await session();
    await browserApi().patch("/carts/toggle-item-status", {
      toggleMode: "VENDOR_BULK",
      vendorId: store.vendorId,
    });
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
  },
};
