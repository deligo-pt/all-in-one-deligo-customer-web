import { formatCurrency } from "@/lib/i18n/format";
import type { Locale } from "@/lib/i18n/locale";
import type { OptionGroup } from "./types";

type RawAddonGroup = {
  _id?: string;
  title?: string;
  minSelectable?: number;
  maxSelectable?: number;
  isActive?: boolean;
  options?: { name?: string; sku?: string; price?: number; isActive?: boolean }[];
};

/**
 * A dish's add-on groups, `/add-ons/:id` each — loaded when the dish is
 * opened, and only with a session: the endpoint answers 401 without one
 * (measured). A group that fails to load is left out rather than failing the
 * dish; the backend re-checks every group when the line is added (Phase 17).
 */
export async function loadAddonGroups(
  ids: readonly string[],
  locale: Locale,
): Promise<OptionGroup[]> {
  const { browserApi } = await import("@/services/session/browser");
  const api = browserApi();
  const settled = await Promise.allSettled(
    ids.map((id) => api.get(`/add-ons/${encodeURIComponent(id)}`)),
  );
  return settled.flatMap((result) => {
    if (result.status !== "fulfilled") return [];
    const group = result.value.data?.data as RawAddonGroup | undefined;
    if (!group?._id || group.isActive === false) return [];
    return [
      {
        id: group._id,
        kind: "addon" as const,
        name: group.title ?? "",
        minSelectable: group.minSelectable ?? 0,
        maxSelectable: group.maxSelectable ?? 1,
        choices: (group.options ?? [])
          .filter((option) => option.isActive !== false && option.sku)
          .map((option) => ({
            id: option.sku!,
            name: option.name ?? "",
            priceDelta:
              typeof option.price === "number"
                ? `+${formatCurrency(option.price, locale, "EUR")}`
                : undefined,
          })),
      },
    ];
  });
}
