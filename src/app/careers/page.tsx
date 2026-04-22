import type { Metadata } from "next";
import { SiteFooter } from "@/components/organisms/layout/SiteFooter";
import { SiteHeader } from "@/components/organisms/layout/SiteHeader";
import CareersPageClient from "./CareersPageClient";

export const metadata: Metadata = {
  title: "Careers | Romega Solutions",
  description:
    "Explore mock Romega Solutions career opportunities and learn how the team works, hires, and protects candidate privacy.",
  alternates: {
    canonical: "/careers",
  },
};

export default function CareersPage() {
  return (
    <div className="site-shell" id="top">
      <SiteHeader activeItem="Careers" />
      <CareersPageClient />
      <SiteFooter />
    </div>
  );
}
