import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Eyebrow, heading, lead — the three-part opening every section of the landing
 * page uses.
 *
 * The eyebrow is a `<p>`, not a heading. It reads as a label above the title
 * and giving it a heading level would put "OUR SERVICES" and "Explore DeliGo
 * Services" at the same rank in the document outline, which is not what either
 * of them means.
 */
export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "start",
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  body?: ReactNode;
  align?: "start" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex max-w-2xl flex-col gap-4",
        align === "center" && "mx-auto items-center text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p className="text-14 text-brand tracking-wide font-semibold uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-32 text-ink tracking-tight lg:text-40 font-semibold">
        {title}
      </h2>
      {body ? <p className="text-20 text-ink-muted leading-relaxed">{body}</p> : null}
    </div>
  );
}
