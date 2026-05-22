export type TalentProfile = {
  id: string;
  name: string;
  role: string;
  location: string;
  category: string;
  experienceLevel: "Junior" | "Mid-Level" | "Senior" | "Lead" | "Principal";
  tagline: string;
  skills: string[];
};

// The public talent directory is intentionally empty. Romega Solutions
// surfaces talent through direct outreach, not a public catalog — clients
// reach out via /contact or "Talk to a talent specialist", and
// candidates submit profiles via "Send Your Profile" (mailto:info@).
//
// The TalentProfile type is kept so the TalentPool/TalentCard components
// stay compilable for future use; the public /talent page should not
// render TalentPool while this array is empty.
export const talentProfiles: TalentProfile[] = [];
