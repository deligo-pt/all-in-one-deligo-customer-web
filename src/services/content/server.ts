import type { ContentDocument, ContentSection } from "@/components/shared/ContentPage";
import { getLocale, getTranslations } from "@/i18n/server";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";

/**
 * The prose pages' documents (Phase 20).
 *
 * **The words are the owner's, not ours.** The API has no terms, privacy, FAQ
 * or company endpoints (`/terms`, `/faqs`, `/available-countries` all 404,
 * measured), and the old app carries these texts in its own translation files
 * — the copy DeliGo already publishes. The `content` dictionaries are that
 * copy, carried over key for key in both languages, and each spec below is
 * the order the old page shows them in. Nothing here is written fresh.
 *
 * Pages with no copy in the old app — careers, blog, press, our story,
 * delivery information, returns — stay "content pending" (D-16).
 */

type T = Awaited<ReturnType<typeof getTranslations<"content">>>;
type Spec = (t: T, at: (path: string) => string) => ContentDocument;

const list = (t: T, keys: readonly string[]) => keys.map((key) => t(key as never));

const privacy: Spec = (t) => ({
  title: t("privacyHeroTitle"),
  lede: t("privacyHeroDescription"),
  sections: [
    { heading: t("privacyWhoWeAreTitle"), paragraphs: [t("privacyWhoWeAreText")] },
    {
      heading: t("privacyDataCollectTitle"),
      cards: [
        {
          title: t("privacyDataYouProvideTitle"),
          items: list(t, [
            "privacyDataYouProvide1",
            "privacyDataYouProvide2",
            "privacyDataYouProvide3",
            "privacyDataYouProvide4",
          ]),
        },
        {
          title: t("privacyDataAutoTitle"),
          items: list(t, [
            "privacyDataAuto1",
            "privacyDataAuto2",
            "privacyDataAuto3",
            "privacyDataAuto4",
          ]),
        },
      ],
      paragraphs: [t("privacyDataThirdPartyNote")],
    },
    {
      heading: t("privacyHowUseTitle"),
      items: list(t, [
        "privacyHowUse1",
        "privacyHowUse2",
        "privacyHowUse3",
        "privacyHowUse4",
        "privacyHowUse5",
        "privacyHowUse6",
      ]),
    },
    {
      heading: t("privacyLegalBasesTitle"),
      items: list(t, [
        "privacyLegalBases1",
        "privacyLegalBases2",
        "privacyLegalBases3",
        "privacyLegalBases4",
      ]),
    },
    {
      heading: t("privacySharingTitle"),
      items: list(t, [
        "privacySharing1",
        "privacySharing2",
        "privacySharing3",
        "privacySharing4",
      ]),
    },
    { heading: t("privacyCookiesTitle"), paragraphs: [t("privacyCookiesText")] },
    { heading: t("privacyRetentionTitle"), paragraphs: [t("privacyRetentionText")] },
    { heading: t("privacySecurityTitle"), paragraphs: [t("privacySecurityText")] },
    {
      heading: t("privacyInternationalTitle"),
      paragraphs: [t("privacyInternationalText")],
    },
    {
      heading: t("privacyRightsTitle"),
      paragraphs: [t("privacyRightsLead")],
      items: list(t, [
        "privacyRights1",
        "privacyRights2",
        "privacyRights3",
        "privacyRights4",
      ]),
      after: [t("privacyRightsContact")],
    },
    {
      heading: t("privacyDeletionTitle"),
      paragraphs: [
        t("privacyDeletionText"),
        t("privacyDeletionRequestText"),
        t("privacyDeletionNote"),
      ],
    },
    { heading: t("privacyChildrenTitle"), paragraphs: [t("privacyChildrenText")] },
    {
      heading: t("privacyChangesTitle"),
      paragraphs: [t("privacyChangesText")],
      cards: [
        {
          title: t("privacyChangesDataProtectionTitle"),
          body: t("privacyChangesDataProtectionText"),
        },
      ],
    },
  ],
});

