"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { OrderRoute } from "./types";

export type OrderMapCopy = {
  /** "Live tracking" — the pill in the corner, from the design's frame. */
  live: string;
  /** "Waiting for the rider's location" — no rider placed yet. */
  waiting: string;
  unavailable: string;
  storeLabel: string;
  destinationLabel: string;
  riderLabel: string;
};

/**
 * The delivery on a map — the design's `live track` frame (Phase 20f): the
 * route between the two ends, a pin on each, the rider's pin moving along it,
 * and the "Live tracking" pill in the corner.
 *
 * **It is mounted from a callback ref.** Phase 20d proved the alternative:
 * inside a panel that mounts in the same commit, an effect over a `useRef`
 * runs while `ref.current` is still null, the map never loads, and nothing
 * errors. A callback ref fires exactly when the node attaches.
 *
 * **Redrawn when the route changes, not on a timer of its own.** The order
 * detail already polls every 30 seconds; when the rider has moved, the new
 * coordinates arrive as a new `route` and the map is rebuilt around them.
 * A second clock here would only disagree with that one.
 *
 * **The rider is optional and usually absent.** Before assignment there is no
 * rider at all, and the API carries a position only while the rider's session
 * is live, so the panel says it is waiting rather than showing an empty frame.
 */
export function OrderMap({
  route,
  locale,
  copy,
}: {
  route: OrderRoute;
  locale: string;
  copy: OrderMapCopy;
}) {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  const [failed, setFailed] = useState(false);

  const { store, destination, rider } = route;
  // A stable description of the points, so the effect re-runs when the rider
  // has actually moved and not on every render of the page around it.
  const signature = [store, destination, rider]
    .map((point) => (point ? `${point.latitude},${point.longitude}` : "-"))
    .join("|");

  useEffect(() => {
    if (!frame) return;
    const points = [
      store ? { ...store, label: store.label ?? copy.storeLabel } : null,
      destination
        ? { ...destination, label: destination.label ?? copy.destinationLabel }
        : null,
      rider ? { ...rider, label: copy.riderLabel } : null,
    ].filter((point) => point !== null);
    if (points.length === 0) return;

    let mounted: { dispose: () => void } | null = null;
    let live = true;
    void (async () => {
      try {
        const { mountTrackingMap } = await import("@/services/maps/browser");
        const map = await mountTrackingMap(frame, points, locale);
        if (live) mounted = map;
        else map.dispose();
      } catch (error) {
        // No key, a blocked script, a referrer the key does not allow: the
        // tracker and the rider's name below are still the answer to "where
        // is my order", so the panel says the map failed and nothing else
        // changes.
        console.error("[order] the tracking map could not be loaded", error);
        if (live) setFailed(true);
      }
    })();
    return () => {
      live = false;
      mounted?.dispose();
    };
    // `signature` is what makes a moved rider a new map.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame, signature, locale]);

  return (
    <div className="rounded-24 border-line relative h-80 overflow-hidden border">
      <div ref={setFrame} className="bg-surface-muted size-full" />

      {/* The design's pill: a live dot and the word, top-left over the map. */}
      <p className="bg-surface rounded-full text-14 text-ink absolute top-4 left-4 flex items-center gap-2 px-4 py-2 font-medium shadow-md">
        <span
          aria-hidden
          className={[
            "size-2 rounded-full",
            rider ? "bg-success animate-pulse" : "bg-ink-subtle",
          ].join(" ")}
        />
        {rider ? copy.live : copy.waiting}
      </p>

      {failed ? (
        <p className="text-14 text-ink-muted absolute inset-0 flex items-center justify-center gap-2 px-6 text-center">
          <Icon name="map" className="size-4" />
          {copy.unavailable}
        </p>
      ) : null}
    </div>
  );
}
