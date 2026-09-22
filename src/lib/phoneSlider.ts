/**
 * A row that swipes on a phone and is the page's own grid from `sm` up.
 *
 * Phone-first pass (22 Sep 2026): a 1440px design stacked into one column on
 * a phone made the landing page 12,000px tall — six service cards alone were
 * 2,000px of scrolling. The fix used across the app is one pattern, written
 * once so every row behaves the same: below `sm` the list becomes a
 * horizontal slider that snaps card by card, runs to the screen's edges
 * (cancelling the page's 16px gutter so a card slides out from under it), and
 * shows ~22% of the next card as the hint that there is more. No scrollbar is
 * drawn — the peeking card is the affordance — and the page itself never
 * scrolls sideways: the overflow lives inside the row.
 *
 * Strings only, so `lib/` stays pure; Tailwind reads them from here.
 */

/** On the list (`<ul>`): a snap slider below `sm`. Keep its grid classes too. */
export const PHONE_SLIDER =
  "max-sm:-mx-4 max-sm:flex max-sm:snap-x max-sm:snap-mandatory max-sm:scroll-px-4 max-sm:gap-4 max-sm:overflow-x-auto max-sm:px-4 max-sm:pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

/** On each item (`<li>`): about four-fifths of the screen, snapping at its start. */
export const PHONE_SLIDE = "max-sm:w-[78%] max-sm:shrink-0 max-sm:snap-start";

/** A one-line strip of small items (chips, tabs) that swipes below `sm`. */
export const PHONE_STRIP =
  "max-sm:-mx-4 max-sm:flex-nowrap max-sm:snap-x max-sm:scroll-px-4 max-sm:overflow-x-auto max-sm:px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
