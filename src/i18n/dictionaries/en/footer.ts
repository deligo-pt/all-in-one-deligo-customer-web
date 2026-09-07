/**
 * The footer: a brand block, four link columns, a newsletter, and a legal bar.
 *
 * The column headings and every link were read out of the design rather than
 * invented, which is why "Food Delivery" and the header's "Food" are separate
 * keys — they are different words in the same product and translating one from
 * the other would be guessing.
 */
const footer = {
  description:
    "DeliGo is a technology marketplace platform that connects customers with local restaurants, stores, drivers and partners.",
  promise: "Fast delivery • Secure payments • Real-time tracking",

  servicesHeading: "Services",
  foodDelivery: "Food Delivery",
  groceryDelivery: "Grocery Delivery",
  rideBooking: "Ride Booking",
  hotelBooking: "Hotel Booking",
  parcelDelivery: "Parcel Delivery",
  electronics: "Electronics",

  companyHeading: "Company",
  aboutDeligo: "About DeliGo",
  ourStory: "Our Story",
  careers: "Careers",
  blog: "Blog & News",
  press: "Press",
  contact: "Contact Us",

  supportHeading: "Help & Support",
  helpCenter: "Help Center",
  deliveryInformation: "Delivery Information",
  returns: "Returns & Refunds",
  trackOrder: "Track Order",
  faqs: "FAQs",
  customerSupport: "Customer Support",

  whyHeading: "Why Choose DeliGo",
  whyFast: "Delivery in 20 minutes",
  whyPartners: "Trusted local partners",
  whyPayments: "Secure online payments",
  whySupport: "24/7 customer support",

  newsletterHeading: "Stay Updated",
  newsletterBody: "Get the latest offers, member-only deals, and product updates.",
  emailPlaceholder: "Email address",
  subscribe: "Subscribe",
  noSpam: "No spam. Unsubscribe anytime.",

  weAccept: "We Accept:",
  copyright: "© {year} DeliGo. All rights reserved.",
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  currencyEuro: "EUR (€)",
} satisfies Record<string, string>;

export default footer;
