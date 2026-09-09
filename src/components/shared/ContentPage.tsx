import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";

/**
 * The shell every prose page shares: help, FAQs, terms, privacy, about.
 *
 * **These twelve pages have no design and no copy**, and neither is ours to
 * invent (D-16). Terms and a privacy policy are legal documents; an "About
 * DeliGo" written by a frontend is a claim about a company. So the shell is
 * real — the container, the measure, the heading scale, the place a document
 * goes — and the body says plainly that the content is pending rather than
 * filling the space with something that reads finished.
 *
 * `PagePlaceholder` says "this page is not built". This says "this page is
 * built and is waiting for its words", which is a different sentence and the
 * true one.
 */
export function ContentPage({
  title,
  lede,
  pendingTitle,
  pendingBody,
  children,
}: {
  title: string;
  lede?: string;
  pendingTitle: string;
  pendingBody: string;
  /** The document, when there is one. */
  children?: ReactNode;
}) {
  return (
    <article className="max-w-narrow mx-auto flex w-full flex-col gap-8 px-8 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="text-40 text-ink font-semibold">{title}</h1>
        {lede ? <p className="text-18 text-ink-warm">{lede}</p> : null}
      </header>

      {children ?? (
        <EmptyState
          icon={<Icon name="alert" className="size-8" />}
          title={pendingTitle}
          description={pendingBody}
        />
      )}
    </article>
  );
}
