import type { Metadata } from "next";
import { SiteFooter } from "@/components/organisms/layout/SiteFooter";
import { SiteHeader } from "@/components/organisms/layout/SiteHeader";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = {
  title: "Contact | Romega Solutions",
  description:
    "Get in touch with Romega Solutions for business inquiries, partnerships, and strategic support.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="site-shell" id="top">
      <SiteHeader />
      <ContactPageClient />
      <SiteFooter />
    </div>
  );
}
