import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { getLocale, getTranslations } from "@/i18n/server";
import { unbuiltVerticalsVisible } from "@/lib/flags";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES, type RouteName } from "@/lib/routes";
import type { MessageKey } from "@/i18n/namespaces";
import { HeaderCounts } from "./HeaderCounts";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { SignInButton } from "./SignInButton";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { NavLinks } from "./NavLinks";
import { SearchBox } from "./SearchBox";

/**
 * The header, measured: 110px tall, white, a 1px `line` rule underneath, its
 * contents on a 1312px container.
 *
 * The design draws **two** headers, not one. On the pages a visitor arrives at
 * — landing, services, about, partner, DeliGo Plus — the links are the
 * marketing ones. Everywhere else they are the six verticals. Same height, same
 * logo, same right-hand actions; only the middle changes, which is why this is
 * one component with a `variant` rather than two components that will drift.
 *
 * A Server Component. The two things that genuinely need the browser — the
 * active-link underline and the search field — are client leaves inside it, so
 * the header itself costs the bundle nothing.
 *
 * ## It sheds items as it narrows, and never overflows (Phase 20 responsive)
 *
 * Measured: the full bar needs ~1,380px and its containers are 1,120 and
 * 1,312px, so it ran past its own container at every width and past the screen
 * from 768 to 1,366px — the horizontal scrollbar on ordinary laptops. There is
 * no tablet or phone design (every Figma frame is 1440px), so the order things
 * leave in is a decision, and each one goes into the menu drawer as it leaves:
 *
 * | from     | shown in the bar                                        |
 * |----------|---------------------------------------------------------|
 * | always   | logo · bell · cart (+ menu button below `xl`)           |
 * | `sm`     | + sign-in / account                                     |
 * | `md`     | + language, as a compact "PT" / "EN"                    |
 * | `lg`     | + search field                                          |
 * | `xl`     | + the link row (the menu button goes)                   |
 * | `2xl`    | + Download App                                          |
 *
 * `verify:responsive` loads both variants at every width from 320 to 1920px and
 * fails if the bar is wider than its container or the page than the screen.
 */
/**
 * A link is a route AND a label, and the type says so: a name that is not both
 * a `RouteName` and a key of the `nav` dictionary does not compile. That is the
 * check that would otherwise be "remember to add the translation", which is the
 * kind of check that holds until the fourth link.
 */
type NavRouteName = RouteName & MessageKey<"nav">;

const MARKETING_LINKS = [
  "home",
  "services",
  "about",
  "partner",
  "plus",
] as const satisfies readonly NavRouteName[];

const VERTICAL_LINKS = [
  "food",
  "groceries",
  "ride",
  "hotel",
  "parcel",
  "electronics",
] as const satisfies readonly NavRouteName[];

