"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n/locale";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";

/**
 * The header search. Measured at 44px tall with an 8px radius — shorter than
 * the 56px form `Input`, which is why the height is overridden here rather than
 * a second size being added to the primitive for one caller.
 *
 * A real `<form>`, so Enter submits and the browser offers the field to a
 * password manager's cousins — the autofill and history machinery that a
 * `<div>` with a keydown handler does not get. Phase 16 replaces the navigation
 * with the live search; the shape of the submit does not change.
 */
export function SearchBox({
  locale,
  label,
  placeholder,
  className,
}: {
  locale: Locale;
  label: string;
  placeholder: string;
  className?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <form
      role="search"
      aria-label={label}
      className={cn("min-w-0", className)}
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = query.trim();
        if (!trimmed) return;
        router.push(
          `${withLocale(ROUTES.search.path, locale)}?q=${encodeURIComponent(trimmed)}`,
        );
      }}
    >
      <Input
        type="search"
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label={label}
        placeholder={placeholder}
        startIcon={<Icon name="search" className="size-4" />}
        className="text-14 rounded-8 h-11 ps-10"
      />
    </form>
  );
}
