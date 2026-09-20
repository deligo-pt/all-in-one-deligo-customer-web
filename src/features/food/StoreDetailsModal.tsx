"use client";

import { useEffect, useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import type { StoreDetails } from "./types";
import type { StoreDetailsCopy } from "./StoreDetailsPanel";

/**
 * Everything a customer can be told about a store — the old app's vendor
 * details dialog, rebuilt (Phase 20d, second pass).
 *
 * Two columns at desktop width, one on a phone. The left is where the store
 * **is**: a real Google map with a pin on it, then the two facts that decide
 * whether to order now (open or shut, and how long the kitchen takes), then
 * the address. The right is how to **reach** them — telephone, email, tax
 * number — and who they are on paper, with the EU compliance line the old app
 * carried.
 *
 * **The map is a map, not a picture of one.** It loads with this dialog and
 * only with it: the Maps script is worth roughly 90 KB, and a customer who
 * never opens the dialog never pays for it. A store with no coordinates on
 * file gets no frame at all rather than a grey rectangle over the Atlantic,
 * and a script that fails to load says so in one line.
 *
 * Nothing here is invented. Every row is a field the API sent; the ones it did
 * not send are absent, which is why the columns are built from lists rather
 * than a fixed grid of labels.
 */
export function StoreDetailsModal({
  open,
  onOpenChange,
  storeOpen,
  details,
  name,
  locale,
  copy,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  storeOpen: boolean;
  details: StoreDetails;
  name: string;
  locale: string;
  copy: StoreDetailsCopy;
}) {
  const [mapFrame, setMapFrame] = useState<HTMLDivElement | null>(null);
  const [mapFailed, setMapFailed] = useState(false);

  const position = details.position;

  /**
   * The map mounts from a **callback ref**, not from an effect over a `useRef`.
   *
   * Measured here, twice: inside the dialog the effect ran while `ref.current`
   * was still null — the dialog's content and this effect land in the same
   * commit, and the ref was not attached in time — so the map silently never
   * loaded and nothing errored. A callback ref fires exactly when the node is
   * attached, which is the only moment this code cares about.
   */
  useEffect(() => {
    if (!mapFrame || !position) return;
    let mounted: { dispose: () => void } | null = null;
    let live = true;
    void (async () => {
      try {
        const { mountStoreMap } = await import("@/services/maps/browser");
        const map = await mountStoreMap(mapFrame, { ...position, title: name }, locale);
        if (live) mounted = map;
        else map.dispose();
      } catch (error) {
        // No key, a blocked script, no network: the address below is still
        // the answer to "where are they", so the dialog says the map failed
        // and keeps everything else.
        console.error("[store] the map could not be loaded", error);
        if (live) setMapFailed(true);
      }
    })();
    return () => {
      live = false;
      mounted?.dispose();
    };
  }, [mapFrame, position, name, locale]);

  const contacts: readonly { icon: IconName; label: string; value: string }[] = [
    details.phone
      ? { icon: "phone" as const, label: copy.phone, value: details.phone }
      : null,
    details.email
      ? { icon: "email" as const, label: copy.email, value: details.email }
      : null,
    details.nif ? { icon: "card" as const, label: copy.nif, value: details.nif } : null,
  ].filter((row) => row !== null);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={name}
      description={copy.subtitle}
      closeLabel={copy.close}
      className="w-[min(60rem,calc(100vw-2rem))] p-8"
    >
      <div className="mt-2 grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          {position ? (
            <div className="rounded-16 border-line relative h-64 overflow-hidden border">
              <div ref={setMapFrame} className="bg-surface-muted size-full" />
              {mapFailed ? (
                <p className="text-14 text-ink-muted absolute inset-0 flex items-center justify-center px-6 text-center">
                  {copy.mapUnavailable}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-16 bg-surface-muted flex items-start gap-3 p-4">
              <span
                aria-hidden
                className={[
                  "flex size-10 shrink-0 items-center justify-center rounded-full",
                  storeOpen ? "text-success bg-surface" : "text-ink-muted bg-surface",
                ].join(" ")}
              >
                <Icon name="clock" className="size-5" />
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <span
                  className={[
                    "text-16 font-semibold",
                    storeOpen ? "text-success" : "text-ink-muted",
                  ].join(" ")}
                >
                  {storeOpen ? copy.open : copy.closed}
                </span>
                {details.hours ? (
                  <span className="text-14 text-ink-muted">{details.hours}</span>
                ) : null}
              </span>
            </div>

            {details.preparation ? (
              <div className="rounded-16 bg-surface-muted flex items-start gap-3 p-4">
                <span
                  aria-hidden
                  className="bg-surface text-brand flex size-10 shrink-0 items-center justify-center rounded-full"
                >
                  <Icon name="food" className="size-5" />
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="text-16 text-brand font-semibold">
                    {copy.preparation}
                  </span>
                  <span className="text-14 text-ink-muted">{details.preparation}</span>
                </span>
              </div>
            ) : null}
          </div>

          {details.address ? (
            <div className="rounded-16 border-brand-soft bg-surface-subtle flex items-start gap-3 border p-4">
              <span
                aria-hidden
                className="bg-brand-tint text-brand flex size-10 shrink-0 items-center justify-center rounded-full"
              >
                <Icon name="location" className="size-5" />
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="text-14 text-ink-muted font-medium">
                  {copy.address}
                </span>
                <span className="text-16 text-ink break-words">{details.address}</span>
              </span>
            </div>
          ) : null}

          {details.closingDays.length > 0 ? (
            <p className="text-14 text-ink-muted">
              {copy.closingDays}: {details.closingDays.join(", ")}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-6">
          {contacts.length > 0 ? (
            <section className="flex flex-col gap-3">
              <h3 className="text-20 text-brand font-semibold">{copy.contactTitle}</h3>
              {contacts.map((row) => (
                <div
                  key={row.label}
                  className="rounded-16 bg-surface-muted flex items-center gap-3 p-4"
                >
                  <span
                    aria-hidden
                    className="bg-brand-tint text-brand flex size-10 shrink-0 items-center justify-center rounded-full"
                  >
                    <Icon name={row.icon} className="size-5" />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-14 text-ink-muted">{row.label}</span>
                    <span className="text-16 text-ink font-medium break-words">
                      {row.value}
                    </span>
                  </span>
                </div>
              ))}
            </section>
          ) : null}

          <section className="flex flex-col gap-3">
            <h3 className="text-20 text-brand font-semibold">{copy.otherTitle}</h3>
            {details.legalName ? (
              <div className="flex flex-col gap-1">
                <span className="text-14 text-ink-muted">{copy.legalName}</span>
                <span className="text-16 text-ink font-medium break-words">
                  {details.legalName}
                </span>
              </div>
            ) : null}
            {/* DeliGo's own sentence, carried over from the old dialog: it is a
                statement the partner makes, not something we compute. */}
            <p className="rounded-16 bg-surface-muted text-14 text-ink-muted p-4 italic">
              {copy.euCompliance}
            </p>
          </section>
        </div>
      </div>
    </Modal>
  );
}
