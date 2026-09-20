/**
 * The prose pages' words: privacy, terms, FAQs, about, help and contact.
 *
 * **Carried over key for key from the old app's own translation files** (Phase
 * 20) — the copy DeliGo already publishes, not text written for this rebuild.
 * The API has no endpoint for any of it. Change the words with the owner, not
 * here. See `services/content/server.ts` for the order each page shows them in.
 */
const content = {
  privacyHeroTitle: "Privacy Policy",
  privacyHeroDescription:
    'This Privacy Policy explains how DeliGo ("DeliGo", "we", "us", or "our") collects, uses, discloses, and safeguards your information when you use our websites, apps, and services.',
  privacyWhoWeAreTitle: "1) Who we are",
  privacyWhoWeAreText:
    'DeliGo LDA is the data controller for personal data processed via our websites, apps and platforms (collectively, the "Services"). Registered office: [add company address]. Contact: info@deligoeu.com. If you access DeliGo through a business or fleet partner, that partner may be an independent controller for its own processing.',
  privacyDataCollectTitle: "2) Data we collect",
  privacyDataYouProvideTitle: "Information you provide",
  privacyDataYouProvide1: "Account details (name, email, phone, password).",
  privacyDataYouProvide2:
    "Profile and verification data (ID, TVDE/driver licence, vehicle docs, vendor/business info).",
  privacyDataYouProvide3:
    "Addresses, delivery instructions, support messages, reviews.",
  privacyDataYouProvide4:
    "Payment details (tokenized by our payment processors; we don't store full card numbers).",
  privacyDataAutoTitle: "Information we collect automatically",
  privacyDataAuto1:
    "Device and log data (IP, browser, OS version, app version, timestamps, crash logs).",
  privacyDataAuto2:
    "Usage data (pages viewed, features used, referral URLs, campaign attribution).",
  privacyDataAuto3:
    "Approximate or precise location when you allow location services (for rides/deliveries).",
  privacyDataAuto4: "Cookies, pixels and similar technologies (see Cookies).",
  privacyDataThirdPartyNote:
    "We may also receive data from third parties (e.g., identity verification services, payment providers, fleet or business partners) where lawful.",
  privacyHowUseTitle: "3) How we use your information",
  privacyHowUse1:
    "Provide and operate the Services (account creation, orders, rides, deliveries, payouts).",
  privacyHowUse2:
    "Verify identity, eligibility and compliance (e.g., driver/vendor onboarding).",
  privacyHowUse3: "Process payments, prevent fraud and ensure platform safety.",
  privacyHowUse4:
    "Communicate with you (service messages, support, policy updates, marketing with consent where required).",
  privacyHowUse5:
    "Improve and personalize the Services, analytics and performance monitoring.",
  privacyHowUse6: "Comply with legal obligations and enforce our Terms.",
  privacyLegalBasesTitle: "4) Legal bases for processing (GDPR/EU)",
  privacyLegalBases1:
    "Contract: To deliver the Services you request (e.g., rides, deliveries, account & payouts).",
  privacyLegalBases2:
    "Legitimate interests: Platform safety, fraud prevention, analytics, product improvement, limited direct marketing.",
  privacyLegalBases3:
    "Consent: Where required for marketing, cookies/analytics, or precise location sharing.",
  privacyLegalBases4:
    "Legal obligation: Tax, accounting, regulatory, and safety requirements.",
  privacySharingTitle: "5) When we share your information",
  privacySharing1:
    "Service providers (processors): Cloud hosting, analytics, customer support tools, ID verification, and payment processors—bound by contracts to protect your data.",
  privacySharing2:
    "Transaction parties: Drivers, couriers, vendors, fleet or business admins to fulfill your order/ride.",
  privacySharing3:
    "Legal and safety: Law enforcement, regulators, or to protect rights, safety and property.",
  privacySharing4:
    "Corporate events: In mergers, acquisitions or reorganization, with reasonable notice.",
  privacyCookiesTitle: "6) Cookies & similar technologies",
  privacyCookiesText:
    "We use essential cookies to run our site, and optional analytics/marketing cookies to understand usage and improve performance. You can control non-essential cookies via our cookie banner or your browser settings. Blocking some cookies may affect functionality.",
  privacyRetentionTitle: "7) Data retention",
  privacyRetentionText:
    "We keep personal data only as long as necessary for the purposes described above—typically for the life of your account and for a period required by law (e.g., tax and accounting). When data is no longer needed, we securely delete or anonymize it.",
  privacySecurityTitle: "8) Security",
  privacySecurityText:
    "We implement administrative, technical, and physical safeguards (encryption in transit, access controls, logging, least-privilege, regular reviews). No method of transmission or storage is 100% secure; we work continuously to enhance our protections.",
  privacyInternationalTitle: "9) International data transfers",
  privacyInternationalText:
    "Where data is transferred outside the EEA/UK, we use lawful transfer mechanisms such as the European Commission's Standard Contractual Clauses and additional safeguards as appropriate.",
  privacyRightsTitle: "10) Your privacy rights",
  privacyRightsLead: "Depending on your location, you may have the right to:",
  privacyRights1: "Access, correct, or delete your personal data.",
  privacyRights2:
    "Object to or restrict certain processing, and withdraw consent where we rely on consent.",
  privacyRights3: "Receive a portable copy of your data.",
  privacyRights4: "Lodge a complaint with your local data protection authority.",
  privacyRightsContact:
    "To exercise rights, contact us at privacy@deligoeu.com. We may need to verify your identity.",
  privacyDeletionTitle: "11) Account Deletion",
  privacyDeletionText:
    "You have the right to request deletion of your DeliGo account and associated personal data. Once your account is deleted, you may lose access to services, history, and stored information.",
  privacyDeletionRequestText:
    "To request account deletion, please visit our dedicated page:",
  privacyDeletionNote:
    "Note: Some data may be retained for legal, tax, or regulatory purposes.",
  privacyChildrenTitle: "12) Children’s privacy",
  privacyChildrenText:
    "Our Services are not intended for individuals under 16. We do not knowingly collect personal data from children. If you believe a child has provided us data, please contact us to remove it.",
  privacyChangesTitle: "13) Changes to this policy",
  privacyChangesText:
    'We may update this Privacy Policy from time to time. We will post the updated version on this page and adjust the "Last updated" date above. Significant changes may be notified via email or in-app notice.',
  privacyChangesDataProtectionTitle: "Data Protection Authority",
  privacyChangesDataProtectionText:
    "If you are in the EEA, you can contact your local authority. In Portugal: Comissão Nacional de Proteção de Dados (CNPD).",
  termsHeroTitle: "Terms and Conditions",
  termsIntroTitle: "Customer Terms & Conditions",
  termsIntroDescription:
    "By using DeliGo products and services as a customer, you agree to the applicable terms below. Choose a category to view the detailed terms for that product.",
  termsCustomerSectionTitle: "Customer Terms & Conditions",
  termsCustomerSectionDescription:
    "Please read these terms carefully. They govern your use of DeliGo services as a customer.",
  termAccountRegistrationTitle: "Account Registration",
  termAccountRegistrationText:
    "To use DeliGo services, you must create an accurate account. You are responsible for maintaining the confidentiality of your login credentials. DeliGo reserves the right to suspend accounts with false information.",
  termPaymentsFeesTitle: "Payments & Fees",
  termPaymentsFeesText:
    "All payments are processed securely. By using DeliGo, you agree to pay all fees associated with your orders, rides, or deliveries. DeliGo may charge a service fee, which will be clearly shown before checkout.",
  termCancellationsRefundsTitle: "Cancellations & Refunds",
  termCancellationsRefundsText:
    "Cancellation policies vary by service (rides, food, etc.). Refunds are issued at DeliGo's discretion based on the specific circumstances. Please review the cancellation policy before confirming an order.",
  termDeliveryStandardsTitle: "Delivery & Service Standards",
  termDeliveryStandardsText:
    "DeliGo strives to provide timely and accurate services. However, we are not liable for delays caused by weather, traffic, or other force majeure events. Estimated delivery times are not guaranteed.",
  termProhibitedConductTitle: "Prohibited Conduct",
  termProhibitedConductText:
    "You agree not to misuse DeliGo services, including fraud, harassment, or violating any laws. DeliGo may terminate your account for such behavior without prior notice.",
  termPrivacyTitle: "Privacy & Data Protection",
  termPrivacyText:
    "Your personal data is handled according to our Privacy Policy and applicable laws (GDPR). DeliGo will never sell your data to third parties without your explicit consent.",
  termDisputeResolutionTitle: "Dispute Resolution",
  termDisputeResolutionText:
    "Any disputes shall first be attempted to be resolved amicably through DeliGo support. If unresolved, disputes will be subject to the laws of Portugal and exclusive jurisdiction of its courts.",
  termAmendmentsTitle: "Amendments",
  termAmendmentsText:
    "DeliGo may update these Terms from time to time. Continued use of the platform after changes constitutes acceptance. You will be notified of material changes via email or in-app notification.",
  termsContactSupportHelper: "Have questions? Contact our support team anytime.",
  termsContactSupportButton: "Contact Support",
  faqTitle: "Frequently Asked Questions",
  faqSubtitle: "Everything you need to know about DeliGo",
  generalQuestions: "About DeliGo",
  general_q1: "What is DeliGo?",
  general_a1:
    "DeliGo is a technology marketplace and intermediary platform that connects customers, merchants, service providers, and independent couriers through a digital ecosystem. The platform enables users to discover, order, purchase, and receive products and services from independent third parties.",
  general_q2: "Does DeliGo sell products?",
  general_a2:
    "No. DeliGo does not own, manufacture, prepare, store, or sell any products. All products available through the platform are offered and sold by independent merchants.",
  general_q3: "Does DeliGo provide delivery services?",
  general_a3:
    "No. DeliGo does not provide transportation, courier, or delivery services. Deliveries are performed by independent couriers who use the platform.",
  general_q4: "What is DeliGo's role?",
  general_a4:
    "DeliGo acts solely as a technology provider and digital intermediary. The platform facilitates communication, order management, payment processing, and transaction support between customers, merchants, service providers, and independent couriers.",
  customerFaqs: "Customer FAQs",
  customer_q1: "How do I create a DeliGo account?",
  customer_a1:
    "You can register through the DeliGo mobile application or website using your email address or mobile number.",
  customer_q2: "How do I place an order?",
  customer_a2:
    "Browse available merchants on the platform, select products or services, add them to your cart, and complete the checkout process.",
  customer_q3: "Who am I purchasing from?",
  customer_a3:
    "You are purchasing directly from the merchant or service provider listed on the platform. DeliGo is not the seller of any products or services.",
  customer_q4: "How can I track my order?",
  customer_a4:
    "Customers can monitor order status and delivery progress through the DeliGo platform when tracking information is available.",
  customer_q5: "What payment methods are accepted?",
  customer_a5:
    "Available payment methods may include credit cards, debit cards, digital wallets, bank transfers, and cash options where supported by merchants.",
  customer_q6: "Can I cancel an order?",
  customer_a6:
    "Cancellation availability depends on the merchant's policies and the order status at the time of the request.",
  customer_q7: "Who should I contact regarding product quality issues?",
  customer_a7:
    "Product quality, availability, preparation, packaging, and product-related concerns are the responsibility of the merchant supplying the product.",
  merchantFaqs: "Merchant FAQs",
  merchant_q1: "Who can join DeliGo?",
  merchant_a1:
    "Restaurants, grocery stores, supermarkets, pharmacies, bakeries, retail shops, florists, and other eligible businesses may apply to join the platform.",
  merchant_q2: "How do I become a merchant partner?",
  merchant_a2:
    "Businesses can register through the DeliGo Merchant Portal and submit the required business documentation for verification.",
  merchant_q3: "What benefits do merchants receive?",
  merchant_a3:
    "Merchants gain access to customers, digital order management, reporting tools, promotional opportunities, and marketplace visibility.",
  merchant_q4: "Who sets product prices?",
  merchant_a4:
    "Merchants are responsible for determining their own pricing, promotions, product availability, and business policies.",
  merchant_q5: "How are payments settled?",
  merchant_a5:
    "Payments are processed through the platform and settled according to the applicable merchant agreement.",
  driverFaqs: "Courier FAQs",
  driver_q1: "Who are DeliGo couriers?",
  driver_a1:
    "Couriers are independent individuals or businesses that use the DeliGo platform to connect with delivery opportunities.",
  driver_q2: "Are couriers employed by DeliGo?",
  driver_a2:
    "No. Couriers operate independently and are not employees, agents, or representatives of DeliGo.",
  driver_q3: "How can I become a courier partner?",
  driver_a3:
    "Applicants can register through the DeliGo Courier Portal and submit the required documents for verification.",
  driver_q4: "What documents are required?",
  driver_a4:
    "Requirements may include identification documents, driving licenses, vehicle documents, insurance, and any permits required by local laws.",
  driver_q5: "Can I choose my own working hours?",
  driver_a5:
    "Yes. Independent couriers generally have flexibility regarding when and how often they use the platform.",
  paymentSecurityFaqs: "Payments & Security",
  security_q1: "Is my payment information secure?",
  security_a1:
    "DeliGo uses industry-standard security measures and secure payment technologies to help protect payment information.",
  security_q2: "Does DeliGo store credit card information?",
  security_a2:
    "Payment information is processed through authorized payment providers and handled in accordance with applicable security standards and privacy regulations.",
  security_q3: "How does DeliGo protect personal data?",
  security_a3:
    "DeliGo processes personal data in accordance with its Privacy Policy and applicable data protection laws, including GDPR where applicable.",
  liabilityFaqs: "Liability & Responsibility",
  liability_q1: "Who is responsible for products sold on DeliGo?",
  liability_a1:
    "The merchant supplying the product is responsible for product quality, safety, legality, pricing, availability, and compliance with applicable regulations.",
  liability_q2: "Who is responsible for deliveries?",
  liability_a2:
    "Independent couriers are responsible for delivery and transportation services they provide through the platform.",
  liability_q3: "Is DeliGo responsible for disputes between users?",
  liability_a3:
    "DeliGo may assist with dispute resolution where appropriate but is not a party to transactions between customers, merchants, service providers, or couriers.",
  aboutTitle: "About DeliGo",
  aboutSubtitle: "Neutral Digital Marketplace & Super App Ecosystem",
  aboutSlogan:
    "𝗗𝗲𝗹𝗶𝗚𝗼 𝗶𝘀 𝗮 𝘁𝗲𝗰𝗵𝗻𝗼𝗹𝗼𝗴𝘆 𝗺𝗮𝗿𝗸𝗲𝘁𝗽𝗹𝗮𝗰𝗲 𝗽𝗹𝗮𝘁𝗳𝗼𝗿𝗺 𝘁𝗵𝗮𝘁 𝗰𝗼𝗻𝗻𝗲𝗰𝘁𝘀 𝗰𝘂𝘀𝘁𝗼𝗺𝗲𝗿𝘀, 𝗺𝗲𝗿𝗰𝗵𝗮𝗻𝘁𝘀, 𝗮𝗻𝗱 𝗶𝗻𝗱𝗲𝗽𝗲𝗻𝗱𝗲𝗻𝘁 𝗰𝗼𝘂𝗿𝗶𝗲𝗿𝘀.",
  techMarketplaceTitle: "1. Technology Marketplace Model",
  techMarketplaceText:
    "DeliGo operates exclusively as a neutral digital marketplace designed to dynamically connect independent customers, merchants, and self-employed couriers through a unified, high-performance ecosystem. This modern model establishes an open framework where every participant retains structural autonomy while benefiting from the shared network infrastructure.",
  regulatoryClarificationTitle: "Important Regulatory and Operational Clarification",
  regulatoryClarificationText:
    "DeliGo is not a seller, retailer, logistics provider, or delivery contractor. The platform does not sell corporate products, stock inventory, or provide transport services directly. Instead, it functions strictly as a digital intermediary that facilitates secure, high-efficiency commercial transactions and real-time handshakes between independent marketplace parties.",
  superAppTitle: "2. Multi-Service Super App Architecture",
  superAppIntro:
    "The DeliGo platform is natively engineered to scale seamlessly beyond traditional logistics, evolving into a centralized everyday multi-service ecosystem across European markets:",
  superAppService1:
    "Food Delivery: Dynamic interactive menu interfaces and localized restaurant marketplace networks.",
  superAppService2:
    "Grocery Delivery: High-volume item curation, inventory sync windows, and neighborhood retail options.",
  superAppService3:
    "Pharmacy Delivery: Secure operational pipelines tailored for essential personal care and medical fulfillment.",
  superAppService4:
    "Courier & Parcel Services: Dedicated peer-to-peer and point-to-point courier request engines.",
  superAppService5:
    "Last-Mile Logistics & Fleet Management: Scalable routing infrastructures customized for enterprise fleet partners.",
  superAppService6:
    "Ride-Hailing Services & Mobility: On-demand urban transit technology designed to simplify inner-city navigation.",
  superAppFooter: "One unified app interface. Multiple everyday solutions.",
  merchantTitle: "3. Merchant Empowerment Toolkit",
  merchantBullet1: "Intuitive digital storefront creation and branding tools.",
  merchantBullet2: "Robust order management and operational tracking panels.",
  merchantBullet3: "Advanced business analytics and behavior dashboard frameworks.",
  merchantBullet4: "In-app marketing, promotional execution, and visibility mechanics.",
  merchantBullet5: "Direct customer engagement and loyalty maximization modules.",
  courierTitle: "4. Independent Courier Framework",
  courierBullet1: "Autonomous schedule control and dynamic active-status settings.",
  courierBullet2:
    "Full preference settings for localized delivery areas and neighborhood corridors.",
  courierBullet3:
    "Flexible earning models aligned with independent lifestyle requirements.",
  advancedTechTitle: "5. Advanced Technology Infrastructure",
  aiSmartMatching: "AI-Powered Smart Matching Engine",
  aiSmartMatchingText:
    "Using predictive machine learning models, DeliGo mathematically maps customer demand metrics against current merchant capacities and optimal courier geolocations. This automated optimization minimizes terminal wait times, optimizes delivery path length, and drives marketplace operational velocity.",
  realTimeTransparency: "Real-Time Transparency Architecture",
  realTimeTransparencyText:
    "Full behavioral trust is achieved across the platform ecosystem through the real-time tracking of every active order variable. Stakeholders receive instant notifications, fluid map updates reflecting courier movements, and cryptographically sound, unalterable digital transactional ledgers.",
  dataIntelligence: "Data-Driven Marketplace Intelligence",
  dataIntelligenceText:
    "By transforming raw platform signals into actionable, anonymized market intelligence datasets, DeliGo assists partner merchants in identifying macro trends, managing localized inventory levels, and securing data-driven long-term profitability.",
  scalabilityTitle: "6. Scalability, Sustainability & Security",
  expansionStrategy: "European Expansion Strategy",
  expansionStrategyText:
    "Built upon a microservices cloud architecture, DeliGo is optimized for immediate deployment across diverse cross-border metropolitan regions, allowing for swift adaptation to localized legal frameworks while maintaining standardized, high-caliber platform performance.",
  sustainableInfra: "Sustainable Digital Infrastructure",
  sustainableInfraText:
    "Environmental conscientiousness is explicitly coded into platform route planning. By deploying smart multi-order routing algorithms, DeliGo effectively minimizes carbon overheads, truncates unnecessary travel distances, and prioritizes alternative energy transportation modes and electric mobility integration.",
  secureProtocols: "Secure Digital Marketplace Protocols",
  secureProtocolsText:
    "Complete platform protection is engineered across every touchpoint through standard encrypted payment checkouts, secure independent identity validation protocols, layered data privacy controls, and proactive fraud prevention algorithms.",
  contactsTitle: "Corporate Contacts & Communications",
  website: "Official Website: www.deligo.pt",
  supportEmail: "Corporate Support Email: contact@deligo.pt",
  headquarters:
    "Headquarters Address: Rua Joaquim Agostinho 16C, 1750-126 Lisboa, Portugal",
  whatsapp: "Corporate WhatsApp: +351 920 136 680",
  telephone: "Office Telephone: +351 217 570 184",
  helpCenter: "Help Center",
  contactSupport: "Contact Support",
  liveChat: "Live Chat",
  realTimeSupport: "Chat with support",
  emailUs: "Email Us",
  contactEmailDetail1: "contact@deligo.pt",
  callUs: "Call Us",
  contactCallDetail2: "+351 920 136 680",
  browseTopics: "Browse Topics",
  generalFaqs: "FAQs",
  generalFaqsDescription: "Find answers, track orders, and more",
  orderIssues: "Order Issues",
  orderIssuesDescription: "Track, modify, or report problems",
  paymentsRefunds: "Payments & Refunds",
  paymentsRefundsDescription: "Billing questions and refund status",
  accountProfile: "Account & Profile",
  accountProfileDescription: "Manage account settings",
  popularQuestions: "Popular Questions",
  faqTrackOrderQuestion: "How can I track my order?",
  faqTrackOrderAnswer:
    "You can track your order in real-time by going to the Orders tab and selecting your active order. From there, you'll see a live map with your rider's location and an estimated delivery time.",
  faqDeliveryChargesQuestion: "What are the delivery charges?",
  faqDeliveryChargesAnswer:
    "Delivery charges vary based on distance and demand in your area. The exact delivery fee will always be displayed before checkout.",
  faqVoucherQuestion: "How do I apply a voucher?",
  faqVoucherAnswer:
    "Enter your voucher code during checkout and the discount will be automatically applied if the voucher is valid.",
  contactPageTitle: "Contact DeliGo",
  contactPageSubtitle:
    "We'd love to hear from you. Whether you have a question, need support, want to partner with us, or simply want to learn more about DeliGo, our team is here to help.",
  contactCallTitle: "Call Us",
  contactCallDetail1: "+351 21 757 0184",
  contactEmailTitle: "Email Us",
  contactEmailDetail2: "geral@deligo.pt",
  contactVisitTitle: "Visit Us",
  contactVisitDetail1: "Rua Joaquim Agostinho 16C",
  contactVisitDetail2: "1750-126 Lisbon, Portugal",
  contactWebsiteTitle: "Website",
  contactWebsiteDetail1: "www.deligo.pt",
  contactLocationTitle: "Visit Our Office",
  contactLocationDescription:
    "Located in Lisbon, Portugal, DeliGo is building the future of delivery, logistics, mobility, and digital commerce.",
  contactAddressLine1: "Rua Joaquim Agostinho 16C",
  contactAddressLine2: "1750-126 Lisbon, Portugal",
  contactEmailButton: "Email Us",
  contactWhatsAppButton: "WhatsApp Us",
  contactCtaTitle: "Need Help?",
  contactCtaDescription:
    "Our team is ready to assist you with any questions, support requests, partnerships, or business inquiries.",
} satisfies Record<string, string>;

export default content;
