import { cn } from "@/lib/cn";
import { ICONS, type IconName } from "@/lib/icons";

export type { IconName };

/**
 * One icon, from the registry in `@/lib/icons`.
 *
 * Most entries are the exact icons the design names in its layers — the file
 * was drawn with Iconify sets and says which ones. The rest are eight shapes
 * the design never specified (a tick, a chevron, a plus) and are drawn by hand.
 *
 * `aria-hidden` by default: an icon inside a labelled control is decoration,
 * and announcing it twice is worse than not announcing it at all. Pass `title`
 * when the icon *is* the control's only content — that makes it an `img` with
 * an accessible name.
 *
 * The body is injected as markup because icon sets are not all single paths —
 * some are groups, some carry their own fill rules. The registry is static,
 * committed content and nothing can add to it at runtime; see the note there.
 */
export function Icon({
  name,
  title,
  className,
}: {
  name: IconName;
  /** Give the icon an accessible name. Only when it is the whole control. */
  title?: string;
  className?: string;
}) {
  const icon = ICONS[name];

  return (
    <svg
      viewBox={icon.viewBox}
      className={cn("size-5 shrink-0", className)}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      focusable="false"
      {...(title ? { "aria-label": title } : {})}
      dangerouslySetInnerHTML={{ __html: icon.body }}
    />
  );
}
