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
  nif: "Tax number (NIF)",
  changeContact: "Change email or phone",
  photoTooLarge: "That photo is larger than 5 MB. Choose a smaller one.",
  editTitle: "Edit profile",
  firstName: "First name",
  lastName: "Last name",
  nifHelp: "Printed on your invoices when you give it.",
  save: "Save",
  close: "Close",
  cancel: "Cancel",
  contactChangeTitle: "Change email or phone",
  contactBody: "We send a code to the new address. Nothing changes until you enter it.",
  contactNewEmail: "New email address",
  contactNewPhone: "New phone number",
  contactPhoneHelp: "The nine digits of the mobile number.",
  contactInvalidPhone: "Enter the nine digits of the mobile number.",
  contactSendCode: "Send code",
  contactCode: "Code",
  contactCodeSent: "We sent a code. Enter it below to confirm the change.",
  contactConfirm: "Confirm change",
  preferences: "Settings & preferences",
  memberSince: "Member since",
  accountId: "Account ID:",
  logout: "Log out of this account",
  version: "DeliGo Version 2.0.1",

  // ── The menu ─────────────────────────────────────────────────────────────
  navProfile: "Profile",
  navOrders: "Orders",
  navNotifications: "Notifications",
  navAddresses: "Addresses",
  navPayment: "Payment methods",
  navVouchers: "Vouchers",
  navReferrals: "Refer & Earn",
  navSupport: "Support",
  navSettings: "Settings",
  ordersAndPayments: "Orders & Payments",
  ordersDescription: "View and track your current or past orders",
  paymentMethodsDescription: "Manage your saved cards and payment accounts",
  referralsDescription: "Earn rewards by inviting your friends to DeliGo",
  prefHelpCenter: "Help Center",
  statVouchers: "Vouchers",
  statPoints: "Reward Points",
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
  addressActive: "Active",
  addressSetActive: "Make active",
  addressActiveNote:
    "Your active address is where checkout delivers. A new address becomes the active one.",
  addressEditTitle: "Edit address",
  addressType: "Address type",
  addressHome: "Home",
  addressOffice: "Office",
  addressOther: "Other",
  addressCurrent: "Current location",
  addressCustomType: "Name for this address",
  addressStreet: "Street and number",
  addressDetailed: "Floor, apartment (optional)",
  addressPostalCode: "Postal code",
  addressCity: "City",
  addressState: "District (optional)",
  addressCountry: "Country",
  addressNotes: "Notes for the rider (optional)",
  addressNotFound:
    "We could not find that address on the map. Check the street, city and country.",

  // ── Payment methods ──────────────────────────────────────────────────────
  paymentTitle: "Payment methods",
  paymentSubtitle: "Cards and wallets saved to this account.",
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
  referralInvites: "Invitations sent",
  referralSuccessful: "Friends who joined",
  referralPending: "Pending invitations",
  referralWallet: "Wallet balance",
  pointsBalance: "{points} points",
  referralsEmpty: "No referrals yet",
  referralsEmptyBody: "Share your code and invitations you send appear here.",

  // ── Settings ─────────────────────────────────────────────────────────────
  settingsTitle: "Settings",
  settingsSubtitle: "Language, notifications, and what happens to your data.",
  dangerZone: "Delete this account",
  dangerZoneBody:
    "Deleting removes your profile, addresses and saved payment methods. Orders already placed are kept as long as the law requires.",
  deleteAccount: "Delete account",
  deleteViaSupport:
    "Account deletion is handled by DeliGo support. The button opens a chat with the request written for you; it is sent only when you press Send.",
  deleteRequestMessage:
    "Hello, I would like to delete my DeliGo account and the personal data linked to it.",

  // ── Support ──────────────────────────────────────────────────────────────
  supportTitle: "Support",
  supportSubtitle: "Talk to the DeliGo team about an order, a payment or your account.",
  supportTicket: "Ticket",
  supportOpen: "Open",
  supportInProgress: "In progress",
  supportEmpty: "No messages yet",
  supportEmptyBody: "Write below and the DeliGo team replies here.",
  supportUnavailable: "Support could not be loaded",
  supportYou: "You",
  supportTeam: "DeliGo support",
  supportToday: "Today",
  supportOrderIssue: "I have an issue with order #{reference}.",
  supportPlaceholder: "Write a message…",
  supportSend: "Send",
  supportAttachment: "Open attachment",

  // ── Shared ───────────────────────────────────────────────────────────────
  previewOnly: "This is a design preview. Nothing is sent from this page.",
  copyCode: "Copy code",
  copiedCode: "Copied",
  addressMapLabel: "Pin the exact spot",
  addressMapHelp:
    "Move the map so the pin sits on your door. We send the rider to the pin.",
  addressLocate: "Use my current location",
  addressLocateFailed:
    "Your location could not be read. Check that location access is allowed for this site.",
  remove: "Remove",
  defaultLabel: "Default",
  confirmRemove: "Yes, remove",
  actionFailed: "That did not go through. Please try again.",
  unavailableTitle: "Your account could not be loaded",
  unavailableBody: "Please try again in a moment.",

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
