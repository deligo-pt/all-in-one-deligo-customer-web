"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import type { Locale } from "@/lib/i18n/locale";
import { accountApi } from "./api";
import type { AccountAddress, AddressInput, AddressType } from "./types";

export type AddressFormCopy = {
  addTitle: string;
  editTitle: string;
  close: string;
  type: string;
  typeLabel: Record<AddressType, string>;
  customType: string;
  street: string;
  detailedAddress: string;
  postalCode: string;
  city: string;
  state: string;
  country: string;
  notes: string;
  save: string;
  locate: string;
  locateFailed: string;
  notFound: string;
  actionFailed: string;
};

const TYPES: readonly AddressType[] = ["HOME", "OFFICE", "OTHER"];

/**
 * Adding or editing a delivery address. The API needs coordinates, so the
 * typed address is geocoded on save (Google's geocoder, loaded on first use,
 * the same one the hero's address bar uses). An address Google cannot place
 * is not saved, and the dialog says so. `CURRENT_LOCATION` is kept on an
 * address that already has it and never offered for a new one — it is what
 * the app sets from the device.
 */
export function AddressFormModal({
  open,
  onOpenChange,
  address,
  locale,
  onSaved,
  offlineNotice,
  copy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address?: AccountAddress;
  locale: Locale;
  onSaved: () => void;
  offlineNotice?: string;
  copy: AddressFormCopy;
}) {
  const [form, setForm] = useState<AddressInput>(() => ({
    type: address?.type ?? "HOME",
    customType: address?.customType ?? "",
    street: address?.street ?? "",
    detailedAddress: address?.detailedAddress ?? "",
    city: address?.city ?? "",
    state: address?.state ?? "",
    postalCode: address?.postalCode ?? "",
    country: address?.country ?? "",
    notes: address?.notes ?? "",
    latitude: address?.latitude ?? 0,
    longitude: address?.longitude ?? 0,
  }));
  // Coordinates from the device, kept while the street is the one they filled.
  const [located, setLocated] = useState<{
    latitude: number;
    longitude: number;
    street: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const set = (key: keyof AddressInput) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  async function save() {
    if (offlineNotice) return setNotice(offlineNotice);
    setBusy(true);
    setNotice(null);
    try {
      const query = [
        form.street,
        `${form.postalCode} ${form.city}`.trim(),
        form.country,
      ]
        .filter((part) => part.trim())
        .join(", ");
      const { geocodeAddress } = await import("@/services/maps/browser");
      const place =
        located && located.street === form.street
          ? located
          : await geocodeAddress(query, locale).catch(() => null);
      if (!place) {
        setNotice(copy.notFound);
        setBusy(false);
        return;
      }
      const input = { ...form, latitude: place.latitude, longitude: place.longitude };
      if (address) await accountApi.updateAddress(address.id, input);
      else await accountApi.addAddress(input);
      onSaved();
    } catch (error) {
      setNotice(
        error instanceof Error && error.message ? error.message : copy.actionFailed,
      );
      setBusy(false);
    }
  }

  const text = (
    key: keyof AddressInput,
    label: string,
    required = false,
    autoComplete?: string,
  ) => (
    <Field label={label} required={required}>
      {(ids) => (
        <Input
          {...ids}
          value={String(form[key])}
          autoComplete={autoComplete}
          disabled={busy}
          onChange={set(key)}
        />
      )}
    </Field>
  );

  /** The old app's current-location page: the device's position, named by
   *  the geocoder, becomes the street; its coordinates are saved as they are. */
  function locate() {
    if (offlineNotice) return setNotice(offlineNotice);
    if (!("geolocation" in navigator)) return setNotice(copy.locateFailed);
    setBusy(true);
    setNotice(null);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { reverseGeocode } = await import("@/services/maps/browser");
        const label =
          (await reverseGeocode(coords.latitude, coords.longitude, locale)) ?? "";
        const street = label.split(",")[0]?.trim() || label;
        setForm((current) => ({ ...current, street }));
        setLocated({ latitude: coords.latitude, longitude: coords.longitude, street });
        setBusy(false);
      },
      () => {
        setNotice(copy.locateFailed);
        setBusy(false);
      },
      { enableHighAccuracy: true, timeout: 15_000 },
    );
  }

  const types =
    address?.type === "CURRENT_LOCATION"
      ? [...TYPES, "CURRENT_LOCATION" as const]
      : TYPES;

  return (
    <Modal
      open={open}
      onOpenChange={(next) => !busy && onOpenChange(next)}
      title={address ? copy.editTitle : copy.addTitle}
      closeLabel={copy.close}
      className="w-[min(40rem,calc(100vw-2rem))]"
    >
      <div role="radiogroup" aria-label={copy.type} className="flex flex-wrap gap-2">
        {types.map((type) => (
          <label
            key={type}
            className={[
              "rounded-full text-14 relative cursor-pointer border px-4 py-2 font-semibold",
              form.type === type
                ? "border-brand bg-brand-tint text-brand"
                : "border-line text-ink",
            ].join(" ")}
          >
            <input
              type="radio"
              name="address-type"
              className="sr-only"
              checked={form.type === type}
              disabled={busy}
              onChange={() => setForm((current) => ({ ...current, type }))}
            />
            {copy.typeLabel[type]}
          </label>
        ))}
      </div>

      <Button variant="outline" className="self-start" disabled={busy} onClick={locate}>
        {copy.locate}
      </Button>

      <div className="grid gap-4 sm:grid-cols-2">
        {form.type === "OTHER" ? (
          <div className="sm:col-span-2">{text("customType", copy.customType)}</div>
        ) : null}
        <div className="sm:col-span-2">
          {text("street", copy.street, true, "address-line1")}
        </div>
        <div className="sm:col-span-2">
          {text("detailedAddress", copy.detailedAddress, false, "address-line2")}
        </div>
        {text("postalCode", copy.postalCode, false, "postal-code")}
        {text("city", copy.city, true, "address-level2")}
        {text("state", copy.state, false, "address-level1")}
        {text("country", copy.country, true, "country-name")}
        <div className="sm:col-span-2">{text("notes", copy.notes)}</div>
      </div>

      <p role="status" className="text-14 text-danger empty:hidden">
        {notice}
      </p>

      <Button
        block
        disabled={
          busy || !form.street.trim() || !form.city.trim() || !form.country.trim()
        }
        onClick={save}
      >
        {copy.save}
      </Button>
    </Modal>
  );
}
