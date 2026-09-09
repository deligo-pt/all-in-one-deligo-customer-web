import type { PaymentMethodId, Voucher } from "@/features/checkout";

/**
 * What the account area needs from the backend.
 *
 * Phase 12 builds the screens; **Phase 20** connects them. Vouchers and
 * payment-method identities are imported from `features/checkout` rather than
 * restated — the customer's saved cards are the same list checkout offers, and
 * a voucher on `/account/vouchers` is the same object the checkout sheet
 * applies.
 */
export type { Voucher, PaymentMethodId };

export type EmergencyContact = { name: string; phone: string };

export type Profile = {
  /** "DG-20458931" — shown, never generated. */
  accountId: string;
  fullName: string;
  phone: string;
  email: string;
  /** "January 2025" — the sentence, already localised. */
  memberSince?: string;
  photo?: string;
  emergencyContact?: EmergencyContact;
};

export type Address = {
  id: string;
  /** "Home", "Work" — the customer's own name for it. */
  label: string;
  /** One line, formatted by whoever knows the country's conventions. */
  line: string;
  isDefault?: boolean;
};

/** A saved card, as the payment provider describes it. **Never a PAN.** The
 *  brand and the last four are all a customer needs to tell two cards apart,
 *  and all this application is entitled to hold (D-14). */
export type SavedCard = {
  id: string;
  method: PaymentMethodId;
  /** "Visa •••• 4242". */
  label: string;
  expiry?: string;
  isDefault?: boolean;
};

export type Referral = {
  /** "JANE20" — the customer's own code. */
  code: string;
  /** "You have invited 3 friends" — the sentence, not a number to format. */
  summary?: string;
  /** Verbatim: "15.00€". */
  earned?: string;
  shareUrl?: string;
};

/** One row in Settings & Preferences. `value` is what the row currently reads
 *  — "English • Portugal" — and the backend or the locale decides it. */
export type Preference = {
  id: string;
  label: string;
  value?: string;
  href?: string;
};

export type AccountTransport = {
  profile(): Promise<Profile>;
  updateProfile(input: Partial<Profile>): Promise<Profile>;
  addresses(): Promise<readonly Address[]>;
  removeAddress(addressId: string): Promise<void>;
  cards(): Promise<readonly SavedCard[]>;
  removeCard(cardId: string): Promise<void>;
  vouchers(): Promise<readonly Voucher[]>;
  referral(): Promise<Referral>;
  deleteAccount(): Promise<void>;
};

export class AccountUnavailableError extends Error {
  constructor() {
    super("account-not-wired");
    this.name = "AccountUnavailableError";
  }
}
