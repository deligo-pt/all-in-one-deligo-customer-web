import { Icon } from "@/components/ui/Icon";

export type SearchFilterCopy = {
  legend: string;
  sort: string;
  sortOption: Record<string, string>;
  cuisine: string;
  anyCuisine: string;
  minPrice: string;
  maxPrice: string;
  halal: string;
  apply: string;
  clear: string;
};

export type SearchFilterValues = {
  term: string;
  sort: string;
  cuisine: string;
  minPrice: string;
  maxPrice: string;
  halal: boolean;
};

export type SearchCuisine = { id: string; name: string };

// The app has one focus ring, in globals.css; nothing here restyles it.
const FIELD =
  "text-16 text-ink bg-surface border-line rounded-12 h-12 w-full border px-3";

/**
 * The controls above the results — sort, cuisine, a price range and halal
 * (Phase 20c), each one a parameter `GET /search` actually honours (measured
 * 16 Sep 2026).
 *
 * **It is a plain GET form, and that is the point.** The filters belong in the
 * URL: a filtered search has to survive a reload, a share and the back button,
 * and the server applies them on the way in. A form does that with no client
 * JavaScript at all — no state to hold, nothing to hydrate, and the page keeps
 * its whole first load for results. The trade is that filters apply on
 * "Apply", not on every keystroke, which for a four-field form is honest
 * rather than clever.
 *
 * The design draws no search screen at all, so this is the app's own type
 * scale and the shared field styling, not a frame from Figma.
 */
export function SearchFilterBar({
  action,
  values,
  cuisines,
  clearHref,
  copy,
}: {
  /** The results route; the form submits to it with GET. */
  action: string;
  values: SearchFilterValues;
  cuisines: readonly SearchCuisine[];
  clearHref: string;
  copy: SearchFilterCopy;
}) {
  const filtered =
    values.cuisine || values.minPrice || values.maxPrice || values.halal
      ? true
      : values.sort !== "relevance";

  return (
    <form
      method="get"
      action={action}
      className="border-line bg-surface-subtle rounded-16 flex flex-wrap items-end gap-4 border p-4"
    >
      {/* The term travels with the filters; losing it on Apply would send the
          customer back to an empty search. */}
      <input type="hidden" name="q" value={values.term} />

      <fieldset className="contents">
        <legend className="sr-only">{copy.legend}</legend>

        <label className="flex min-w-44 flex-1 flex-col gap-1">
          <span className="text-14 text-ink-muted font-medium">{copy.sort}</span>
          <select name="sort" defaultValue={values.sort} className={FIELD}>
            {Object.entries(copy.sortOption).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-44 flex-1 flex-col gap-1">
          <span className="text-14 text-ink-muted font-medium">{copy.cuisine}</span>
          <select name="cuisine" defaultValue={values.cuisine} className={FIELD}>
            <option value="">{copy.anyCuisine}</option>
            {cuisines.map((cuisine) => (
              <option key={cuisine.id} value={cuisine.id}>
                {cuisine.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-28 flex-col gap-1">
          <span className="text-14 text-ink-muted font-medium">{copy.minPrice}</span>
          <input
            type="number"
            name="min"
            inputMode="decimal"
            min={0}
            step="0.01"
            defaultValue={values.minPrice}
            className={FIELD}
          />
        </label>

        <label className="flex min-w-28 flex-col gap-1">
          <span className="text-14 text-ink-muted font-medium">{copy.maxPrice}</span>
          <input
            type="number"
            name="max"
            inputMode="decimal"
            min={0}
            step="0.01"
            defaultValue={values.maxPrice}
            className={FIELD}
          />
        </label>

        <label className="text-16 text-ink flex h-12 items-center gap-2">
          <input
            type="checkbox"
            name="halal"
            value="1"
            defaultChecked={values.halal}
            className="accent-brand size-5"
          />
          {copy.halal}
        </label>
      </fieldset>

      <button
        type="submit"
        className="bg-brand text-ink-inverse hover:bg-brand-strong rounded-12 text-16 h-12 px-5 font-medium transition-colors"
      >
        {copy.apply}
      </button>

      {filtered ? (
        <a
          href={clearHref}
          className="text-16 text-brand rounded-8 inline-flex h-12 items-center gap-1 font-medium underline-offset-4 hover:underline"
        >
          <Icon name="close" className="size-4" />
          {copy.clear}
        </a>
      ) : null}
    </form>
  );
}
