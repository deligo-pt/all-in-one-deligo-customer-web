/**
 * The API's error envelope, reduced to what a screen can use (Phase 15).
 *
 * `{ success: false, message, errorSources[], err: { statusCode, errorKey } }`.
 * `errorKey` is the contract and is what code branches on; `message` is prose,
 * sometimes `{ en, pt }`, and is only ever shown.
 */

type Localised = string | { en?: string; pt?: string } | undefined | null;

export type ApiFailure = {
  status?: number;
  errorKey?: string;
  /** The server's sentence in the requested language, when it sent one. */
  message?: string;
  fields: readonly { path: string; message: string }[];
};

export function resolveText(value: unknown, locale: string): string | undefined {
  const v = value as Localised;
  if (typeof v === "string") return v || undefined;
  if (v && typeof v === "object") {
    const text = locale === "en" ? (v.en ?? v.pt) : (v.pt ?? v.en);
    return text || undefined;
  }
  return undefined;
}

/**
 * Validation failures arrive under a generic wrapper ("Validation failed…",
 * "Zod Validation Error") with the real reason in `errorSources`. The field's
 * reason wins over the wrapper; any other message is kept as sent.
 */
const WRAPPER = /validation (error|failed)/i;

export function normaliseFailure(
  status: number | undefined,
  body: unknown,
  locale: string,
): ApiFailure {
  const b = (body && typeof body === "object" ? body : {}) as {
    message?: unknown;
    errorSources?: { path?: unknown; message?: unknown }[];
    err?: { statusCode?: unknown; errorKey?: unknown };
  };
  const fields = (Array.isArray(b.errorSources) ? b.errorSources : [])
    .map((s) => ({
      path: typeof s.path === "string" ? s.path : "",
      message: resolveText(s.message, locale) ?? "",
    }))
    .filter((s) => s.message);
  const top = resolveText(b.message, locale);
  const message =
    top && WRAPPER.test(top)
      ? (fields[0]?.message ?? top)
      : (top ?? fields[0]?.message);
  const errorKey = typeof b.err?.errorKey === "string" ? b.err.errorKey : undefined;
  const statusCode = typeof b.err?.statusCode === "number" ? b.err.statusCode : status;
  return { status: statusCode, errorKey, message, fields };
}
