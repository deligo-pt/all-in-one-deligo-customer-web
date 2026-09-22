import Link from "next/link";
import type { ReactNode } from "react";

export type AccountNavItem = { id: string; label: string; href: string };

/**
 * The frame every account sub-page sits in.
 *
 * The design draws one account screen — `Profile`, 1440×1798 — and its menu
 * points at pages that exist only as 412px mobile frames or not at all
 * (D-16). Rather than invent a layout per destination, they share this one:
 * the same heading, the same menu, the same card. One shell means the six
 * pages cannot drift apart, which is the failure a per-page design invites.
 */
export function AccountShell({
  title,
  subtitle,
  nav,
  activeId,
  navLabel,
  children,
}: {
  title: string;
  subtitle?: string;
  nav: readonly AccountNavItem[];
  activeId: string;
  navLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="max-w-shell mx-auto flex w-full flex-col gap-8 px-4 sm:px-8 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-32 text-ink font-semibold">{title}</h1>
        {subtitle ? <p className="text-16 text-ink-warm">{subtitle}</p> : null}
      </header>

      <div className="flex flex-col gap-8 lg:flex-row">
        <nav aria-label={navLabel} className="lg:w-72 lg:shrink-0">
          <ul className="flex flex-col gap-1">
            {nav.map((item) => {
              const active = item.id === activeId;
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "rounded-12 text-16 flex items-center px-4 py-3.5 transition-colors",
                      active
                        ? "bg-brand-tint text-brand font-medium"
                        : "text-ink hover:bg-surface-muted",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
