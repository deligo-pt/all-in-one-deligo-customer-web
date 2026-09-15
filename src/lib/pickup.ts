/**
 * Self-pickup times, ported from the old app's `lib/pickupTime.ts` and checked
 * against the live API (Phase 18 follow-up, 15 Sep 2026):
 *
 * - `POST /checkout` takes `fulfillmentType: "PICKUP"` with `pickupTime` (ISO);
 *   without a time it answers "pickupTime is required for self-pickup orders";
 * - a restaurant is **today only** (`PICKUP_TIME_MUST_BE_TODAY` for tomorrow);
 *   a store may book ahead (the old app's two days);
 * - a time must start a 30-minute slot (`PICKUP_TIME_NOT_HALF_HOUR_SLOT`);
 * - the store's hours come as "07:00" / "22:30", in store-local time, which is
 *   Lisbon — the API has no per-store time zone.
 *
 * Pure: no request, no framework, so the guard runs it.
 */

export const STORE_TIME_ZONE = "Europe/Lisbon";
export const SLOT_MINUTES = 30;
/** How far ahead of now the first slot must start. */
export const PICKUP_LEAD_MINUTES = 10;
export const STORE_ADVANCE_DAYS = 2;

export type TimeOfDay = { hours: number; minutes: number };
export type CalendarDate = { year: number; month: number; day: number };
export type PickupSlot = { date: CalendarDate; time: TimeOfDay };
export type PickupDay = { date: CalendarDate; offset: number; slots: TimeOfDay[] };
export type PickupHours = {
  openingHours?: string;
  closingHours?: string;
  businessType?: string;
  closingDays?: readonly string[];
};

function zoned(instant: Date) {
  // Numeric parts only, so the formatter's language is irrelevant: no locale,
  // Latin digits, a 0–23 clock.
  const parts = new Intl.DateTimeFormat(undefined, {
    timeZone: STORE_TIME_ZONE,
    hourCycle: "h23",
    numberingSystem: "latn",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hours: read("hour") % 24,
    minutes: read("minute"),
    seconds: read("second"),
  };
}

const offsetMinutes = (instant: Date) => {
  const p = zoned(instant);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hours, p.minutes, p.seconds);
  return (asUtc - Math.floor(instant.getTime() / 1000) * 1000) / 60000;
};

export const toMinutes = (time: TimeOfDay) => time.hours * 60 + time.minutes;
const fromMinutes = (total: number): TimeOfDay => ({
  hours: Math.floor(total / 60),
  minutes: total % 60,
});
const ordinal = (date: CalendarDate) => date.year * 10000 + date.month * 100 + date.day;

export function storeToday(now: Date = new Date()): CalendarDate {
  const { year, month, day } = zoned(now);
  return { year, month, day };
}

export function addDays(date: CalendarDate, days: number): CalendarDate {
  const shifted = new Date(Date.UTC(date.year, date.month - 1, date.day + days, 12));
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
}

/** "07:00", "22:30", and the 12-hour spellings some stores carry
 *  ("7:00 AM", with a narrow no-break space). `null` when unreadable. */
export function parseStoreHour(value: string | undefined): TimeOfDay | null {
  const match = /^(\d{1,2}):(\d{2})\s*([AaPp][Mm])?$/.exec(
    (value ?? "").replace(/[  ]/g, " ").trim(),
  );
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem) {
    if (hours < 1 || hours > 12) return null;
    hours = (hours % 12) + (meridiem === "PM" ? 12 : 0);
  }
  if (hours > 23 || minutes > 59) return null;
  return { hours, minutes };
}

/** The bookable slot starts on one day: every half hour from opening (or now
 *  plus the lead, today) until closing. */
export function slotsForDay(
  hours: PickupHours,
  date: CalendarDate,
  now: Date = new Date(),
): TimeOfDay[] {
  const opening = parseStoreHour(hours.openingHours);
  const closing = parseStoreHour(hours.closingHours);
  if (!opening || !closing) return [];
  const opensAt = toMinutes(opening);
  const closesAt = toMinutes(closing);
  if (closesAt <= opensAt) return [];
  const today = storeToday(now);
  if (ordinal(date) < ordinal(today)) return [];
  const { hours: h, minutes: m } = zoned(now);
  const floor =
    ordinal(date) === ordinal(today)
      ? Math.max(opensAt, h * 60 + m + PICKUP_LEAD_MINUTES)
      : opensAt;
  const slots: TimeOfDay[] = [];
  for (
    let minute = Math.ceil(floor / SLOT_MINUTES) * SLOT_MINUTES;
    minute <= closesAt;
    minute += SLOT_MINUTES
  )
    slots.push(fromMinutes(minute));
  return slots;
}

const WEEKDAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];
/** The API's `closingDays` spell days in English ("Friday"). */
const weekday = (date: CalendarDate) =>
  WEEKDAYS[new Date(Date.UTC(date.year, date.month - 1, date.day, 12)).getUTCDay()]!;

/** Today — and, for a store, the next two days — each with its slots. A day in
 *  `closingDays` has none. */
export function pickupDays(hours: PickupHours, now: Date = new Date()): PickupDay[] {
  const today = storeToday(now);
  const closed = new Set((hours.closingDays ?? []).map((d) => d.trim().toLowerCase()));
  const span = hours.businessType === "STORE" ? STORE_ADVANCE_DAYS : 0;
  return Array.from({ length: span + 1 }, (_, offset) => {
    const date = addDays(today, offset);
    return {
      date,
      offset,
      slots: closed.has(weekday(date)) ? [] : slotsForDay(hours, date, now),
    };
  });
}

export const hasSlots = (days: readonly PickupDay[]) =>
  days.some((d) => d.slots.length > 0);

/** The slot's start, as the instant the API takes. */
export function slotToIso(slot: PickupSlot, now: Date = new Date()): string {
  const asUtc = Date.UTC(
    slot.date.year,
    slot.date.month - 1,
    slot.date.day,
    slot.time.hours,
    slot.time.minutes,
  );
  const provisional = new Date(asUtc - offsetMinutes(now) * 60000);
  return new Date(asUtc - offsetMinutes(provisional) * 60000).toISOString();
}

export const formatTimeOfDay = (time: TimeOfDay) =>
  `${String(time.hours).padStart(2, "0")}:${String(time.minutes).padStart(2, "0")}`;

/** "14:00 → 14:30", cut at closing. */
export function slotRange(time: TimeOfDay, closingHours?: string): string {
  const closing = parseStoreHour(closingHours);
  const start = toMinutes(time);
  const end = Math.min(start + SLOT_MINUTES, closing ? toMinutes(closing) : Infinity);
  return end <= start
    ? formatTimeOfDay(time)
    : `${formatTimeOfDay(time)} → ${formatTimeOfDay(fromMinutes(end))}`;
}
