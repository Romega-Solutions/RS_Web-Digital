import { TalentHero } from "@/components/organisms/talent/TalentHero";
import type { TalentProfile } from "@/components/organisms/talent/talentData";

type TalentPageClientProps = {
  talents: TalentProfile[];
};

export default function TalentPageClient({ talents }: TalentPageClientProps) {
  const categories = new Set(talents.map((talent) => talent.category));
  const locations = new Set(talents.map((talent) => talent.location));

  return (
    <TalentHero
      totalTalents={talents.length}
      totalCategories={categories.size}
      totalLocations={locations.size}
    />
  );
}
