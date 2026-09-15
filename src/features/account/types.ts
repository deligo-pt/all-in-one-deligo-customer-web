import type { SavedCard, Voucher } from "@/features/checkout";

/**
 * What the account area needs from the backend (Phase 20), read in
 * `services/account/server.ts` and measured on the owner's account.
 *
 * Saved cards and vouchers are the checkout's types: the same list checkout
 * offers, and the same offer object.
 */
export type { SavedCard, Voucher };

export type Profile = {
  /** "C-EP25QIN7" — the API's `userId`; also what `PATCH /customers/:id` takes. */
  accountId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  email: string;
  /** Portuguese tax number (NIF), when saved. */
  nif?: string;
  /** "July 2026", from `createdAt`. */
  memberSince?: string;
  photo?: string;
};

export type AddressType = "HOME" | "OFFICE" | "OTHER" | "CURRENT_LOCATION";

/** A saved delivery address, with every field the edit form needs. */
export type AccountAddress = {
  id: string;
  /** "Home", "Office", or the customer's own name for it. */
  label: string;
  line: string;
  active: boolean;
  type: AddressType;
  customType: string;
  street: string;
  detailedAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  notes: string;
  latitude: number;
  longitude: number;
};

/** What the address form sends; coordinates come from the geocoder. */
export type AddressInput = {
  type: AddressType;
  customType: string;
  street: string;
  detailedAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  notes: string;
  latitude: number;
  longitude: number;
};

export type Referral = {
  code: string;
  /** Resolved rows: "Invitations sent · 0", "Earned · 0,00 €". */
  stats: readonly { label: string; value: string }[];
  /** "478 points", when the points balance could be read. */
  points?: string;
};

export type SupportMessage = {
  id: string;
  mine: boolean;
  text: string;
  /** "14:30". */
  time: string;
  /** "Today", "15 September 2026" — the day group. */
  day: string;
  attachments: readonly string[];
};

export type SupportThread = {
  ticketId?: string;
  /** "In progress", resolved on the server. */
  status?: string;
  messages: readonly SupportMessage[];
  /** Messages the customer has not read. */
  unread: number;
};

/** The account's writes (Phase 20). Each resolves or throws `ApiError`. */
export type AccountTransport = {
  updateProfile(
    accountId: string,
    input: { firstName?: string; lastName?: string; nif?: string; photo?: string },
  ): Promise<void>;
  /** `POST /uploads` (field `files`) → the stored file's URL. */
  upload(file: File): Promise<string>;
  /** `PATCH /profile/send-otp` — a code to the new email or phone. */
  sendContactCode(input: { email: string } | { contactNumber: string }): Promise<void>;
  /** `PATCH /profile/update-email-or-contact-number`. */
  confirmContact(otp: string, type: "email" | "mobile"): Promise<void>;
  addAddress(input: AddressInput): Promise<void>;
  updateAddress(addressId: string, input: AddressInput): Promise<void>;
  removeAddress(addressId: string): Promise<void>;
  activateAddress(addressId: string): Promise<void>;
  removeCard(cardId: string): Promise<void>;
  /** `POST /support/send-message` — joins the open ticket, or opens one. With
   *  an order (its Mongo `_id`) it is filed as `ORDER_ISSUE` against it, as
   *  the old app's "Report an issue" did. */
  sendSupport(message: string, orderRecordId?: string): Promise<void>;
  markSupportRead(ticketId: string): Promise<void>;
};
