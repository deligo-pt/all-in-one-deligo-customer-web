import type {
  AccountAddress,
  Preference,
  Profile,
  SavedCard,
  SupportThread,
} from "@/features/account";

/**
 * The design's sample account, for the development states page.
 *
 * **Not data, never imported by a shipping page.** Names come from the
 * `Profile` frame and the 412px `change profile` / `Address` frames; the
 * shapes are the ones the live API was measured returning in Phase 20.
 */
export const PROFILE_FIXTURE: Profile = {
  accountId: "C-DG204589",
  firstName: "Jane",
  lastName: "Cooper",
  fullName: "Jane Cooper",
  phone: "+351 912 345 678",
  email: "jane.cooper@email.com",
  nif: "123456789",
  memberSince: "January 2025",
};

const base = {
  customType: "",
  detailedAddress: "",
  state: "",
  notes: "",
};

export const ADDRESS_FIXTURE: readonly AccountAddress[] = [
  {
    ...base,
    id: "home",
    label: "Home",
    line: "Rua de Santa Catarina 245, 4000-451 Porto, Portugal",
    active: true,
    type: "HOME",
    street: "Rua de Santa Catarina 245",
    city: "Porto",
    postalCode: "4000-451",
    country: "Portugal",
    latitude: 41.149,
    longitude: -8.606,
  },
  {
    ...base,
    id: "work",
    label: "Office",
    line: "Avenida da Liberdade 125, Lisboa, Portugal",
    active: false,
    type: "OFFICE",
    street: "Avenida da Liberdade 125",
    city: "Lisboa",
    postalCode: "",
    country: "Portugal",
    latitude: 38.72,
    longitude: -9.145,
  },
];

export const CARD_FIXTURE: readonly SavedCard[] = [
  { id: "c1", label: "Visa ending in 4242", expiry: "Expires 09/28", isDefault: true },
];

export const PREFERENCES_FIXTURE: readonly Preference[] = [
  { id: "language", label: "Language", value: "EN" },
  { id: "support", label: "Support", href: "#" },
  { id: "privacy", label: "Privacy", href: "#" },
];

export const SUPPORT_FIXTURE: SupportThread = {
  ticketId: "TIC-2609-00001",
  status: "In progress",
  unread: 0,
  messages: [
    {
      id: "m1",
      mine: true,
      text: "My order arrived cold.",
      time: "14:02",
      day: "Today",
      attachments: [],
    },
    {
      id: "m2",
      mine: false,
      text: "Sorry about that — let me check.",
      time: "14:05",
      day: "Today",
      attachments: [],
    },
  ],
};
