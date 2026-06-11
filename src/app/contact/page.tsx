import type { Metadata } from "next";
import { Suspense } from "react";
import { MainTemplate } from "@/components/templates/MainTemplate";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteFooter } from "@/components/organisms/layout/SiteFooter";
import { SiteHeader } from "@/components/organisms/layout/SiteHeader";
import { ServicesFaqSection } from "@/components/organisms/services/ServicesFaqSection";
import { absoluteUrl, createMetadata } from "@/lib/seo";
import ContactPageClient from "./ContactPageClient";

const contactFaqs = [
  {
    question: "What services does Romega Solutions offer?",
    answer:
      "We support businesses through talent acquisition, brand and growth support, and strategic operations. That includes executive search, remote and global talent sourcing, brand positioning, messaging clarity, workflow optimization, and scalable operating systems.",
  },
  {
    question: "How do you find the right people for my business?",
    answer:
      "We take the time to understand your needs, then carefully source, screen, and evaluate candidates to find the best fit for your team.",
  },
  {
    question: "How much does an engagement cost?",
    answer:
      "Pricing depends on the service mix, urgency, and level of support required. After an initial consultation, we recommend a tailored scope and quote based on your growth goals.",
  },
  {
    question: "How soon can we get started?",
    answer:
      "Once we understand your goals and requirements, we'll recommend the best solution and guide you through the next steps to get started as quickly as possible.",
  },
  {
    question: "Do you support brand and growth strategy?",
    answer:
      "Yes. Our brand and growth support focuses on positioning, messaging clarity, content direction, market presence alignment, and insights that help teams communicate with more confidence.",
  },
  {
    question: "Can I choose only the services I need?",
    answer:
      "Absolutely. Our services are flexible, so whether you need support in one area or several, we'll tailor a solution that works for your business.",
  },
  {
    question: "Why work with Romega Solutions?",
    answer:
      "We connect people, brand, and operations so growth is supported from several angles at once. Our work is practical, discreet, and tailored to the realities of scaling teams.",
  },
] as const;

export const metadata: Metadata = createMetadata({
  title: "Contact Romega Solutions",
  description:
    "Get in touch with Romega Solutions to discuss talent, brand, and operations support tailored to your growth goals.",
  path: "/contact",
  keywords: [
    "contact romega",
    "hire romega solutions",
    "business inquiry",
    "talent consulting contact",
    "brand strategy inquiry",
  ],
});

export default function ContactPage() {
  const contactFormAvailable =
    Boolean(process.env.RESEND_API_KEY) ||
    (process.env.EMAIL_CONTACT_FALLBACK_ENABLED?.toLowerCase() === "true" &&
      process.env.NODE_ENV !== "production");

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": absoluteUrl("/contact#webpage"),
        url: absoluteUrl("/contact"),
        name: "Contact Romega Solutions",
        description:
          "Get in touch with Romega Solutions to discuss talent, brand, and operations support tailored to your growth goals.",
        isPartOf: {
          "@id": absoluteUrl("/#website"),
        },
        about: {
          "@id": absoluteUrl("/#organization"),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: absoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Contact",
            item: absoluteUrl("/contact"),
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": absoluteUrl("/contact#faq"),
        mainEntity: contactFaqs.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
    ],
  };

  return (
    <MainTemplate
      jsonLd={<JsonLd id="contact-structured-data" data={structuredData} />}
      header={<SiteHeader />}
      footer={<SiteFooter />}
    >
      <Suspense fallback={null}>
        <ContactPageClient contactFormAvailable={contactFormAvailable} />
      </Suspense>

      <ServicesFaqSection faqs={contactFaqs} />
    </MainTemplate>
  );
}
