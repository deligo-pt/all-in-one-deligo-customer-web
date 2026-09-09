/**
 * The account area's words, plus the shell every prose page shares.
 *
 * Transcribed from `Profile` (1440×1798) and the 412px `change profile`,
 * `Address` and `select country` frames. Data — a name, an account id, an
 * address, "15.00€" — is never here.
 *
 * The twelve help, legal and company pages have **no design and no copy**
 * (D-16), so what is here is their shell: a title each, and one honest
 * sentence saying the document is pending. Terms and a privacy policy are not
 * things a frontend writes.
 */
const account = {
  // ── Profile ──────────────────────────────────────────────────────────────
  title: "Profile",
  subtitle: "Your details, your preferences, and everything saved to this account.",
  navLabel: "Account sections",
  editProfile: "Edit profile",
  changeImage: "Change image",
  avatarAlt: "Profile photograph",
  personalInformation: "Personal Information",
  edit: "Edit",
  fullName: "Full name",
  phone: "Phone number",
  email: "Email address",
  emergencyContact: "Emergency Contact",
  emergencyContactBody:
    "Used only when necessary for account or safety-related situations.",
  contactName: "Contact name",
  preferences: "Settings & preferences",
  memberSince: "Member since",
  accountId: "Account ID:",
  logout: "Log out of this account",
  version: "DeliGo Version 2.0.1",

  // ── The menu ─────────────────────────────────────────────────────────────
  navProfile: "Profile",
  navOrders: "Orders",
  navAddresses: "Addresses",
  navPayment: "Payment methods",
  navVouchers: "Vouchers",
  navReferrals: "Refer & Earn",
  navSettings: "Settings",
  prefLanguage: "Language",
  prefSupport: "Support",
  prefSafety: "Safety",
  prefPrivacy: "Privacy",
  prefTerms: "Terms",

  // ── Addresses ────────────────────────────────────────────────────────────
  addressesTitle: "Addresses",
  addressesSubtitle: "Where your orders go.",
  addAddress: "Add an address",
  addressesEmpty: "No addresses saved",
  addressesEmptyBody: "Add one and it will be offered at checkout.",

  // ── Payment methods ──────────────────────────────────────────────────────
  paymentTitle: "Payment methods",
  paymentSubtitle: "Cards and wallets saved to this account.",
  addPayment: "Add a payment method",
  paymentEmpty: "No payment methods saved",
  paymentEmptyBody:
    "Anything you choose to save at checkout appears here. Card details are held by the payment provider, never by DeliGo.",

  // ── Vouchers ─────────────────────────────────────────────────────────────
  vouchersTitle: "Vouchers",
  vouchersSubtitle: "Codes available on this account.",
  vouchersEmpty: "No vouchers right now",
  vouchersEmptyBody: "Offers you receive show up here, and at checkout.",

  // ── Refer & Earn ─────────────────────────────────────────────────────────
  referralsTitle: "Refer & Earn",
  referralsSubtitle: "Share your code and you both get something back.",
  referralCode: "Your code",
  referralEarned: "Earned so far",
  referralsEmpty: "No referrals yet",
  referralsEmptyBody: "Share your code and invitations you send appear here.",

  // ── Settings ─────────────────────────────────────────────────────────────
  settingsTitle: "Settings",
  settingsSubtitle: "Language, notifications, and what happens to your data.",
  dangerZone: "Delete this account",
  dangerZoneBody:
    "Deleting removes your profile, addresses and saved payment methods. Orders already placed are kept as long as the law requires.",
  deleteAccount: "Delete account",

  // ── Shared ───────────────────────────────────────────────────────────────
  remove: "Remove",
  defaultLabel: "Default",
  unavailableTitle: "Your account is not connected yet",
  unavailableBody:
    "This screen is built; the account behind it is connected in a later phase. Nothing here is placeholder data — there is simply nothing to show until there is.",
  notWired:
    "This is not connected yet. The control is real and the request it would send arrives in a later phase — nothing was changed or removed.",

  // ── The prose pages (D-16) ───────────────────────────────────────────────
  contentPendingTitle: "This page is waiting for its content",
  contentPendingBody:
    "The page is built. Its words are not written yet — and a policy, a set of terms or a company description is not something this application should invent.",
  aboutTitle: "About DeliGo",
  ourStoryTitle: "Our story",
  careersTitle: "Careers",
  blogTitle: "Blog & news",
  pressTitle: "Press",
  contactTitle: "Contact us",
  privacyTitle: "Privacy policy",
  termsTitle: "Terms of service",
  helpTitle: "Help centre",
  helpDeliveryTitle: "Delivery information",
  helpReturnsTitle: "Returns & refunds",
  faqsTitle: "Frequently asked questions",
} satisfies Record<string, string>;

export default account;
