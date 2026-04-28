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

export const talentProfiles: TalentProfile[] = [
  {
    id: "TL-101",
    name: "Alyssa Mendoza",
    role: "Executive Assistant",
    location: "Philippines",
    category: "Virtual Assistant",
    experienceLevel: "Senior",
    tagline: "Calm operations support for founders managing multiple markets.",
    skills: ["Executive Support", "Inbox Management", "Calendar Planning", "Client Coordination"],
  },
  {
    id: "TL-102",
    name: "Noah Villanueva",
    role: "Brand Strategist",
    location: "Singapore",
    category: "Designers",
    experienceLevel: "Lead",
    tagline: "Shapes positioning, messaging, and launch narratives for growth-stage brands.",
    skills: ["Brand Strategy", "Positioning", "Campaign Planning", "Creative Direction"],
  },
  {
    id: "TL-103",
    name: "Mika Santos",
    role: "Full-Stack Developer",
    location: "Philippines",
    category: "Developers",
    experienceLevel: "Senior",
    tagline: "Builds reliable product experiences with clean delivery habits.",
    skills: ["React", "Next.js", "TypeScript", "Node.js"],
  },
  {
    id: "TL-104",
    name: "Ethan Cruz",
    role: "Sales Enablement Specialist",
    location: "United States",
    category: "Sales Experts",
    experienceLevel: "Mid-Level",
    tagline: "Turns pipeline friction into repeatable outbound and follow-up systems.",
    skills: ["Sales Ops", "CRM Hygiene", "Lead Qualification", "Reporting"],
  },
  {
    id: "TL-105",
    name: "Leah Ramos",
    role: "UI/UX Designer",
    location: "Philippines",
    category: "Designers",
    experienceLevel: "Senior",
    tagline: "Designs conversion-focused interfaces with strong product intuition.",
    skills: ["Product Design", "Figma", "Design Systems", "User Research"],
  },
  {
    id: "TL-106",
    name: "Daniel Mercado",
    role: "AI/ML Engineer",
    location: "Canada",
    category: "AI/ML Engineer",
    experienceLevel: "Principal",
    tagline: "Brings applied AI systems into production without losing operational clarity.",
    skills: ["Python", "LLM Workflows", "MLOps", "Data Pipelines"],
  },
  {
    id: "TL-107",
    name: "Sophia Navarro",
    role: "Account Manager",
    location: "Australia",
    category: "Account Manager",
    experienceLevel: "Senior",
    tagline: "Keeps complex client relationships steady, visible, and commercially healthy.",
    skills: ["Client Success", "Stakeholder Management", "Renewals", "Presentation Skills"],
  },
  {
    id: "TL-108",
    name: "Jacob Flores",
    role: "Front-End Developer",
    location: "Philippines",
    category: "Developers",
    experienceLevel: "Mid-Level",
    tagline: "Sharp on responsive UI builds and handoff quality.",
    skills: ["React", "CSS", "Accessibility", "Performance"],
  },
];
