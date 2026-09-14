"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

/**
 * "Log out of this account". Ends the session on the API and in this browser,
 * then goes home — the page it was pressed on needs a session to exist.
 */
export function SignOutButton({
  label,
  homeHref,
  className,
}: {
  label: string;
  homeHref: string;
  className?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Button
      variant="link"
      className={className}
      loading={pending}
      disabled={pending}
      onClick={async () => {
        setPending(true);
        // Imported on press: this button sits on the account page, and axios
        // has no business in that page's first load.
        const { endSession } = await import("@/services/session/browser");
        await endSession();
        router.replace(homeHref);
        router.refresh();
      }}
    >
      {label}
    </Button>
  );
}
