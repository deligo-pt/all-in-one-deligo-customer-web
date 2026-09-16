/**
 * Changing where the customer is, from the browser (Phase 20b).
 *
 * Two different writes, because a guest and a signed-in customer keep their
 * location in two different places: a guest's is our own cookie, a customer's
 * is the **active** delivery address on their account — the one `/checkout`
 * binds to. The location card offers both, and neither is faked here: the
 * cookie is set by our route handler, the address by the API.
 */
const session = () => import("@/services/session/browser");

export type SavedLocation = {
  latitude: number;
  longitude: number;
  label: string;
};

/** The guest's chosen place, stored by `/api/location` for a year. */
export async function saveGuestLocation(location: SavedLocation): Promise<void> {
  const response = await fetch("/api/location", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(location),
  });
  if (!response.ok) throw new Error("location-not-saved");
}

/**
 * Makes one saved address the active one — account-wide, exactly as the
 * account screen's own "Make active" does. The listing then reads it through
 * `/profile` on the next render, so nothing here has to mirror it.
 */
export async function activateAddress(addressId: string): Promise<void> {
  const { browserApi } = await session();
  await browserApi().patch(
    `/customers/toggle-delivery-address-status/${encodeURIComponent(addressId)}`,
  );
}
