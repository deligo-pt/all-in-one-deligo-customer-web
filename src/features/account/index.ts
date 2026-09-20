/**
 * The account area's public surface (Phase 20).
 *
 * The profile, the addresses screen, the shared list (cards, vouchers,
 * referral history) and support chat, plus the shell the settings page
 * composes its own body inside. The dialogs are internal and load on use.
 */
export { AccountShell, type AccountNavItem } from "@/components/layout/AccountShell";
export {
  ProfileView,
  type Preference,
  type ProfileCopy,
  type ProfileStat,
} from "./ProfileView";
export { AddressesView, type AddressesCopy } from "./AddressesView";
export {
  AccountListView,
  type AccountListCopy,
  type AccountListRow,
} from "./AccountListView";
export { SupportView, type SupportCopy } from "./SupportView";
export { accountNav, type AccountNavLabels } from "@/components/layout/accountNav";
export type {
  AccountAddress,
  AccountTransport,
  AddressInput,
  AddressType,
  Profile,
  Referral,
  SavedCard,
  SupportMessage,
  SupportThread,
  Voucher,
} from "./types";
