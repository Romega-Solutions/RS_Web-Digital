import type { Metadata } from "next";
import { SiteFooter } from "../../components/SiteFooter";
import { SiteHeader } from "../../components/SiteHeader";
import { TalentCTA } from "../../components/TalentCTA";
import { TalentPool } from "../../components/TalentPool";
import { talentProfiles } from "../../components/talentData";
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
