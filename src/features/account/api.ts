import type { AccountTransport, AddressInput } from "./types";

/**
 * The account's writes, through the one API client (Phase 20). The session
 * module — and axios with it — loads on the first press.
 *
 * Measured on the owner's account with permission (15 Sep 2026):
 * - `PATCH /customers/:userId` takes `name`, `profilePhoto`, `NIF`, `address`
 *   and nothing else (email and phone are refused here: they change by OTP);
 *   re-saving the owner's own name answered "Profile updated successfully";
 * - `POST /customers/add-delivery-address` **makes the new address active**;
 *   update and delete answered as documented, and the owner's address was put
 *   back as active afterwards;
 * - `addressType` is one of HOME, OFFICE, OTHER, CURRENT_LOCATION;
 * - a removed card that is not the customer's answers `SAVED_CARD_NOT_FOUND`;
 * - `POST /support/send-message` joined the owner's open ticket.
 */
const session = () => import("@/services/session/browser");

const addressBody = (input: AddressInput) => ({
  deliveryAddress: {
    street: input.street.trim(),
    city: input.city.trim(),
    state: input.state.trim(),
    country: input.country.trim(),
    postalCode: input.postalCode.trim(),
    latitude: input.latitude,
    longitude: input.longitude,
    addressType: input.type,
    customAddressType: input.type === "OTHER" ? input.customType.trim() : "",
    detailedAddress: input.detailedAddress.trim(),
    notes: input.notes.trim(),
  },
});

export const accountApi: AccountTransport = {
  async updateProfile(accountId, { firstName, lastName, nif, photo }) {
    const { browserApi } = await session();
    await browserApi().patch(`/customers/${encodeURIComponent(accountId)}`, {
      ...(firstName !== undefined || lastName !== undefined
        ? {
            name: {
              ...(firstName !== undefined ? { firstName: firstName.trim() } : {}),
              ...(lastName !== undefined ? { lastName: lastName.trim() } : {}),
            },
          }
        : {}),
      ...(nif !== undefined ? { NIF: nif.trim() } : {}),
      ...(photo !== undefined ? { profilePhoto: photo } : {}),
    });
  },
  async upload(file) {
    const { browserApi } = await session();
    const body = new FormData();
    body.append("files", file);
    const { data } = await browserApi().post("/uploads", body, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const url: unknown = data?.data?.[0];
    if (typeof url !== "string" || !url) throw new Error();
    return url;
  },
  async sendContactCode(input) {
    const { browserApi } = await session();
    await browserApi().patch("/profile/send-otp", input);
  },
  async confirmContact(otp, type) {
    const { browserApi } = await session();
    await browserApi().patch("/profile/update-email-or-contact-number", { otp, type });
  },
  async addAddress(input) {
    const { browserApi } = await session();
    await browserApi().post("/customers/add-delivery-address", addressBody(input));
  },
  async updateAddress(addressId, input) {
    const { browserApi } = await session();
    await browserApi().patch(
      `/customers/update-delivery-address/${encodeURIComponent(addressId)}`,
      addressBody(input),
    );
  },
  async removeAddress(addressId) {
    const { browserApi } = await session();
    await browserApi().delete(
      `/customers/delete-delivery-address/${encodeURIComponent(addressId)}`,
    );
  },
  async activateAddress(addressId) {
    const { browserApi } = await session();
    await browserApi().patch(
      `/customers/toggle-delivery-address-status/${encodeURIComponent(addressId)}`,
    );
  },
  async removeCard(cardId) {
    const { browserApi } = await session();
    try {
      await browserApi().patch(`/payment-tokens/${encodeURIComponent(cardId)}/disable`);
    } catch (error) {
      // Already removed is removed (the old app's rule).
      if ((error as { errorKey?: string }).errorKey !== "SAVED_CARD_ALREADY_DISABLED")
        throw error;
    }
  },
  async sendSupport(message, orderRecordId) {
    const { browserApi } = await session();
    await browserApi().post("/support/send-message", {
      message: message.trim(),
      category: orderRecordId ? "ORDER_ISSUE" : "GENERAL",
      messageType: "TEXT",
      ...(orderRecordId ? { referenceOrderId: orderRecordId } : {}),
    });
  },
  async markSupportRead(ticketId) {
    const { browserApi } = await session();
    await browserApi().patch(`/support/tickets/${encodeURIComponent(ticketId)}/read`);
  },
};
