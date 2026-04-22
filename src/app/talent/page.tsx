import type { Metadata } from "next";
import { SiteFooter } from "@/components/organisms/layout/SiteFooter";
import { SiteHeader } from "@/components/organisms/layout/SiteHeader";
import { TalentCTA } from "@/components/organisms/talent/TalentCTA";
import { TalentPool } from "@/components/organisms/talent/TalentPool";
import { talentProfiles } from "@/components/organisms/talent/talentData";
import TalentPageClient from "./TalentPageClient";

export const metadata: Metadata = {
  title: "Talent | Romega Solutions",
  description:
    "Browse a curated Romega talent pool across operations, brand, sales, and digital delivery.",
  alternates: {
    canonical: "/talent",
  },
};

export default function TalentPage() {
  return (
    <div className="site-shell" id="top">
      <SiteHeader activeItem="Careers & Talents" />
      <main>
        <TalentPageClient />
        <TalentPool talents={talentProfiles} />
        <TalentCTA />
      </main>
      <SiteFooter />
    </div>
  );
}
