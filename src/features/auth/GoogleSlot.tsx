"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { loadGoogleIdentity } from "./googleIdentity";

/** GIS draws its button between 200 and 400px wide, and not outside that. */
const MAX_WIDTH = 400;
const MIN_WIDTH = 200;

/** The width to ask Google for: the slot's, inside GIS's own limits. */
const buttonWidth = (slot: HTMLElement) =>
  Math.max(MIN_WIDTH, Math.min(Math.round(slot.getBoundingClientRect().width), MAX_WIDTH));

/**
 * The design's "Continue with Google" row, filled by Google's own button once
 * GIS is loaded (D-17). Until then — no client id, a blocked script, the
 * offline states page — `fallback` renders: the design's button, which says
 * the option is unavailable when pressed.
 *
 * The callbacks are held in refs so re-rendering the form on every keystroke
 * does not tear Google's button down and rebuild it.
 *
 * **The button is redrawn when its slot changes width.** Google draws it at a
 * fixed pixel width, once; measured in the responsive pass (22 Sep 2026), a
 * page drawn wide and then narrowed — a phone rotated to portrait, a window
 * made smaller — kept a 400px button in a 294px slot, 26px off a 320px
 * screen. A `ResizeObserver` asks for a new one whenever the slot's width
 * really changes.
 */
export function GoogleSlot({
  clientId,
  locale,
  onCredential,
  onUnavailable,
  fallback,
}: {
  clientId: string | undefined;
  locale: string;
  onCredential: (idToken: string) => void;
  onUnavailable: () => void;
  fallback: ReactNode;
}) {
  const slotRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const handlers = useRef({ onCredential, onUnavailable });
  const [renderedFor, setRenderedFor] = useState<string | null>(null);

  useEffect(() => {
    handlers.current = { onCredential, onUnavailable };
  }, [onCredential, onUnavailable]);

  useEffect(() => {
    const slot = slotRef.current;
    const target = targetRef.current;
    if (!clientId || !slot || !target) return;
    let cancelled = false;
    let observer: ResizeObserver | undefined;
    let redraw: number | undefined;
    loadGoogleIdentity(locale)
      .then((api) => {
        if (cancelled) return;
        api.initialize({
          client_id: clientId,
          callback: ({ credential }) =>
            credential
              ? handlers.current.onCredential(credential)
              : handlers.current.onUnavailable(),
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        const draw = (width: number) => {
          target.innerHTML = "";
          api.renderButton(target, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            logo_alignment: "center",
            width,
            locale,
          });
        };
        let drawnAt = buttonWidth(slot);
        draw(drawnAt);
        setRenderedFor(locale);

        // Redraw only on a real change, settled: a resize fires many times a
        // second, and each redraw is Google tearing its iframe down.
        observer = new ResizeObserver(() => {
          window.clearTimeout(redraw);
          redraw = window.setTimeout(() => {
            if (cancelled) return;
            const next = buttonWidth(slot);
            if (Math.abs(next - drawnAt) < 4) return;
            drawnAt = next;
            draw(next);
          }, 150);
        });
        observer.observe(slot);
      })
      .catch(() => {
        if (!cancelled) setRenderedFor(null);
      });
    return () => {
      cancelled = true;
      observer?.disconnect();
      window.clearTimeout(redraw);
    };
  }, [clientId, locale]);

  const rendered = Boolean(clientId) && renderedFor === locale;

  return (
    <div ref={slotRef} className="flex min-h-12 w-full items-center justify-center">
      <div ref={targetRef} className={rendered ? "flex justify-center" : "hidden"} />
      {rendered ? null : fallback}
    </div>
  );
}
