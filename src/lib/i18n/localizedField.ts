/**
 * A text field the backend may return either already resolved to a string — most
 * endpoints honour the `Accept-Language` header the API client sends — or as the
 * raw bilingual document.
 *
 * Carried from the previous project unchanged, because the failure it prevents
 * was found there the hard way: the offers endpoints return the raw object, and
 * rendering one directly throws "Objects are not valid as a React child" at the
 * customer. Typing such a field as `string` compiles cleanly and crashes at
 * render, which is the worst combination available.
 *
 * Rule: type an API text field as `LocalizedField` unless you have seen that
 * endpoint resolve it.
 */
import type { Locale } from "./locale";

export type LocalizedField = string | { en?: string; pt?: string } | null | undefined;

/**
 * Narrows a possibly-bilingual field to a plain string for display.
 *
 * Falls back to the other language rather than rendering nothing when only one
 * translation exists — a vendor with a Portuguese name and no English one
 * should show its Portuguese name, not a blank card.
 */
export function resolveLocalized(value: LocalizedField, locale: Locale): string {
  if (typeof value === "string") return value;
  if (!value) return "";
  return value[locale] ?? value.en ?? value.pt ?? "";
}
