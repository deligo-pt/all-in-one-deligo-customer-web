"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { loadGoogleIdentity } from "./googleIdentity";

/** GIS caps its button at 400px. */
const MAX_WIDTH = 400;

/**
 * The design's "Continue with Google" row, filled by Google's own button once
 * GIS is loaded (D-17). Until then — no client id, a blocked script, the
 * offline states page — `fallback` renders: the design's button, which says
 * the option is unavailable when pressed.
 *
 * The callbacks are held in refs so re-rendering the form on every keystroke
 * does not tear Google's button down and rebuild it.
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
        target.innerHTML = "";
        api.renderButton(target, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "center",
          width: Math.min(Math.round(slot.getBoundingClientRect().width), MAX_WIDTH),
          locale,
        });
        setRenderedFor(locale);
      })
      .catch(() => {
        if (!cancelled) setRenderedFor(null);
      });
    return () => {
      cancelled = true;
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
