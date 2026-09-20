"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { SignOutButton } from "@/components/shared/SignOutButton";
import { ImageSlot } from "@/components/shared/ImageSlot";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { accountApi } from "./api";
import { AccountShell, type AccountNavItem } from "@/components/layout/AccountShell";
import type { ContactCopy } from "./ContactModal";
import type { ProfileEditCopy } from "./ProfileEditModal";
import type { Profile } from "./types";

const ProfileEditModal = dynamic(
  () => import("./ProfileEditModal").then((m) => m.ProfileEditModal),
  { ssr: false },
);
const ContactModal = dynamic(
  () => import("./ContactModal").then((m) => m.ContactModal),
  {
    ssr: false,
  },
);

/** Accepted profile photos: the old app's types and its 5 MB ceiling. */
const PHOTO_TYPES = "image/jpeg,image/png,image/webp";
const PHOTO_MAX_BYTES = 5 * 1024 * 1024;

export type Preference = {
  id: string;
  label: string;
  value?: string;
  href?: string;
  /** A one-line description under the label (the old "Orders & Payments" rows). */
  description?: string;
  /** The row is the language switch itself. */
  control?: "language";
};

/** A number tile linking to its page — vouchers available, reward points. */
export type ProfileStat = { id: string; label: string; value: string; href: string };

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
  nif: string;
  changeContact: string;
  preferences: string;
  ordersAndPayments: string;
  memberSince: string;
  accountId: string;
  logout: string;
  version: string;
  photoTooLarge: string;
  actionFailed: string;
  editDialog: ProfileEditCopy;
  contactDialog: ContactCopy;
};

/**
 * `/account` — 1440×1798, the one account screen the design draws.
 *
 * Measured: a header card with a 160px round avatar, `EDIT PROFILE` and
 * `CHANGE IMAGE` beneath it; `Personal Information` with an `EDIT` link and the
 * fields; the right column's `SETTINGS & PREFERENCES` rows, then member since,
 * account id, logout and the version.
 *
 * Every value is the API's (`/profile`). Editing the name or NIF, changing the
 * photo (`/uploads`, then the profile) and changing the email or phone (a code
 * sent to the new one) all re-read the page afterwards. The design's Emergency
 * Contact section is not drawn: the API has no such field.
 */
