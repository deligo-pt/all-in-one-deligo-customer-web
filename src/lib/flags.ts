/**
 * Feature flags — currently exactly one, and it exists because of decision D-6.
 *
 * Five of the six verticals in the design have no backend behind them
 * (Plan.md §2.3). They are built anyway: the screens are part of the product
 * and Phase 21's deliverable is a written endpoint specification handed to the
 * backend team. What must not happen is a customer clicking "Ride" in
 * production and arriving somewhere that cannot answer.
 *
 * So the pages exist and are reachable by URL, and navigation hides them unless
 * the flag is on. On in development by default, because the whole point of
 * building them is to look at them.
 *
 * The default is deliberately "off in production unless someone says otherwise"
 * rather than "on unless someone remembers" — a flag whose unsafe state is the
 * default is a flag that will ship in its unsafe state.
 */
export function unbuiltVerticalsVisible(): boolean {
  const explicit = process.env.NEXT_PUBLIC_SHOW_UNBUILT_VERTICALS;
  if (explicit === "true") return true;
  if (explicit === "false") return false;
  return process.env.NODE_ENV !== "production";
}