const terms: Spec = (t, at) => ({
  title: t("termsHeroTitle"),
  sections: [
    { heading: t("termsIntroTitle"), paragraphs: [t("termsIntroDescription")] },
    {
      heading: t("termsCustomerSectionTitle"),
      paragraphs: [t("termsCustomerSectionDescription")],
      cards: [
        ["termAccountRegistrationTitle", "termAccountRegistrationText"],
        ["termPaymentsFeesTitle", "termPaymentsFeesText"],
        ["termCancellationsRefundsTitle", "termCancellationsRefundsText"],
        ["termDeliveryStandardsTitle", "termDeliveryStandardsText"],
        ["termProhibitedConductTitle", "termProhibitedConductText"],
        ["termPrivacyTitle", "termPrivacyText"],
        ["termDisputeResolutionTitle", "termDisputeResolutionText"],
        ["termAmendmentsTitle", "termAmendmentsText"],
      ].map(([title, body]) => ({ title: t(title as never), body: t(body as never) })),
    },
    {
      paragraphs: [t("termsContactSupportHelper")],
      links: [{ label: t("termsContactSupportButton"), href: at(ROUTES.support.path) }],
    },
  ],
});

const faqGroup = (
  t: T,
  heading: string,
  pairs: readonly [string, string][],
): ContentSection => ({
  heading: t(heading as never),
  faqs: pairs.map(([question, answer]) => ({
    question: t(question as never),
    answer: t(answer as never),
  })),
});

const faqs: Spec = (t) => ({
  title: t("faqTitle"),
  lede: t("faqSubtitle"),
  sections: [
    faqGroup(t, "generalQuestions", [
      ["general_q1", "general_a1"],
      ["general_q2", "general_a2"],
      ["general_q3", "general_a3"],
      ["general_q4", "general_a4"],
    ]),
    faqGroup(t, "customerFaqs", [
      ["customer_q1", "customer_a1"],
      ["customer_q2", "customer_a2"],
      ["customer_q3", "customer_a3"],
      ["customer_q4", "customer_a4"],
      ["customer_q5", "customer_a5"],
      ["customer_q6", "customer_a6"],
      ["customer_q7", "customer_a7"],
    ]),
    faqGroup(t, "merchantFaqs", [
      ["merchant_q1", "merchant_a1"],
      ["merchant_q2", "merchant_a2"],
      ["merchant_q3", "merchant_a3"],
      ["merchant_q4", "merchant_a4"],
      ["merchant_q5", "merchant_a5"],
    ]),
    faqGroup(t, "driverFaqs", [
      ["driver_q1", "driver_a1"],
      ["driver_q2", "driver_a2"],
      ["driver_q3", "driver_a3"],
      ["driver_q4", "driver_a4"],
      ["driver_q5", "driver_a5"],
    ]),
    faqGroup(t, "paymentSecurityFaqs", [
      ["security_q1", "security_a1"],
      ["security_q2", "security_a2"],
      ["security_q3", "security_a3"],
    ]),
    faqGroup(t, "liabilityFaqs", [
      ["liability_q1", "liability_a1"],
      ["liability_q2", "liability_a2"],
      ["liability_q3", "liability_a3"],
    ]),
  ],
});

const about: Spec = (t) => ({
  title: t("aboutTitle"),
  lede: t("aboutSubtitle"),
  sections: [
    { paragraphs: [t("aboutSlogan")] },
    {
      heading: t("techMarketplaceTitle"),
      paragraphs: [t("techMarketplaceText")],
      cards: [
        {
          title: t("regulatoryClarificationTitle"),
          body: t("regulatoryClarificationText"),
        },
      ],
    },
    {
      heading: t("superAppTitle"),
      paragraphs: [t("superAppIntro")],
      items: list(t, [
        "superAppService1",
        "superAppService2",
        "superAppService3",
        "superAppService4",
        "superAppService5",
        "superAppService6",
      ]),
      after: [t("superAppFooter")],
    },
    {
      heading: t("merchantTitle"),
      items: list(t, [
        "merchantBullet1",
        "merchantBullet2",
        "merchantBullet3",
        "merchantBullet4",
        "merchantBullet5",
      ]),
    },
    {
      heading: t("courierTitle"),
      items: list(t, ["courierBullet1", "courierBullet2", "courierBullet3"]),
    },
    {
      heading: t("advancedTechTitle"),
      cards: [
        { title: t("aiSmartMatching"), body: t("aiSmartMatchingText") },
        { title: t("realTimeTransparency"), body: t("realTimeTransparencyText") },
        { title: t("dataIntelligence"), body: t("dataIntelligenceText") },
      ],
    },
    {
      heading: t("scalabilityTitle"),
      cards: [
        { title: t("expansionStrategy"), body: t("expansionStrategyText") },
        { title: t("sustainableInfra"), body: t("sustainableInfraText") },
        { title: t("secureProtocols"), body: t("secureProtocolsText") },
      ],
    },
    {
      heading: t("contactsTitle"),
      items: list(t, [
        "website",
        "supportEmail",
        "headquarters",
        "whatsapp",
        "telephone",
      ]),
    },
  ],
});