export function ProfileView({
  profile,
  preferences,
  shortcuts,
  stats,
  nav,
  homeHref,
  copy,
  offlineNotice,
}: {
  profile: Profile;
  preferences: readonly Preference[];
  /** Orders, payment methods, referrals — each with its description. */
  shortcuts: readonly Preference[];
  stats: readonly ProfileStat[];
  nav: readonly AccountNavItem[];
  homeHref: string;
  copy: ProfileCopy;
  offlineNotice?: string;
}) {
  const router = useRouter();
  const photoInput = useRef<HTMLInputElement>(null);
  const [dialog, setDialog] = useState<"edit" | "contact" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function changePhoto(file: File | undefined) {
    if (!file) return;
    if (offlineNotice) return setNotice(offlineNotice);
    if (file.size > PHOTO_MAX_BYTES) return setNotice(copy.photoTooLarge);
    setBusy(true);
    setNotice(null);
    try {
      const url = await accountApi.upload(file);
      await accountApi.updateProfile(profile.accountId, { photo: url });
    } catch (error) {
      setNotice(
        error instanceof Error && error.message ? error.message : copy.actionFailed,
      );
    } finally {
      router.refresh();
      setBusy(false);
    }
  }

  // A label never breaks mid-word; a long email wraps at any character
  // rather than forcing the card wider.
  const field = (label: string, value: string | undefined, anywhere = false) => (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="text-12 text-ink-warm font-semibold tracking-wide uppercase">
        {label}
      </dt>
      <dd
        className={`text-16 text-ink-strong ${anywhere ? "break-all" : "break-words"}`}
      >
        {value || "—"}
      </dd>
    </div>
  );

  const list = (title: string, items: readonly Preference[]) => (
    <section className="border-line rounded-16 bg-surface flex flex-col border">
      <h2 className="text-16 text-ink-muted px-4 pt-4 pb-2">{title}</h2>
      <ul>
        {items.map((item) => {
          const text = (
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-16 text-ink">{item.label}</span>
              {item.description ? (
                <span className="text-14 text-ink-muted">{item.description}</span>
              ) : null}
            </span>
          );
          return (
            <li key={item.id}>
              {item.control === "language" ? (
                <div className="flex items-center justify-between gap-4 px-4 py-4">
                  {text}
                  <LocaleSwitcher />
                </div>
              ) : item.href ? (
                <Link
                  className="rounded-12 hover:bg-surface-muted flex items-center justify-between gap-4 px-4 py-4 transition-colors"
                  href={item.href}
                >
                  {text}
                  {item.value ? (
                    <span className="text-16 text-ink-muted">{item.value}</span>
                  ) : (
                    <Icon
                      name="chevron-right"
                      className="text-ink-muted size-5 shrink-0"
                    />
                  )}
                </Link>
              ) : (
                <div className="flex items-center justify-between gap-4 px-4 py-4">
                  {text}
                  {item.value ? (
                    <span className="text-16 text-ink-muted">{item.value}</span>
                  ) : null}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );

  return (
    <AccountShell
      title={copy.title}
      subtitle={copy.subtitle}
      nav={nav}
      activeId="account"
      navLabel={copy.navLabel}
    >
      <div className="flex flex-col gap-8">
        <section className="border-line rounded-16 bg-surface-subtle flex flex-col gap-8 border p-6 sm:p-8 md:flex-row">
          <div className="flex shrink-0 flex-col items-center gap-4 md:w-40">
            <ImageSlot
              src={profile.photo}
              alt={copy.avatarAlt}
              sizes="160px"
              className="border-line size-40 rounded-full border"
            />
            <Button
              shape="pill"
              className="bg-brand-strong text-12 h-9 w-full font-semibold"
              disabled={busy}
              onClick={() => setDialog("edit")}
            >
              {copy.editProfile}
            </Button>
            <Button
              variant="link"
              className="text-12 text-ink-warm font-semibold"
              disabled={busy}
              onClick={() => photoInput.current?.click()}
            >
              {copy.changeImage}
            </Button>
            <input
              ref={photoInput}
              type="file"
              accept={PHOTO_TYPES}
              className="sr-only"
              tabIndex={-1}
              aria-hidden
              onChange={(event) => {
                void changePhoto(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <div className="border-line flex flex-wrap items-center justify-between gap-4 border-b pb-3">
              <h2 className="text-20 text-ink-strong font-semibold">
                {copy.personalInformation}
              </h2>
              <Button
                variant="link"
                className="text-14 text-brand-strong font-semibold"
                disabled={busy}
                onClick={() => setDialog("edit")}
              >
                {copy.edit}
              </Button>
            </div>

            <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {field(copy.fullName, profile.fullName)}
              {field(copy.nif, profile.nif)}
              {field(copy.phone, profile.phone)}
              {field(copy.email, profile.email, true)}
            </dl>

            <Button
              variant="link"
              className="text-14 self-start font-semibold"
              disabled={busy}
              onClick={() => setDialog("contact")}
            >
              {copy.changeContact}
            </Button>

            <p role="status" className="text-14 text-danger empty:hidden">
              {dialog ? null : notice}
            </p>
          </div>
        </section>

        {stats.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {stats.map((stat) => (
              <Link
                key={stat.id}
                href={stat.href}
                className="border-line rounded-16 bg-surface hover:bg-surface-muted flex items-center justify-between gap-4 border p-5 transition-colors"
              >
                <span className="text-16 text-ink-muted">{stat.label}</span>
                <span className="text-24 text-brand font-semibold">{stat.value}</span>
              </Link>
            ))}
          </div>
        ) : null}

        <div className="grid items-start gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-8">
            {list(copy.ordersAndPayments, shortcuts)}
            <section className="border-line rounded-16 bg-surface flex flex-col gap-2 border p-6">
              {profile.memberSince ? (
                <p className="text-16 text-ink-strong">
                  {`${copy.memberSince} ${profile.memberSince}`}
                </p>
              ) : null}
              <p className="text-16 text-ink-warm">{`${copy.accountId} ${profile.accountId}`}</p>
              <SignOutButton
                label={copy.logout}
                homeHref={homeHref}
                className="text-16 text-danger mt-2 self-start"
              />
              <p className="text-10 text-ink-warm mt-2">{copy.version}</p>
            </section>
          </div>
          {list(copy.preferences, preferences)}
        </div>
      </div>

      {dialog === "edit" ? (
        <ProfileEditModal
          open
          onOpenChange={(next) => !next && setDialog(null)}
          profile={profile}
          offlineNotice={offlineNotice}
          onSaved={() => {
            setDialog(null);
            router.refresh();
          }}
          copy={copy.editDialog}
        />
      ) : null}

      {dialog === "contact" ? (
        <ContactModal
          open
          onOpenChange={(next) => !next && setDialog(null)}
          offlineNotice={offlineNotice}
          onSaved={() => {
            setDialog(null);
            router.refresh();
          }}
          copy={copy.contactDialog}
        />
      ) : null}
    </AccountShell>
  );
}
