"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { LocationForm, type LocationFormCopy } from "@/components/shared/LocationForm";
import type { LocationChoice } from "@/services/location/server";

export type LocationModalCopy = {
  title: string;
  body: string;
  /** Asked on a first visit, when nobody has said where they are yet. */
  askTitle: string;
  askBody: string;
  askLater: string;
  close: string;
  savedTitle: string;
  active: string;
  elsewhereTitle: string;
  addNew: string;
  failed: string;
  form: LocationFormCopy;
};

/**
 * The location card's picker (Phase 20b).
 *
 * The old app put this in the navbar; here it belongs to the "Delivering to …"
 * card the design draws above every listing, which is where the customer is
 * already looking when they notice the address is wrong.
 *
 * Two halves, because a location has two sources. A signed-in customer's saved
 * addresses are the top half, and choosing one makes it **active**, which is
 * account-wide and what `/checkout` will bind to — the same write the account
 * screen does, not a listing-only preference. The bottom half is the hero's
 * address bar: type a place or use the device, stored in our own cookie. A
 * guest sees only the second half, because they have no addresses to choose.
 *
 * **It also asks, once.** The old app's `LocationPromptModal` opened on a first
 * visit; here the same dialog opens itself when the listing has no location at
 * all — the state where the page can show nothing useful anyway. Once per
 * browser: the flag is written before the dialog opens, so a customer who
 * closes it is not asked again on the next page.
 */
const ASKED = "deligo-location-asked";
export function LocationModal({
  open,
  onOpenChange,
  locale,
  choices,
  addHref,
  unset = false,
  askOnce = false,
  copy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locale: string;
  choices: readonly LocationChoice[];
  /** The account's addresses screen, where a new one is added. */
  addHref?: string;
  /** Nobody has said where to deliver yet. */
  unset?: boolean;
  /** Open on a first visit, at most once per browser. */
  askOnce?: boolean;
  copy: LocationModalCopy;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!askOnce || !unset) return;
    try {
      if (window.localStorage.getItem(ASKED) === "1") return;
      window.localStorage.setItem(ASKED, "1");
    } catch {
      // Private windows and blocked storage: ask nothing rather than ask on
      // every page load, which is the worse of the two failures.
      return;
    }
    onOpenChange(true);
  }, [askOnce, unset, onOpenChange]);

  async function choose(choice: LocationChoice) {
    if (choice.active) return onOpenChange(false);
    setBusy(choice.id);
    setFailed(false);
    try {
      const { activateAddress } = await import("@/services/location/browser");
      await activateAddress(choice.id);
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("[location] switching the active address failed", error);
      setFailed(true);
    } finally {
      setBusy(null);
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={unset ? copy.askTitle : copy.title}
      description={unset ? copy.askBody : copy.body}
      closeLabel={copy.close}
      className="w-[min(36rem,calc(100vw-2rem))]"
      footer={
        unset ? (
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {copy.askLater}
          </Button>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-6">
        {choices.length > 0 ? (
          <section className="flex flex-col gap-3">
            <h3 className="text-14 text-ink-muted font-semibold uppercase">
              {copy.savedTitle}
            </h3>
            <div
              role="radiogroup"
              aria-label={copy.savedTitle}
              className="flex flex-col gap-3"
            >
              {choices.map((choice) => (
                <label
                  key={choice.id}
                  className={[
                    "rounded-16 flex cursor-pointer items-start gap-4 border p-4 transition-colors",
                    choice.active
                      ? "border-brand bg-brand-tint"
                      : "border-line hover:bg-surface-muted",
                  ].join(" ")}
                >
                  <span
                    aria-hidden
                    className="bg-brand-tint text-brand rounded-8 flex size-10 shrink-0 items-center justify-center"
                  >
                    <Icon name="location" className="size-5" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-14 text-ink-warm font-semibold uppercase">
                      {choice.label}
                      {choice.active ? ` · ${copy.active}` : ""}
                    </span>
                    <span className="text-16 text-ink break-words">{choice.line}</span>
                  </span>
                  {busy === choice.id ? (
                    <Spinner className="mt-1 size-5 shrink-0" />
                  ) : (
                    <input
                      type="radio"
                      name="delivery-location"
                      className="accent-brand mt-1 size-5 shrink-0"
                      checked={choice.active}
                      disabled={busy !== null}
                      onChange={() => void choose(choice)}
                    />
                  )}
                </label>
              ))}
            </div>
            {addHref ? (
              <Link
                href={addHref}
                className="text-16 text-brand inline-flex items-center gap-2 font-medium underline-offset-4 hover:underline"
              >
                <Icon name="plus" className="size-4" />
                {copy.addNew}
              </Link>
            ) : null}
          </section>
        ) : null}

        <section className="flex flex-col gap-3">
          <h3 className="text-14 text-ink-muted font-semibold uppercase">
            {copy.elsewhereTitle}
          </h3>
          {/* The hero's address bar, in the dialog: the same geocode, the same
              cookie. It refreshes the listing in place rather than navigating,
              because the customer is already on the page they wanted. */}
          <LocationForm
            locale={locale}
            copy={copy.form}
            onSaved={() => onOpenChange(false)}
          />
        </section>

        <p role="status" className="text-14 text-danger empty:hidden">
          {failed ? copy.failed : ""}
        </p>
      </div>
    </Modal>
  );
}