const help: Spec = (t, at) => ({
  title: t("helpCenter"),
  sections: [
    {
      heading: t("contactSupport"),
      links: [
        {
          label: t("liveChat"),
          description: t("realTimeSupport"),
          href: at(ROUTES.support.path),
        },
        {
          label: t("emailUs"),
          description: t("contactEmailDetail1"),
          href: `mailto:${t("contactEmailDetail1")}`,
        },
        {
          label: t("callUs"),
          description: t("contactCallDetail2"),
          href: `tel:${t("contactCallDetail2").replace(/\s/g, "")}`,
        },
      ],
    },
    {
      heading: t("browseTopics"),
      links: [
        {
          label: t("generalFaqs"),
          description: t("generalFaqsDescription"),
          href: at(ROUTES.faqs.path),
        },
        {
          label: t("orderIssues"),
          description: t("orderIssuesDescription"),
          href: at(ROUTES.orders.path),
        },
        {
          label: t("paymentsRefunds"),
          description: t("paymentsRefundsDescription"),
          href: at(ROUTES.paymentMethods.path),
        },
        {
          label: t("accountProfile"),
          description: t("accountProfileDescription"),
          href: at(ROUTES.account.path),
        },
      ],
    },
    {
      heading: t("popularQuestions"),
      faqs: [
        { question: t("faqTrackOrderQuestion"), answer: t("faqTrackOrderAnswer") },
        {
          question: t("faqDeliveryChargesQuestion"),
          answer: t("faqDeliveryChargesAnswer"),
        },
        { question: t("faqVoucherQuestion"), answer: t("faqVoucherAnswer") },
      ],
    },
  ],
});

const contact: Spec = (t) => ({
  title: t("contactPageTitle"),
  lede: t("contactPageSubtitle"),
  sections: [
    {
      cards: [
        {
          title: t("contactCallTitle"),
          items: [t("contactCallDetail1"), t("contactCallDetail2")],
        },
        {
          title: t("contactEmailTitle"),
          items: [t("contactEmailDetail1"), t("contactEmailDetail2")],
        },
        {
          title: t("contactVisitTitle"),
          items: [t("contactVisitDetail1"), t("contactVisitDetail2")],
        },
        { title: t("contactWebsiteTitle"), items: [t("contactWebsiteDetail1")] },
      ],
    },
    {
      heading: t("contactLocationTitle"),
      paragraphs: [
        t("contactLocationDescription"),
        t("contactAddressLine1"),
        t("contactAddressLine2"),
      ],
      links: [
        { label: t("contactEmailButton"), href: `mailto:${t("contactEmailDetail1")}` },
        {
          label: t("contactWhatsAppButton"),
          href: `https://wa.me/${t("contactCallDetail2").replace(/[\s+]/g, "")}`,
        },
      ],
    },
    { heading: t("contactCtaTitle"), paragraphs: [t("contactCtaDescription")] },
  ],
});

const SPECS = { privacy, terms, faqs, about, help, contact } as const;
export type ContentName = keyof typeof SPECS;

/** A prose page's document, in the request's language. */
export async function readContent(name: ContentName): Promise<ContentDocument> {
  const [t, locale] = await Promise.all([getTranslations("content"), getLocale()]);
  return SPECS[name](t, (path) => withLocale(path, locale));
}
