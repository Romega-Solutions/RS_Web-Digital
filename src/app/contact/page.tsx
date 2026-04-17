import type { Metadata } from "next";
import { SiteFooter } from "../../components/SiteFooter";
import { SiteHeader } from "../../components/SiteHeader";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = {
  title: "Contact | Romega Solutions",
  description:
    "Get in touch with Romega Solutions for business inquiries, partnerships, and strategic support.",
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
