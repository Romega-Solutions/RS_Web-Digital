"use client";

import type { TeamMember } from "@/lib/constants";
import { useState } from "react";
import { TeamCarousel } from "./TeamCarousel";
import { TeamMemberSidebar } from "./TeamMemberSidebar";

export function AboutExpertsSection() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  return (
    <>
      <TeamCarousel onMemberClick={setSelectedMember} />
      <TeamMemberSidebar
        isOpen={selectedMember !== null}
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </>
  );
}
