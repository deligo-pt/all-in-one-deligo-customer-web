import type {
  AppNotification,
  NotificationGroup,
  Order,
  OrderPoint,
  OrderRoute,
} from "@/features/orders";
import { getLocale, getTranslations } from "@/i18n/server";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatTime,
} from "@/lib/i18n/format";
import type { Locale } from "@/lib/i18n/locale";
import { withLocale } from "@/lib/i18n/path";
import {
  canCancel,
  normaliseStatus,
  orderBucket,
  orderStep,
  refundState,
  statusNote,
} from "@/lib/orders";
import { ROUTES } from "@/lib/routes";
import { serverApi } from "@/services/api/server";
import { pricedStore, type RawSummary } from "@/services/checkout/server";

/**
 * Orders and notifications, read on the server (Phase 19) — the only code that
 * knows their shapes, measured on the owner's 62 orders and 102 notifications.
 *
 * `GET /orders` pages with `page` + `limit` (measured; `meta.totalPage`), and
 * `GET /orders/:orderId` adds what the list leaves out: the delivery code
 * (`deliveryOtp.code`) and the pickup code (`pickup.code`). A code is shown
 * only until it is verified. Notifications arrive in the request's language.
 */

type RawOrder = RawSummary & {
  orderId: string;
  orderStatus?: string;
  paymentStatus?: string;
  isPaid?: boolean;
  refundStatus?: string;
  cancelReason?: string | null;
  rejectReason?: string | null;
  createdAt?: string;
  statusHistory?: { status?: string; note?: string | null }[];
  deliveryPartnerId?: {
    name?: { firstName?: string; lastName?: string };
    profilePhoto?: string;
    /** GeoJSON: `[longitude, latitude]`, and in that order. Present only
     *  while the rider's session is live (the old app's tracking screen read
     *  the same field). */
    currentSessionLocation?: { coordinates?: number[] } | null;
  } | null;
  pickupAddress?: { latitude?: number; longitude?: number } | null;
  deliveryAddress?: {
    latitude?: number;
    longitude?: number;
    street?: string;
    city?: string;
  } | null;
  deliveryOtp?: { code?: string; verifiedAt?: string | null } | null;
  pickup?: { code?: string; verifiedAt?: string | null } | null;
  isRated?: boolean;
  ratingStatus?: { isProductRated?: boolean; isDeliveryRated?: boolean };
  invoiceSync?: { isSynced?: boolean };
  items?: (NonNullable<RawSummary["items"]>[number] & { image?: string })[];
};

type OrdersT = Awaited<ReturnType<typeof getTranslations<"orders">>>;
type CheckoutT = Awaited<ReturnType<typeof getTranslations<"checkout">>>;

const STATUS_KEYS = {
  PENDING: "statusPending",
  ACCEPTED: "statusAccepted",
  ASSIGNED: "statusAccepted",
  PREPARING: "statusPreparing",
  READY_FOR_PICKUP: "statusReady",
  PICKED_UP: "statusPickedUp",
  ON_THE_WAY: "statusOnTheWay",
  DELIVERED: "statusDelivered",
  PICKED_UP_BY_CUSTOMER: "statusCollected",
  REJECTED: "statusRejected",
  CANCELLED: "statusCancelled",
  NO_SHOW: "statusNotCollected",
} as const;

/** "ON_THE_WAY" → "On The Way", for a status this build has no words for. */
const humanise = (status: string) =>
  status
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((word) => word[0]!.toUpperCase() + word.slice(1))
    .join(" ");

