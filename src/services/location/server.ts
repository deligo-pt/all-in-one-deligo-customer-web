import { cookies } from "next/headers";
import { LOCATION_COOKIE, parseLocation, type DeliveryLocation } from "@/lib/location";
import { hasServerSession, serverApi } from "@/services/api/server";

type ProfileAddress = {
  isActive?: boolean;
  latitude?: number;
  longitude?: number;
  street?: string;
  city?: string;
  detailedAddress?: string;
};

/**
 * The location a listing is for: the signed-in customer's **active** delivery
 * address — the one `/checkout` will also use — or the guest's cookie. `null`
 * means nobody has said, and the listing asks rather than guessing a city.
 */
export async function getDeliveryLocation(): Promise<DeliveryLocation | null> {
  if (await hasServerSession()) {
    try {
      const api = await serverApi();
      const { data } = await api.get("/profile");
      const addresses = (data?.data?.deliveryAddresses ?? []) as ProfileAddress[];
      const active = addresses.find((a) => a.isActive);
      const location = active
        ? parseLocation({
            latitude: active.latitude,
            longitude: active.longitude,
            label: [active.street, active.city].filter(Boolean).join(", "),
          })
        : null;
      if (location) return location;
    } catch {
      // Fall through to the cookie: a profile that cannot be read should not
      // empty a listing the guest path could still fill.
    }
  }
  return parseLocation((await cookies()).get(LOCATION_COOKIE)?.value);
}
