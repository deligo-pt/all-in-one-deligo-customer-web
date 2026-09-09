import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ImageSlot } from "@/components/shared/ImageSlot";
import { AccountShell, type AccountNavItem } from "./AccountShell";
import type { Preference, Profile } from "./types";

export type ProfileCopy = {
  title: string;
  subtitle: string;
  navLabel: string;
  editProfile: string;
  changeImage: string;
  avatarAlt: string;
  personalInformation: string;
  edit: string;
  fullName: string;
  phone: string;
  email: string;
  emergencyContact: string;
  emergencyContactBody: string;
  contactName: string;
  preferences: string;
  memberSince: string;
  accountId: string;
  logout: string;
  version: string;
};

/**
 * `/account` — 1440×1798, the one account screen the design draws.
 *
 * Measured: a 752×426 header card at 16px radius over a gradient, a 160px
 * round avatar with `EDIT PROFILE` (a `brand-strong` pill at 12/600) and
 * `CHANGE IMAGE` beneath it; `Personal Information` at 20/600 with an `EDIT`
 * link, three fields whose labels are 12/600 `ink-warm` above 16/500 values;
 * then `Emergency Contact` with its own note. The right column is 525 wide:
 * `SETTINGS & PREFERENCES` over 56px rows at 12px radius, then the account
 * footer — member since, account id, logout in `danger`, and the version.
 *
 * Field labels are uppercase in the design and are written that way in CSS,
 * not in the dictionary. A translator should never have to know that
 * "TELEMÓVEL" is shouted; `text-transform` is presentation.
 */
export function ProfileView({
  profile,
  preferences,
  nav,
  editHref,
  copy,
}: {
  profile: Profile;
  preferences: readonly Preference[];
  nav: readonly AccountNavItem[];
  editHref: string;
  copy: ProfileCopy;
}) {
  const field = (label: string, value: string) => (
    <div className="flex flex-col gap-1">
      <p className="text-12 text-ink-warm font-semibold tracking-wide uppercase">
        {label}
      </p>
      <p className="text-16 text-ink-strong">{value}</p>
    </div>
  );

  return (
    <AccountShell
      title={copy.title}
      subtitle={copy.subtitle}
      nav={nav}
      activeId="account"
      navLabel={copy.navLabel}
    >
      <div className="flex flex-col gap-8 xl:flex-row">
        <section className="border-line rounded-16 bg-surface-subtle flex min-w-0 flex-1 flex-col gap-8 border p-8 sm:flex-row">
          <div className="flex w-40 shrink-0 flex-col gap-4">
            <ImageSlot
              src={profile.photo}
              alt={copy.avatarAlt}
              sizes="160px"
              className="border-line size-40 rounded-full border"
            />
            <Button asChild shape="pill" className="bg-brand-strong text-12 h-9 font-semibold">
              <a href={editHref}>{copy.editProfile}</a>
            </Button>
            <Button variant="link" className="text-12 text-ink-warm font-semibold">
              {copy.changeImage}
            </Button>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <div className="border-line flex items-center justify-between gap-4 border-b pb-3">
              <h2 className="text-20 text-ink-strong font-semibold">
                {copy.personalInformation}
              </h2>
              <Button asChild variant="link" className="text-12 text-brand-strong font-semibold">
                <a href={editHref}>{copy.edit}</a>
              </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {field(copy.fullName, profile.fullName)}
              {field(copy.phone, profile.phone)}
              <div className="sm:col-span-2">{field(copy.email, profile.email)}</div>
            </div>

            {profile.emergencyContact ? (
              <div className="border-line flex flex-col gap-4 border-t pt-4">
                <div className="flex flex-col gap-1">
                  <h3 className="text-20 text-ink-strong font-semibold">
                    {copy.emergencyContact}
                  </h3>
                  <p className="text-14 text-ink-warm">{copy.emergencyContactBody}</p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  {field(copy.contactName, profile.emergencyContact.name)}
                  {field(copy.phone, profile.emergencyContact.phone)}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <aside className="flex flex-col gap-8 xl:w-[33rem] xl:shrink-0">
          <section className="border-line rounded-16 bg-surface flex flex-col border">
            <h2 className="text-16 text-ink-muted px-4 pt-4 pb-2">{copy.preferences}</h2>
            <ul>
              {preferences.map((item) => (
                <li key={item.id}>
                  <Link
                    className="rounded-12 hover:bg-surface-muted flex items-center justify-between gap-4 px-4 py-4 transition-colors"
                    href={item.href ?? "#"}
                  >
                    <span className="text-16 text-ink">{item.label}</span>
                    {item.value ? (
                      <span className="text-16 text-ink-muted">{item.value}</span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <div className="flex flex-col gap-2">
            {profile.memberSince ? (
              <p className="text-16 text-ink-strong">
                {`${copy.memberSince} ${profile.memberSince}`}
              </p>
            ) : null}
            <p className="text-16 text-ink-warm">
              {`${copy.accountId} ${profile.accountId}`}
            </p>
            <Button variant="link" className="text-16 text-danger self-start">
              {copy.logout}
            </Button>
            <p className="text-10 text-ink-warm">{copy.version}</p>
          </div>
        </aside>
      </div>
    </AccountShell>
  );
}
