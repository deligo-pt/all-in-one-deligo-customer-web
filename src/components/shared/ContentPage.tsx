import Link from "next/link";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";

export type ContentSection = {
  heading?: string;
  paragraphs?: readonly string[];
  items?: readonly string[];
  cards?: readonly { title: string; body?: string; items?: readonly string[] }[];
  faqs?: readonly { question: string; answer: string }[];
  links?: readonly { label: string; description?: string; href: string }[];
  /** Paragraphs after the list or cards. */
  after?: readonly string[];
};

export type ContentDocument = {
  title: string;
  lede?: string;
  sections: readonly ContentSection[];
};

/**
 * The shell every prose page shares: help, FAQs, terms, privacy, about.
 *
 * With a `document` it renders the owner's copy (Phase 20: carried over from
 * the old app, see `services/content/server.ts`) — headings, paragraphs,
 * lists, cards, questions as native `<details>` (no script), and links. Without
 * one it says the content is pending rather than filling the space with text
 * nobody approved (D-16).
 */
export function ContentPage({
  title,
  lede,
  document,
  pendingTitle,
  pendingBody,
  children,
}: {
  title: string;
  lede?: string;
  document?: ContentDocument;
  pendingTitle: string;
  pendingBody: string;
  children?: ReactNode;
}) {
  const external = (href: string) => /^(https?:|mailto:|tel:)/.test(href);

  return (
    <article className="max-w-narrow mx-auto flex w-full flex-col gap-10 px-8 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="text-40 text-ink font-semibold">{document?.title ?? title}</h1>
        {(document?.lede ?? lede) ? (
          <p className="text-18 text-ink-warm">{document?.lede ?? lede}</p>
        ) : null}
      </header>

      {document
        ? document.sections.map((section, index) => (
            <section key={index} className="flex flex-col gap-4">
              {section.heading ? (
                <h2 className="text-24 text-ink-strong font-semibold">
                  {section.heading}
                </h2>
              ) : null}
              {section.paragraphs?.map((text, i) => (
                <p key={i} className="text-16 text-ink-warm leading-relaxed">
                  {text}
                </p>
              ))}
              {section.items?.length ? (
                <ul className="text-16 text-ink-warm flex list-disc flex-col gap-2 ps-6">
                  {section.items.map((text, i) => (
                    <li key={i}>{text}</li>
                  ))}
                </ul>
              ) : null}
              {section.cards?.length ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {section.cards.map((card, i) => (
                    <div
                      key={i}
                      className="border-line rounded-16 bg-surface flex flex-col gap-2 border p-5"
                    >
                      <h3 className="text-18 text-ink-strong font-semibold">
                        {card.title}
                      </h3>
                      {card.body ? (
                        <p className="text-14 text-ink-warm">{card.body}</p>
                      ) : null}
                      {card.items?.map((text, j) => (
                        <p key={j} className="text-14 text-ink-warm">
                          {text}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              ) : null}
              {section.faqs?.length ? (
                <div className="flex flex-col gap-3">
                  {section.faqs.map((faq, i) => (
                    <details
                      key={i}
                      className="border-line rounded-12 bg-surface group border px-5 py-4"
                    >
                      <summary className="text-16 text-ink-strong cursor-pointer font-medium">
                        {faq.question}
                      </summary>
                      <p className="text-16 text-ink-warm mt-3 leading-relaxed">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              ) : null}
              {section.links?.length ? (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {section.links.map((link, i) => {
                    const inner = (
                      <>
                        <span className="text-16 text-brand font-semibold">
                          {link.label}
                        </span>
                        {link.description ? (
                          <span className="text-14 text-ink-muted">
                            {link.description}
                          </span>
                        ) : null}
                      </>
                    );
                    const className =
                      "border-line rounded-12 hover:bg-surface-muted flex flex-col gap-1 border px-5 py-4 transition-colors";
                    return (
                      <li key={i}>
                        {external(link.href) ? (
                          <a href={link.href} className={className}>
                            {inner}
                          </a>
                        ) : (
                          <Link href={link.href} className={className}>
                            {inner}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : null}
              {section.after?.map((text, i) => (
                <p key={i} className="text-16 text-ink-warm leading-relaxed">
                  {text}
                </p>
              ))}
            </section>
          ))
        : (children ?? (
            <EmptyState
              icon={<Icon name="alert" className="size-8" />}
              title={pendingTitle}
              description={pendingBody}
            />
          ))}
    </article>
  );
}
