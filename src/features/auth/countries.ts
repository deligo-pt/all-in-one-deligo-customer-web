/**
 * The dial code the phone field prepends.
 *
 * One entry, and that is not an oversight. The previous app shipped a country
 * picker with twenty options of which nineteen were commented out — the list
 * was written for a product that serves Portugal, and every other row was
 * aspiration. A picker with one option is a control that cannot be operated;
 * a fixed prefix is the truth.
 *
 * When DeliGo serves a second country this becomes a real list and the field
 * grows a real picker. What must not happen in between is a dropdown that looks
 * like a choice and is not one. The available-countries endpoint that would
 * populate it is Phase 20's.
 */
export const DEFAULT_DIAL_CODE = "+351";

/** `+351` and `912 345 678` are two halves of one string as far as the API is
 *  concerned. Joining them here, at the form's edge, means every caller below
 *  handles a single `contactNumber` and no request has to remember to prefix. */
export function toContactNumber(nationalNumber: string): string {
  return `${DEFAULT_DIAL_CODE}${nationalNumber.replace(/\D/g, "")}`;
}
