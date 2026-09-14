/**
 * Where the customer is (Phase 16), as pure functions.
 *
 * A signed-in customer's location is their active delivery address from
 * `/profile`. A guest's is a cookie set by "Locate me" or the address field,
 * so the server can list what is near them before any script runs.
 */
export const LOCATION_COOKIE = "deligo-location";

export type DeliveryLocation = {
  latitude: number;
  longitude: number;
  /** "Avenida da Liberdade, Lisbon" — what the bar reads back. */
  label: string;
};

const isCoordinate = (value: unknown, limit: number): value is number =>
  typeof value === "number" && Number.isFinite(value) && Math.abs(value) <= limit;

export function parseLocation(raw: unknown): DeliveryLocation | null {
  let value = raw;
  if (typeof raw === "string") {
    try {
      value = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!value || typeof value !== "object") return null;
  const { latitude, longitude, label } = value as Record<string, unknown>;
  if (!isCoordinate(latitude, 90) || !isCoordinate(longitude, 180)) return null;
  return {
    latitude,
    longitude,
    label: typeof label === "string" ? label.slice(0, 200) : "",
  };
}

/**
 * Straight-line distance in kilometres. The API does not return a distance
 * for a listing, and the Maps key only works from a browser (see the old
 * app's audit), so this is the honest estimate: as the crow flies, labelled
 * as distance, never as a delivery time.
 */
export function distanceKm(
  a: DeliveryLocation,
  b: { latitude: number; longitude: number },
): number {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}
