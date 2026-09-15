import type {
  AccountListCopy,
  AccountNavLabels,
  AddressesCopy,
  ProfileCopy,
  SupportCopy,
} from "@/features/account";
import { getTranslations } from "@/i18n/server";

/** The account pages' words, resolved on the server (Phase 20). */

export async function accountNavLabels(): Promise<AccountNavLabels> {
  const t = await getTranslations("account");
  return {
    profile: t("navProfile"),
    orders: t("navOrders"),
    notifications: t("navNotifications"),
    addresses: t("navAddresses"),
    payment: t("navPayment"),
    vouchers: t("navVouchers"),
    referrals: t("navReferrals"),
    support: t("navSupport"),
    settings: t("navSettings"),
  };
}

export async function listCopy(
  page: "payment" | "vouchers" | "referrals",
): Promise<AccountListCopy> {
  const t = await getTranslations("account");
  const words = {
    payment: {
      title: t("paymentTitle"),
      subtitle: t("paymentSubtitle"),
      emptyTitle: t("paymentEmpty"),
      emptyBody: t("paymentEmptyBody"),
    },
    vouchers: {
      title: t("vouchersTitle"),
      subtitle: t("vouchersSubtitle"),
      emptyTitle: t("vouchersEmpty"),
      emptyBody: t("vouchersEmptyBody"),
    },
    referrals: {
      title: t("referralsTitle"),
      subtitle: t("referralsSubtitle"),
      emptyTitle: t("referralsEmpty"),
      emptyBody: t("referralsEmptyBody"),
    },
  }[page];
  return {
    ...words,
    navLabel: t("navLabel"),
    remove: t("remove"),
    confirmRemove: t("confirmRemove"),
    cancel: t("cancel"),
    default: t("defaultLabel"),
    unavailableTitle: t("unavailableTitle"),
    unavailableBody: t("unavailableBody"),
    actionFailed: t("actionFailed"),
    copy: t("copyCode"),
    copied: t("copiedCode"),
  };
}

export async function profileCopy(): Promise<ProfileCopy> {
  const t = await getTranslations("account");
  return {
    title: t("title"),
    subtitle: t("subtitle"),
    navLabel: t("navLabel"),
    editProfile: t("editProfile"),
    changeImage: t("changeImage"),
    avatarAlt: t("avatarAlt"),
    personalInformation: t("personalInformation"),
    edit: t("edit"),
    fullName: t("fullName"),
    phone: t("phone"),
    email: t("email"),
    nif: t("nif"),
    changeContact: t("changeContact"),
    preferences: t("preferences"),
    ordersAndPayments: t("ordersAndPayments"),
    memberSince: t("memberSince"),
    accountId: t("accountId"),
    logout: t("logout"),
    version: t("version"),
    photoTooLarge: t("photoTooLarge"),
    actionFailed: t("actionFailed"),
    editDialog: {
      title: t("editTitle"),
      close: t("close"),
      firstName: t("firstName"),
      lastName: t("lastName"),
      nif: t("nif"),
      nifHelp: t("nifHelp"),
      save: t("save"),
      actionFailed: t("actionFailed"),
    },
    contactDialog: {
      title: t("contactChangeTitle"),
      body: t("contactBody"),
      close: t("close"),
      email: t("email"),
      phone: t("phone"),
      newEmail: t("contactNewEmail"),
      newPhone: t("contactNewPhone"),
      phoneHelp: t("contactPhoneHelp"),
      invalidPhone: t("contactInvalidPhone"),
      sendCode: t("contactSendCode"),
      code: t("contactCode"),
      codeSent: t("contactCodeSent"),
      confirm: t("contactConfirm"),
      actionFailed: t("actionFailed"),
    },
  };
}

export async function addressesCopy(): Promise<AddressesCopy> {
  const t = await getTranslations("account");
  return {
    title: t("addressesTitle"),
    subtitle: t("addressesSubtitle"),
    navLabel: t("navLabel"),
    add: t("addAddress"),
    edit: t("edit"),
    remove: t("remove"),
    confirmRemove: t("confirmRemove"),
    cancel: t("cancel"),
    active: t("addressActive"),
    setActive: t("addressSetActive"),
    activeNote: t("addressActiveNote"),
    emptyTitle: t("addressesEmpty"),
    emptyBody: t("addressesEmptyBody"),
    unavailableTitle: t("unavailableTitle"),
    unavailableBody: t("unavailableBody"),
    actionFailed: t("actionFailed"),
    form: {
      addTitle: t("addAddress"),
      editTitle: t("addressEditTitle"),
      close: t("close"),
      type: t("addressType"),
      typeLabel: {
        HOME: t("addressHome"),
        OFFICE: t("addressOffice"),
        OTHER: t("addressOther"),
        CURRENT_LOCATION: t("addressCurrent"),
      },
      customType: t("addressCustomType"),
      street: t("addressStreet"),
      detailedAddress: t("addressDetailed"),
      postalCode: t("addressPostalCode"),
      city: t("addressCity"),
      state: t("addressState"),
      country: t("addressCountry"),
      notes: t("addressNotes"),
      save: t("save"),
      locate: t("addressLocate"),
      locateFailed: t("addressLocateFailed"),
      notFound: t("addressNotFound"),
      actionFailed: t("actionFailed"),
    },
  };
}

export async function supportCopy(): Promise<SupportCopy> {
  const t = await getTranslations("account");
  return {
    title: t("supportTitle"),
    subtitle: t("supportSubtitle"),
    navLabel: t("navLabel"),
    ticket: t("supportTicket"),
    emptyTitle: t("supportEmpty"),
    emptyBody: t("supportEmptyBody"),
    unavailableTitle: t("supportUnavailable"),
    unavailableBody: t("unavailableBody"),
    you: t("supportYou"),
    team: t("supportTeam"),
    placeholder: t("supportPlaceholder"),
    send: t("supportSend"),
    attachment: t("supportAttachment"),
    actionFailed: t("actionFailed"),
  };
}
