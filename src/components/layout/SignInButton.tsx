"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

/**
 * The header's way in.
 *
 * Loaded on first open, never on first paint. The panel pulls in a Radix
 * dialog, a Radix tab list, a focus trap, a portal and a form; the header
 * renders on every route in the application and most of them are never signed
 * in from. Same measurement that moved the mobile menu's drawer behind a
 * `dynamic` call in Phase 5, and worth more here.
 *
 * **The `dynamic` call below is the whole reason this file lives in `layout/`
 * rather than in `features/auth/`.** A feature's public surface is one barrel,
 * so a *static* import of anything in it — even a button — makes every export
 * of that barrel a client reference of whatever imported it, and the header is
 * imported by all seventy-two routes. Measured: the panel and its Radix
 * primitives added **27 KB gzipped to every page in the application**,
 * including the ones nobody signs in from. Going through the split point
 * instead puts the whole of it in a chunk the click requests.
 *
 * It is an anchor, not a button. Without JavaScript — or before the chunk
 * arrives — clicking it navigates to `/login`, which renders the same panel as
 * a page. With JavaScript the navigation is prevented and the drawer opens over
 * whatever the customer was already looking at, which is the design's
 * behaviour and the one that does not lose their place.
 */
const SignInDrawer = dynamic(
  () => import("./SignInDrawer").then((m) => m.SignInDrawer),
  { ssr: false },
);

export function SignInButton({
  href,
  label,
  title,
  description,
  closeLabel,
  appName,
}: {
  href: string;
  label: string;
  title: string;
  description: string;
  closeLabel: string;
  appName: string;
}) {
  const [open, setOpen] = useState(false);
  // Once opened, the drawer stays mounted. Unmounting it the instant `open`
  // goes false removes the element mid-transition, so the panel vanishes
  // rather than sliding out — and Radix's focus restoration has nothing to
  // return focus from.
  const [everOpened, setEverOpened] = useState(false);

  return (
    <>
      <Button variant="outline" asChild>
        <Link
          href={href}
          onClick={(event) => {
            // Let the browser have modified clicks: open-in-new-tab on a
            // sign-in link is a reasonable thing to do and a preventDefault
            // that ignores them is the reason so many single-page apps cannot.
            if (
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.button !== 0
            ) {
              return;
            }
            event.preventDefault();
            setEverOpened(true);
            setOpen(true);
          }}
        >
          {label}
        </Link>
      </Button>

      {/* Mounted only once it has been opened, so the chunk is requested by the
          click rather than by the page. */}
      {everOpened ? (
        <SignInDrawer
          open={open}
          onOpenChange={setOpen}
          title={title}
          description={description}
          closeLabel={closeLabel}
          appName={appName}
        />
      ) : null}
    </>
  );
}
