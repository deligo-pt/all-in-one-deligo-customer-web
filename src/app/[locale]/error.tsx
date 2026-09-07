"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * The boundary for anything that throws while rendering a page.
 *
 * It sits inside the locale layout, so it still has the header, the footer and
 * — the part that matters — the customer's language. The previous project's
 * error page was English-only on a Portuguese-default product.
 *
 * The error is logged rather than shown. `error.message` from a production
 * build is a minified string at best and an internal detail at worst; neither
 * belongs on screen. `digest` is the id that ties this render to the server log.
 */
export default function PageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation("errors");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="flex flex-1 items-center justify-center">
      <EmptyState
        icon={<Icon name="alert" className="size-8" />}
        title={t("unexpectedTitle")}
        description={t("unexpectedDescription")}
        action={<Button onClick={reset}>{t("tryAgain")}</Button>}
      />
    </main>
  );
}
