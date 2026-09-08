import { CatalogUnavailableError, type FoodCatalog } from "./types";

/**
 * The catalogue Track B ships with: nothing, honestly.
 *
 * Plan.md's rule for a screen whose data is not connected is that nothing is
 * invented — no placeholder restaurants, no sample menu, no price that came
 * from a designer rather than from the backend. That rule cost the previous
 * project real money once, and a plausible-looking fake catalogue is the worst
 * version of it: it survives review precisely *because* it looks right.
 *
 * So every method rejects, the pages render their unavailable state, and the
 * layout underneath is real — the same components, the same grid, the same
 * empty states a live catalogue will show when a filter matches nothing.
 *
 * The populated design is reviewable at `/food-states`, which is a development
 * page and prerenders as a 404. Phase 16 replaces this module's export with
 * the axios implementation and nothing above it changes.
 */
export const notWiredCatalog: FoodCatalog = {
  listVendors() {
    return Promise.reject(new CatalogUnavailableError());
  },
  listCuisines() {
    return Promise.reject(new CatalogUnavailableError());
  },
  getVendor() {
    return Promise.reject(new CatalogUnavailableError());
  },
  getProduct() {
    return Promise.reject(new CatalogUnavailableError());
  },
};
