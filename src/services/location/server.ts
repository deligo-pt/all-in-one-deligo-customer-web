import { cookies } from "next/headers";
import { LOCATION_COOKIE, parseLocation, type DeliveryLocation } from "@/lib/location";
import { hasServerSession, serverApi } from "@/services/api/server";

type ProfileAddress = {
  _id?: string;
  isActive?: boolean;
  latitude?: number;
  longitude?: number;
  street?: string;
  city?: string;
  detailedAddress?: string;
  addressType?: string;
  customAddressType?: string;
};

/** One saved address, as the location card lists it (Phase 20b). */
export type LocationChoice = {
  id: string;
  /** "Home", "Office", or the customer's own name for it. */
  label: string;
  line: string;
  active: boolean;
};

/** Where the listing delivers, and what else the customer could pick. */
export type DeliveryContext = {
  location: DeliveryLocation | null;
  /** Empty for a guest — a guest has no saved addresses to switch between. */
  choices: readonly LocationChoice[];
};

const TYPE_LABEL: Record<string, string> = {
  HOME: "Home",
  OFFICE: "Office",
  CURRENT_LOCATION: "Current location",
};

const addressLine = (address: ProfileAddress) =>
  [address.street, address.detailedAddress, address.city].filter(Boolean).join(", ");

const addressLocation = (address: ProfileAddress) =>
  parseLocation({
    latitude: address.latitude,
    longitude: address.longitude,
    label: [address.street, address.city].filter(Boolean).join(", "),
  });

async function readProfileAddresses(): Promise<ProfileAddress[]> {
  const api = await serverApi();
  const { data } = await api.get("/profile");
  return (data?.data?.deliveryAddresses ?? []) as ProfileAddress[];
}

/**
 * The location a listing is for: the signed-in customer's **active** delivery
 * address — the one `/checkout` will also use — or the guest's cookie. `null`
 * means nobody has said, and the listing asks rather than guessing a city.
 */
export async function getDeliveryLocation(): Promise<DeliveryLocation | null> {
  return (await getDeliveryContext()).location;
}

/**
 * The delivery location **and** the addresses the customer could switch to, in
 * one read (Phase 20b).
 *
 * The listing's location card offers the switch, so it needs both; asking for
 * `/profile` twice on one render to answer two halves of the same question is
 * a second round trip for nothing. A guest gets their cookie and no choices.
 */
export async function getDeliveryContext(): Promise<DeliveryContext> {
  if (!(await hasServerSession())) {
    return {
      location: parseLocation((await cookies()).get(LOCATION_COOKIE)?.value),
      choices: [],
    };
  }

  let addresses: ProfileAddress[] = [];
  try {
    addresses = await readProfileAddresses();
  } catch {
    // A profile that cannot be read should not empty a listing the guest
    // cookie could still fill, and should not claim the account has no
    // addresses either.
    return {
      location: parseLocation((await cookies()).get(LOCATION_COOKIE)?.value),
      choices: [],
    };
  }

  const active = addresses.find((address) => address.isActive);
  return {
    location:
      (active ? addressLocation(active) : null) ??
      parseLocation((await cookies()).get(LOCATION_COOKIE)?.value),
    choices: addresses
      .filter((address) => typeof address._id === "string" && address._id.length > 0)
      .map((address) => ({
        id: address._id as string,
        label:
          address.customAddressType?.trim() ||
          TYPE_LABEL[address.addressType ?? ""] ||
          addressLine(address) ||
          "",
        line: addressLine(address),
        active: address.isActive === true,
      })),
  };
}
