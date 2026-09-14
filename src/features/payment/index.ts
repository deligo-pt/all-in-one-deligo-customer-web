/**
 * The payment return's public surface (Phase 18): one component that both
 * return routes render, so neither ships the other's parts — and neither ships
 * the checkout screen, which is why this is not on `features/checkout`'s
 * barrel (measured: 188 KB on `/payment-failed` when it was).
 */
export { PaymentOutcome, type OutcomeCopy } from "./PaymentOutcome";
export type { ConfirmedCopy } from "./ConfirmedModal";
