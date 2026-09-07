import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * What a list shows when it has nothing in it.
 *
 * A separate component because "empty" and "still loading" and "failed" look
 * alike from a distance and mean different things to the person waiting. This
 * one is only for the case where the request succeeded and the answer is none.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 px-6 py-16 text-center",
        className,
      )}
    >
      {icon ? <span className="text-ink-subtle">{icon}</span> : null}
      <p className="text-16 text-ink font-semibold">{title}</p>
      {description ? (
        <p className="text-14 text-ink-muted max-w-sm">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
