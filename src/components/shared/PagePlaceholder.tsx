import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { getTranslations } from "@/i18n/server";
import { ROUTES, type RouteName } from "@/lib/routes";

/**
 * What a planned page renders until the phase that builds it arrives.
 *
 * Phase 4's job is that **every route in the map resolves** — the header and
 * the footer link to most of the application, and a link whose target does not
 * exist is a 404 nobody finds until a customer does. So the route tree is built
 * whole and filled in over the phases that follow.
 *
 * The path and the phase number are shown because they are the two things
 * anyone looking at this page wants to know: where they are, and whether this
 * is unfinished work or a mistake. Neither is prose, which is why neither is
 * translated.
 */
export async function PagePlaceholder({ route }: { route: RouteName }) {
  const t = await getTranslations("common");
  const { path, phase } = ROUTES[route];

  return (
    <EmptyState
      icon={<Icon name="alert" className="size-8" />}
      title={t("comingSoon")}
      description={
        <span className="text-ink-subtle font-mono">
          {path}
          {` · `}
          {`Phase ${phase}`}
        </span>
      }
    />
  );
}
