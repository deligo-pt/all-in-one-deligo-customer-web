/**
 * The landing page — nine sections, 7,714px.
 *
 * Every string here was read out of the Figma frame rather than written. Where
 * the design repeats itself (the fourth "how it works" step is numbered 05, and
 * one FAQ entry appears twice) the copy is kept and the numbering corrected;
 * both are recorded in Plan.md, Phase 5.
 *
 * The six service-picker tabs are NOT here. They are the same six words as the
 * header's verticals and live in `nav`, so a rename happens once.
 */
const home = {
  // ── Hero ───────────────────────────────────────────────────────────────────
  heroTitle: "Your World, Delivered in One Go.",
  heroLocationLabel: "Delivery Location",
  heroLocationPlaceholder: "Where should we deliver?",
  heroUseCurrentLocation: "Use current location",
  heroExplore: "Explore",
  heroImageAlt: "A DeliGo courier delivering an order",

  // ── Explore DeliGo Services ────────────────────────────────────────────────
  servicesEyebrow: "OUR SERVICES",
  servicesTitle: "Explore DeliGo Services",
  servicesBody:
    "Stop switching apps. DeliGo brings every daily need into one seamless, beautiful experience.",
  serviceFoodTitle: "Food Delivery",
  serviceFoodBody:
    "From local favorites to gourmet cuisine — delivered in under 30 minutes with live GPS tracking.",
  serviceGroceriesTitle: "Groceries",
  serviceGroceriesBody:
    "Fresh produce, pantry essentials, and household items delivered whenever you need them.",
  serviceRideTitle: "Ride Booking",
  serviceRideBody:
    "Safe, reliable rides with professional drivers, transparent fares, and real-time tracking.",
  serviceHotelTitle: "Hotel Booking",
  serviceHotelBody:
    "Book boutique hotels, business stays, and luxury resorts with instant confirmation and flexible cancellation.",
  serviceParcelTitle: "Parcel Delivery",
  serviceParcelBody:
    "Fast, secure deliveries with real-time tracking from pickup to destination.",
  serviceElectronicsTitle: "Electronics",
  serviceElectronicsBody:
    "Premium tech products from verified brands and authorized sellers.",

  // ── Designed for your modern life ──────────────────────────────────────────
  aboutEyebrow: "About DELIGO",
  aboutTitle: "Designed for your modern life.",
  aboutOneTitle: "Everything in One App",
  aboutOneBody:
    "Stop switching between apps. DeliGo consolidates all your essential services into a single, intuitive interface.",
  aboutTwoTitle: "Real-Time Tracking",
  aboutTwoBody:
    "Follow every journey with live GPS tracking, accurate ETAs, and instant delivery updates—every step of the way.",
  aboutThreeTitle: "Secure Payments",
  aboutThreeBody:
    "Pay effortlessly with one tap using DeliGo Pay, credit or debit cards, and trusted digital wallets—all protected with enterprise-grade security.",
  aboutQuote:
    "DeliGo isn't just another delivery app—it's a platform designed to simplify everyday life through seamless technology, trusted services, and exceptional experiences.",
  aboutQuoteName: "Daniel Carter",
  aboutQuoteRole: "Founder & CEO, DeliGo",

  // ── How it works ───────────────────────────────────────────────────────────
  howEyebrow: "HOW IT WORKS",
  howTitle: "Simple. Obvious. Fast.",
  howDiscoverTitle: "Discover & Choose",
  howDiscoverBody:
    "Find the best options with smart recommendations tailored to your needs.",
  howOrderTitle: "Order or Book",
  howOrderBody: "Confirm in seconds with secure payments and a seamless experience.",
  howTrackTitle: "Track Live",
  howTrackBody:
    "Stay informed with real-time updates and precise GPS tracking from start to finish.",
  howEnjoyTitle: "Enjoy",
  howEnjoyBody:
    "Enjoy a seamless experience from start to finish, then tell us how we did.",

  // ── Partner with DeliGo ────────────────────────────────────────────────────
  partnerTitle: "Partner with DeliGo",
  partnerBody:
    "Join our growing ecosystem and reach millions of customers looking for premium services.",
  partnerCta: "Become a Partner",
  partnerShopsTitle: "Shops",
  partnerShopsBody:
    "Expand your reach, increase sales, and connect with customers every day.",
  partnerHotelsTitle: "Hotels",
  partnerHotelsBody:
    "Showcase your property to travelers and locals with seamless bookings and wider exposure.",
  partnerCouriersTitle: "Couriers",
  partnerCouriersBody:
    "Earn on your schedule with flexible hours, competitive payouts, and rewards.",
  partnerDriversTitle: "Drivers",
  partnerDriversBody:
    "Drive with confidence using flexible schedules, transparent earnings, and safety-first tech.",

  // ── DeliGo Plus ────────────────────────────────────────────────────────────
  plusEyebrow: "DeliGo Plus",
  plusTitle: "Unlock Your Premium Life.",
  plusBody: "One subscription. Every service. Unlimited perks.",
  plusMostPopular: "MOST POPULAR",
  // The amount is formatted by `formatCurrency` from the active locale, so the
  // sentence takes it as a value rather than baking "4.99€" into the string.
  plusPerMonth: "{price}/month",
  plusFreeName: "FREE",
  plusFreeAllServices: "Access to all services",
  plusFreeStandardDelivery: "Standard delivery",
  plusFreeEmailSupport: "Email support",
  plusFreeBasicTracking: "Basic order tracking",
  plusPaidName: "PLUS",
  plusPaidFreeDelivery: "Free delivery on orders over {threshold}",
  plusPaidPriority: "Priority 20-minute delivery",
  plusPaidSupport: "24/7 dedicated customer support",
  plusPaidTracking: "Live GPS tracking & real-time ETA updates",
  plusPaidDiscounts: "Exclusive partner discounts",
  plusPaidEarlyAccess: "Early access to new features",

  // ── Testimonials ───────────────────────────────────────────────────────────
  reviewsEyebrow: "WHAT PEOPLE SAY",
  reviewsTitle: "Loved by Millions",
  reviewsVerified: "Verified Buyer",
  reviewsPrevious: "Previous testimonials",
  reviewsNext: "Next testimonials",
  reviewsRegion: "Customer testimonials",

  // ── Download app ───────────────────────────────────────────────────────────
  downloadTitle: "Experience DeliGo on the move.",
  downloadBody:
    "Download our app to get real-time tracking, exclusive in-app offers, and seamless one-tap service booking wherever you are.",
  downloadAppStoreLead: "Download on the",
  downloadAppStore: "App Store",
  downloadGooglePlayLead: "Get it on",
  downloadGooglePlay: "Google Play",
  downloadImageAlt: "The DeliGo app on a phone",

  // ── FAQ ────────────────────────────────────────────────────────────────────
  faqEyebrow: "FAQ",
  faqTitle: "Common Questions",
  faqHowQ: "How does DeliGo work?",
  faqHowA:
    "DeliGo makes everyday services simple and convenient. Choose a service, browse available options, place your order or booking, and pay securely through the app. Once confirmed, you can track your order or ride in real time until it reaches you.",
  faqCitiesQ: "What cities is DeliGo available in?",
  faqCitiesA:
    "DeliGo is currently available in selected cities across Portugal, with new locations being added regularly. Enter your delivery address in the app to check whether DeliGo services are available in your area.",
  faqPlusQ: "How does DeliGo Plus membership work?",
  faqPlusA:
    "DeliGo Plus is a monthly subscription that unlocks premium benefits, including free delivery on eligible orders, priority delivery, exclusive member discounts, dedicated customer support, and early access to new features. You can subscribe, manage, or cancel your membership anytime from your account settings.",
  faqTrackQ: "How do I track my order or ride in real time?",
  faqTrackA:
    "After your order or ride is confirmed, you'll receive live updates directly in the app. You can view your driver's location on the map, monitor the estimated arrival time (ETA), and receive notifications at every stage of the journey.",
  faqPaymentQ: "What payment methods are accepted?",
  faqPaymentA:
    "DeliGo accepts major credit and debit cards, Apple Pay, Google Pay, PayPal, and selected local payment methods. Available payment options may vary depending on your location.",
} satisfies Record<string, string>;

export default home;
