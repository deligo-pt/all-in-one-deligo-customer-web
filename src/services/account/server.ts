import type {
  AccountAddress,
  AddressType,
  Profile,
  Referral,
  SupportMessage,
  SupportThread,
  Voucher,
} from "@/features/account";
import { getLocale, getTranslations } from "@/i18n/server";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatTime,
} from "@/lib/i18n/format";
import { serverApi } from "@/services/api/server";
import { addressLine, toVoucher, type RawOffer } from "@/services/checkout/server";

/**
 * The account area, read on the server (Phase 20) — the only code that knows
 * these shapes, measured on the owner's account: `/profile`, `/offers`,
 * `/referrals/my-referrals`, `/points/my-points`, `/support/tickets` and
 * `/support/tickets/:ticketId/messages` (the `TIC-…` id; `ROOM_TIC-…` 404s).
 */

type RawProfile = {
  userId: string;
  name?: { firstName?: string; lastName?: string };
  email?: string;
  contactNumber?: string;
  profilePhoto?: string;
  NIF?: string;
  createdAt?: string;
  deliveryAddresses?: (Record<string, unknown> & { _id: string })[];
};

async function rawProfile(): Promise<RawProfile> {
  const api = await serverApi();
  const { data } = await api.get("/profile");
  return data?.data as RawProfile;
}

export async function readProfile(): Promise<Profile> {
  const [raw, locale] = await Promise.all([rawProfile(), getLocale()]);
  const firstName = raw.name?.firstName ?? "";
  const lastName = raw.name?.lastName ?? "";
  return {
    accountId: raw.userId,
    firstName,
    lastName,
    fullName: [firstName, lastName].filter(Boolean).join(" "),
    email: raw.email ?? "",
    phone: raw.contactNumber ?? "",
    nif: raw.NIF || undefined,
    memberSince: raw.createdAt
      ? formatDate(raw.createdAt, locale, { month: "long", year: "numeric" })
      : undefined,
    photo: raw.profilePhoto || undefined,
  };
}

const TYPES: readonly AddressType[] = ["HOME", "OFFICE", "OTHER", "CURRENT_LOCATION"];
const text = (value: unknown) => (typeof value === "string" ? value : "");

export async function readAccountAddresses(): Promise<AccountAddress[]> {
  const [raw, t] = await Promise.all([rawProfile(), getTranslations("account")]);
  const labels: Record<AddressType, string> = {
    HOME: t("addressHome"),
    OFFICE: t("addressOffice"),
    OTHER: t("addressOther"),
    CURRENT_LOCATION: t("addressCurrent"),
  };
  return (raw.deliveryAddresses ?? []).map((a) => {
    const type = TYPES.find((candidate) => candidate === a.addressType) ?? "OTHER";
    return {
      id: a._id,
      label: text(a.customAddressType).trim() || labels[type],
      line: addressLine(a as Parameters<typeof addressLine>[0]),
      active: a.isActive === true,
      type,
      customType: text(a.customAddressType),
      street: text(a.street),
      detailedAddress: text(a.detailedAddress),
      city: text(a.city),
      state: text(a.state),
      postalCode: text(a.postalCode),
      country: text(a.country),
      notes: text(a.notes),
      latitude: typeof a.latitude === "number" ? a.latitude : 0,
      longitude: typeof a.longitude === "number" ? a.longitude : 0,
    };
  });
}

/** The customer's offers (`GET /offers`), in the checkout sheet's shape. */
export async function readOffers(): Promise<Voucher[]> {
  const [api, locale, t] = await Promise.all([
    serverApi(),
    getLocale(),
    getTranslations("checkout"),
  ]);
  const { data } = await api.get("/offers", { params: { limit: 100 } });
  const offers: RawOffer[] = Array.isArray(data?.data) ? data.data : [];
  return offers.map((offer) => toVoucher(offer, locale, t));
}

