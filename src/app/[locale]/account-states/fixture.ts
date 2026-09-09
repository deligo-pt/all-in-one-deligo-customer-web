import type {
  Address,
  Preference,
  Profile,
  Referral,
  SavedCard,
} from "@/features/account";

/**
 * The design's sample account, for the development states page.
 *
 * **Not data, never imported by a shipping page.** Every value is from the
 * `Profile` frame and the 412px `change profile` / `Address` frames —
 * "Jane Cooper", "DG-20458931", "Rua de Santa Catarina 245".
 */
export const PROFILE_FIXTURE: Profile = {
  accountId: "DG-20458931",
  fullName: "Jane Cooper",
  phone: "+351 912 345 678",
  email: "jane.cooper@email.com",
  memberSince: "January 2025",
  emergencyContact: { name: "John Doe", phone: "+351 987 654 321" },
};

export const ADDRESS_FIXTURE: readonly Address[] = [
  {
    id: "home",
    label: "Home",
    line: "Rua de Santa Catarina 245, 4000-451 Porto, Portugal",
    isDefault: true,
  },
  { id: "work", label: "Work", line: "Avenida da Liberdade 125, Lisbon" },
];

export const CARD_FIXTURE: readonly SavedCard[] = [
  {
    id: "c1",
    method: "card",
    label: "Visa •••• 4242",
    expiry: "09/28",
    isDefault: true,
  },
  { id: "c2", method: "mbway", label: "MB WAY · +351 912 345 678" },
];

export const REFERRAL_FIXTURE: Referral = {
  code: "JANE20",
  earned: "15.00€",
};

export const PREFERENCES_FIXTURE: readonly Preference[] = [
  { id: "language", label: "Language", value: "English • Portugal" },
  { id: "support", label: "Support" },
  { id: "safety", label: "Safety" },
  { id: "referrals", label: "Refer & Earn" },
  { id: "privacy", label: "Privacy" },
  { id: "terms", label: "Terms" },
];
