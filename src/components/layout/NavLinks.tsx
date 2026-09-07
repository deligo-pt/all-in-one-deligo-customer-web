"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { splitLocale } from "@/lib/i18n/path";

/**
 * The row of navigation links, with the active one marked.
 *
 * Client, and only because of `usePathname` — the active link cannot be known
 * on the server for a layout that is shared across every route. It is the
 * smallest leaf that needs it: the header around it stays a Server Component.
 *
 * `aria-current="page"` carries the state that the pink underline shows. A
 * screen reader has no underline.
 */
export function NavLinks({
  links,
  className,
}: {
  links: ReadonlyArray<{ href: string; path: string; label: string }>;
  className?: string;
}) {
  const pathname = usePathname();
  const { rest } = splitLocale(pathname);

  return (
    <ul className={cn("flex items-center gap-6", className)}>
      {links.map((link) => {
        const active = link.path === "/" ? rest === "/" : rest.startsWith(link.path);
        return (
          <li key={link.path}>
            <Link
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "text-14 flex flex-col items-center gap-1 font-semibold transition-colors",
                active ? "text-brand" : "text-ink hover:text-brand",
              )}
            >
              {link.label}
              {/* 2px indicator, measured. Always rendered so the label never
                  shifts by two pixels when it becomes active. */}
              <span
                aria-hidden
                className={cn(
                  "rounded-10 h-0.5 w-full",
                  active ? "bg-brand" : "bg-transparent",
                )}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
