import { notFound } from "next/navigation";

// Every path under a locale that matches no real route lands here, so that the
// 404 is rendered *inside* the locale layout and comes out in the customer's
// language. Without it Next serves its own built-in 404 for an unmatched URL —
// no layout, no `lang`, English only — because `[locale]/not-found.tsx` is only
// reached when something inside the segment calls `notFound()`. This page is
// the thing that calls it.
//
// `dynamicParams` is re-enabled for this segment alone: the layout sets it to
// false so that an unknown *locale* is a hard 404, but this route has to accept
// any path in order to reject it.
export const dynamicParams = true;

export default function CatchAllNotFound(): never {
  notFound();
}