export async function SiteHeader({
  variant,
}: {
  variant: "marketing" | "app" | "auth";
}) {
  const [t, common, locale] = await Promise.all([
    getTranslations("nav"),
    getTranslations("common"),
    getLocale(),
  ]);
  const showUnbuilt = unbuiltVerticalsVisible();

  const names: readonly NavRouteName[] =
    variant === "marketing" ? MARKETING_LINKS : VERTICAL_LINKS;
  const links = names
    // D-6: a vertical with no backend is reachable by URL and absent from the
    // menu, so nobody is invited into a page that cannot answer.
    .filter((name) => showUnbuilt || !("flagged" in ROUTES[name]))
    .map((name) => ({
      path: ROUTES[name].path,
      href: withLocale(ROUTES[name].path, locale),
      label: t(name),
    }));

  /**
   * The sign-in bar. Everything that competes with the task is gone — the six
   * verticals, the search field, the cart, the notification bell and the two
   * calls to action — and the two things that do not compete stay: the way
   * home, and the language. A customer who cannot read the form needs the
   * second one before they need anything else on this page.
   */
  if (variant === "auth") {
    return (
      <header className="bg-surface border-line border-b">
        <a
          href="#main"
          className="bg-brand text-ink-inverse text-14 sr-only rounded-8 focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:px-4 focus:py-2"
        >
          {t("skipToContent")}
        </a>
        <div className="max-w-narrow mx-auto flex h-20 items-center gap-4 px-4 sm:gap-8 sm:px-8">
          <Logo locale={locale} label={common("appName")} />
          <div className="ms-auto">
            <LocaleSwitcher />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-surface border-line sticky top-0 z-30 border-b">
      {/* The first thing in the tab order on every page, and invisible until it
          has focus. Without it a keyboard user tabs through the whole header —
          six links, a search field, four buttons — on every navigation. */}
      <a
        href="#main"
        className="bg-brand text-ink-inverse text-14 sr-only rounded-8 focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:px-4 focus:py-2"
      >
        {t("skipToContent")}
      </a>

      {/* 110px from `lg`, and the container width differs by variant: the
          design lays the marketing bar out on 1120px and the app bar on 1312px.
          Shorter and tighter below that, where there is no design and a 110px
          bar would take a sixth of a phone's height. */}
      <div
        className={cn(
          "mx-auto flex h-16 items-center gap-3 px-4 sm:h-20 sm:gap-4 sm:px-6 lg:h-[6.875rem] lg:gap-6 lg:px-8",
          variant === "marketing" ? "max-w-narrow" : "max-w-shell",
        )}
      >
        <Logo locale={locale} label={common("appName")} />

        <nav aria-label={t("mainNavigation")} className="hidden xl:block">
          <NavLinks links={links} className="gap-4" />
        </nav>

        <div className="ms-auto flex min-w-0 items-center gap-2 lg:gap-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <SearchBox
              locale={locale}
              label={t("search")}
              placeholder={t("searchPlaceholder")}
              className="hidden lg:block lg:w-40"
            />
            <HeaderCounts
              notificationsHref={withLocale(ROUTES.notifications.path, locale)}
              cartHref={withLocale(ROUTES.cart.path, locale)}
              notificationsLabel={t("notifications")}
              cartLabel={t("cart")}
            />
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            {/* The language, where the old navbar had it — not only in the
                footer. Switching is a navigation to the same page. Compact
                ("PT") here; the drawer has the full name. */}
            <LocaleSwitcher compact className="hidden md:inline-flex" />
            {/* The design labels this "Login" on the marketing pages and
                "Account" everywhere else — the same control, named for what the
                visitor is there to do. Both open the sign-in drawer, because
                until there is a session there is no account to show; Phase 15
                is what makes the signed-in case different. */}
            <SignInButton
              href={withLocale(ROUTES.login.path, locale)}
              accountHref={withLocale(ROUTES.account.path, locale)}
              accountLabel={t("account")}
              label={variant === "marketing" ? t("login") : t("account")}
              title={t("login")}
              description={common("tagline")}
              closeLabel={common("close")}
              appName={common("appName")}
            />
            <Button asChild className="hidden 2xl:inline-flex">
              <Link href={withLocale(ROUTES.plus.path, locale)}>
                {t("downloadApp")}
              </Link>
            </Button>
          </div>

          {/* Everything the bar sheds on the way down, so a narrow screen loses
              the room these took and nothing else. */}
          <MobileNav
            links={links}
            openLabel={t("openMenu")}
            title={t("menu")}
            closeLabel={common("close")}
          >
            <SearchBox
              locale={locale}
              label={t("search")}
              placeholder={t("searchPlaceholder")}
              className="w-full"
            />
            <SignInButton
              href={withLocale(ROUTES.login.path, locale)}
              accountHref={withLocale(ROUTES.account.path, locale)}
              accountLabel={t("account")}
              label={variant === "marketing" ? t("login") : t("account")}
              title={t("login")}
              description={common("tagline")}
              closeLabel={common("close")}
              appName={common("appName")}
            />
            <LocaleSwitcher />
            <Button asChild>
              <Link href={withLocale(ROUTES.plus.path, locale)}>
                {t("downloadApp")}
              </Link>
            </Button>
          </MobileNav>
        </div>
      </div>
    </header>
  );
}
