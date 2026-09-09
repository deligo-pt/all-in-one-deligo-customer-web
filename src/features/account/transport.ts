import { AccountUnavailableError, type AccountTransport } from "./types";

/**
 * The account Track B ships with: nothing.
 *
 * `deleteAccount` deserves the same note `placeOrder` got — it is
 * irreversible, and a stub that resolved would tell a customer their account
 * was gone when it was not. `removeAddress` and `removeCard` are the same in
 * miniature.
 *
 * Populated at `/account-states`, a development page that 404s in production.
 */
export const notWiredAccount: AccountTransport = {
  profile: () => Promise.reject(new AccountUnavailableError()),
  updateProfile: () => Promise.reject(new AccountUnavailableError()),
  addresses: () => Promise.reject(new AccountUnavailableError()),
  removeAddress: () => Promise.reject(new AccountUnavailableError()),
  cards: () => Promise.reject(new AccountUnavailableError()),
  removeCard: () => Promise.reject(new AccountUnavailableError()),
  vouchers: () => Promise.reject(new AccountUnavailableError()),
  referral: () => Promise.reject(new AccountUnavailableError()),
  deleteAccount: () => Promise.reject(new AccountUnavailableError()),
};
