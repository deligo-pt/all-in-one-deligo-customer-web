/**
 * The account area's public surface.
 *
 * Two views cover six pages: the profile the design actually draws, and one
 * list view the addresses, cards, vouchers and referrals pages share. The
 * shell is exported because the settings page composes its own body inside it.
 */
export { AccountShell, type AccountNavItem } from "./AccountShell";
export { ProfileView, type ProfileCopy } from "./ProfileView";
export {
  AccountListView,
  type AccountListCopy,
  type AccountListRow,
} from "./AccountListView";
export { accountNav, type AccountNavLabels } from "./nav";
export { notWiredAccount } from "./transport";
export { AccountUnavailableError } from "./types";
export type {
  AccountTransport,
  Address,
  EmergencyContact,
  Preference,
  Profile,
  Referral,
  SavedCard,
} from "./types";