function toOrder(
  raw: RawOrder,
  locale: Locale,
  t: OrdersT,
  checkout: CheckoutT,
  detailed: boolean,
): Order {
  const status = normaliseStatus(raw.orderStatus);
  const bucket = orderBucket(status);
  const pickup = raw.fulfillmentType === "PICKUP";
  const vendor = typeof raw.vendorId === "object" ? raw.vendorId : undefined;
  const items = raw.items ?? [];
  const itemsLabel = items
    .map(
      (item) =>
        `${formatNumber(item.itemSummary?.quantity ?? 1, locale)}× ${item.name ?? ""}`,
    )
    .join(", ");
  const key = STATUS_KEYS[status as keyof typeof STATUS_KEYS];
  const minutes = raw.delivery?.estimatedTime ?? 0;
  const rider = raw.deliveryPartnerId ?? undefined;
  const riderName = [rider?.name?.firstName, rider?.name?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const ended = status === "CANCELLED" || status === "REJECTED" || status === "NO_SHOW";
  const rated = raw.ratingStatus ?? {};

  return {
    id: raw.orderId,
    recordId: raw._id,
    reference: `#${raw.orderId}`,
    vendorName: vendor?.businessDetails?.businessName ?? "",
    itemsLabel,
    searchText: [
      raw.orderId,
      vendor?.businessDetails?.businessName,
      ...items.map((i) => i.name),
    ]
      .filter(Boolean)
      .join(" "),
    placedOn: formatDate(raw.createdAt, locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    total:
      typeof raw.payoutSummary?.grandTotal === "number"
        ? formatCurrency(raw.payoutSummary.grandTotal, locale, "EUR")
        : "",
    bucket,
    statusLabel: key ? t(key) : humanise(status),
    fulfilment: pickup ? "pickup" : "delivery",
    step: ended ? undefined : orderStep(status),
    eta:
      bucket === "ongoing" && !pickup && minutes > 0
        ? t("eta", { minutes: formatNumber(minutes, locale) })
        : undefined,
    image:
      items.find((item) => item.image)?.image || vendor?.documents?.storePhoto?.[0],
    route:
      pickup || ended ? undefined : route(raw, vendor?.businessDetails?.businessName),
    rider: riderName
      ? { name: riderName, photo: rider?.profilePhoto || undefined }
      : undefined,
    deliveryCode:
      detailed &&
      !pickup &&
      !ended &&
      raw.deliveryOtp?.code &&
      !raw.deliveryOtp.verifiedAt
        ? raw.deliveryOtp.code
        : undefined,
    pickupCode:
      detailed && pickup && !ended && raw.pickup?.code && !raw.pickup.verifiedAt
        ? raw.pickup.code
        : undefined,
    endedReason: ended
      ? (statusNote(status, raw.statusHistory) ??
        (raw.cancelReason || raw.rejectReason || undefined))
      : undefined,
    refund: refundState(raw),
    // The estimate is for an order still on its way, not a history.
    store: {
      ...pricedStore(raw, locale, checkout),
      ...(bucket === "ongoing" ? {} : { deliveryEstimate: undefined }),
    },
    canCancel: canCancel(status, raw.isPaid),
    canReorder: bucket !== "ongoing",
    productsToRate:
      bucket === "complete" && !raw.isRated && !rated.isProductRated
        ? items.map((item) => item.productId)
        : [],
    rateRider: bucket === "complete" && Boolean(rider) && !rated.isDeliveryRated,
    invoiceReady: Boolean(raw.invoiceSync?.isSynced),
  };
}

const PAGE = 100;
const MAX_PAGES = 10;

/** Every order, newest first (the API's order), page by page. */
/**
 * The map's three points (Phase 20f).
 *
 * The rider's position is GeoJSON — `[longitude, latitude]`, in that order,
 * which is the reverse of every other coordinate pair in this codebase and
 * exactly the kind of thing that puts a rider in the Atlantic. It is read
 * through `point()` so the swap happens in one place.
 *
 * A point the API did not send is simply absent: the map draws what it was
 * given and says so when that is nothing.
 */
const point = (
  latitude: unknown,
  longitude: unknown,
  label?: string,
): OrderPoint | undefined =>
  typeof latitude === "number" &&
  typeof longitude === "number" &&
  Number.isFinite(latitude) &&
  Number.isFinite(longitude) &&
  (latitude !== 0 || longitude !== 0)
    ? { latitude, longitude, ...(label ? { label } : {}) }
    : undefined;

function route(raw: RawOrder, storeName?: string): OrderRoute | undefined {
  const rider = raw.deliveryPartnerId?.currentSessionLocation?.coordinates;
  const built: OrderRoute = {
    store: point(raw.pickupAddress?.latitude, raw.pickupAddress?.longitude, storeName),
    destination: point(
      raw.deliveryAddress?.latitude,
      raw.deliveryAddress?.longitude,
      [raw.deliveryAddress?.street, raw.deliveryAddress?.city]
        .filter(Boolean)
        .join(", "),
    ),
    // GeoJSON order: longitude first.
    rider: point(rider?.[1], rider?.[0]),
  };
  return built.store || built.destination || built.rider ? built : undefined;
}

export async function readOrders(): Promise<Order[]> {
  const [api, locale, t, checkout] = await Promise.all([
    serverApi(),
    getLocale(),
    getTranslations("orders"),
    getTranslations("checkout"),
  ]);
  const raw: RawOrder[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const { data } = await api.get("/orders", { params: { limit: PAGE, page } });
    raw.push(...((data?.data ?? []) as RawOrder[]));
    if (page >= (data?.meta?.totalPage ?? 1)) break;
  }
  return raw.map((order) => toOrder(order, locale, t, checkout, false));
}

/** One order, with its codes. `null` when the API does not know it. */
export async function readOrder(orderId: string): Promise<Order | null> {
  const [api, locale, t, checkout] = await Promise.all([
    serverApi(),
    getLocale(),
    getTranslations("orders"),
    getTranslations("checkout"),
  ]);
  try {
    const { data } = await api.get(`/orders/${encodeURIComponent(orderId)}`);
    return data?.data
      ? toOrder(data.data as RawOrder, locale, t, checkout, true)
      : null;
  } catch (error) {
    if ((error as { status?: number }).status === 404) return null;
    throw error;
  }
}

type RawNotification = {
  _id: string;
  title?: string;
  message?: string;
  isRead?: boolean;
  createdAt?: string;
  data?: { orderId?: string };
};

const dayKey = (date: Date, locale: Locale) =>
  formatDate(date, locale, { year: "numeric", month: "2-digit", day: "2-digit" });

/** The customer's notifications, grouped by day, newest first. */
export async function readNotifications(): Promise<NotificationGroup[]> {
  const [api, locale, t] = await Promise.all([
    serverApi(),
    getLocale(),
    getTranslations("orders"),
  ]);
  const raw: RawNotification[] = [];
  for (let page = 1; page <= 3; page += 1) {
    const { data } = await api.get("/notifications/my-notifications", {
      params: { limit: PAGE, page },
    });
    raw.push(...((data?.data ?? []) as RawNotification[]));
    if (page >= (data?.meta?.totalPage ?? 1)) break;
  }

  const now = new Date();
  const today = dayKey(now, locale);
  const yesterday = dayKey(new Date(now.getTime() - 86_400_000), locale);
  const groups = new Map<string, { label: string; notifications: AppNotification[] }>();
  for (const item of raw) {
    const created = new Date(item.createdAt ?? 0);
    const key = dayKey(created, locale);
    const label =
      key === today
        ? t("notificationsToday")
        : key === yesterday
          ? t("notificationsYesterday")
          : formatDate(created, locale, {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
    const orderId = item.data?.orderId?.trim();
    const group = groups.get(key) ?? { label, notifications: [] };
    group.notifications.push({
      id: item._id,
      title: item.title ?? "",
      body: item.message ?? "",
      when: formatTime(created, locale),
      unread: !item.isRead,
      action: orderId
        ? {
            label: t("viewOrder"),
            href: withLocale(
              ROUTES.order.path.replace("[orderId]", encodeURIComponent(orderId)),
              locale,
            ),
          }
        : undefined,
    });
    groups.set(key, group);
  }
  return [...groups.entries()].map(([id, group]) => ({ id, ...group }));
}