export async function readReferral(): Promise<Referral> {
  const [api, locale, t] = await Promise.all([
    serverApi(),
    getLocale(),
    getTranslations("account"),
  ]);
  const [referrals, points] = await Promise.allSettled([
    api.get("/referrals/my-referrals"),
    api.get("/points/my-points"),
  ]);
  if (referrals.status === "rejected") throw referrals.reason;
  const data = referrals.value.data?.data ?? {};
  const summary = data.summary ?? {};
  const count = (n: unknown) => formatNumber(typeof n === "number" ? n : 0, locale);
  const euros = (n: unknown) =>
    formatCurrency(typeof n === "number" ? n : 0, locale, "EUR");
  const current =
    points.status === "fulfilled" ? points.value.data?.data?.currentPoints : undefined;
  return {
    code: typeof data.myReferralCode === "string" ? data.myReferralCode : "",
    stats: [
      { label: t("referralInvites"), value: count(summary.totalInvites) },
      { label: t("referralSuccessful"), value: count(summary.successfulInvites) },
      { label: t("referralPending"), value: count(summary.pendingInvites) },
      { label: t("referralEarned"), value: euros(summary.totalEarned) },
      { label: t("referralWallet"), value: euros(summary.currentWalletBalance) },
    ],
    points:
      typeof current === "number"
        ? t("pointsBalance", { points: formatNumber(current, locale) })
        : undefined,
  };
}

const CLOSED = new Set(["CLOSED", "RESOLVED"]);

/** The customer's open support thread, newest activity first, oldest message
 *  first. `userId` decides which messages are the customer's own. */
export async function readSupport(userId: string): Promise<SupportThread> {
  const [api, locale, t] = await Promise.all([
    serverApi(),
    getLocale(),
    getTranslations("account"),
  ]);
  const { data } = await api.get("/support/tickets", { params: { limit: 20 } });
  const tickets: {
    ticketId?: string;
    status?: string;
    lastMessageTime?: string;
    createdAt?: string;
    unreadCount?: Record<string, number>;
  }[] = Array.isArray(data?.data) ? data.data : [];
  const ticket = tickets
    .filter((candidate) => candidate.ticketId && !CLOSED.has(candidate.status ?? ""))
    .sort(
      (a, b) =>
        Date.parse(b.lastMessageTime ?? b.createdAt ?? "") -
        Date.parse(a.lastMessageTime ?? a.createdAt ?? ""),
    )[0];
  if (!ticket?.ticketId) return { messages: [], unread: 0 };

  const response = await api.get(
    `/support/tickets/${encodeURIComponent(ticket.ticketId)}/messages`,
    { params: { limit: 100 } },
  );
  const raw: {
    _id: string;
    senderId?: string;
    message?: string;
    createdAt?: string;
    attachments?: string[];
  }[] = Array.isArray(response.data?.data) ? response.data.data : [];

  const today = formatDate(new Date(), locale);
  const messages: SupportMessage[] = [...raw]
    .sort((a, b) => Date.parse(a.createdAt ?? "") - Date.parse(b.createdAt ?? ""))
    .map((message) => {
      const day = formatDate(message.createdAt, locale);
      return {
        id: message._id,
        mine: message.senderId === userId,
        text: message.message ?? "",
        time: formatTime(message.createdAt, locale),
        day:
          day === today
            ? t("supportToday")
            : formatDate(message.createdAt, locale, {
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
        attachments: (message.attachments ?? []).filter((a) => typeof a === "string"),
      };
    });

  const statusKey = {
    OPEN: "supportOpen",
    IN_PROGRESS: "supportInProgress",
  } as const;
  const key = statusKey[ticket.status as keyof typeof statusKey];
  return {
    ticketId: ticket.ticketId,
    status: key ? t(key) : undefined,
    messages,
    unread: ticket.unreadCount?.[userId] ?? 0,
  };
}

/**
 * The profile's two tiles, as the old profile showed them: vouchers available
 * (`GET /offers`, active and not deleted — the old app's count) and the reward
 * points balance (`/points/my-points`). Each is omitted when it cannot be read.
 */
export async function readProfileStats(): Promise<{
  vouchers?: string;
  points?: string;
}> {
  const [api, locale] = await Promise.all([serverApi(), getLocale()]);
  const [offers, points] = await Promise.allSettled([
    api.get("/offers", { params: { limit: 100 } }),
    api.get("/points/my-points"),
  ]);
  const rows: { isActive?: boolean; isDeleted?: boolean }[] =
    offers.status === "fulfilled" && Array.isArray(offers.value.data?.data)
      ? offers.value.data.data
      : [];
  const current =
    points.status === "fulfilled" ? points.value.data?.data?.currentPoints : undefined;
  return {
    vouchers:
      offers.status === "fulfilled"
        ? formatNumber(rows.filter((o) => o.isActive && !o.isDeleted).length, locale)
        : undefined,
    points: typeof current === "number" ? formatNumber(current, locale) : undefined,
  };
}
