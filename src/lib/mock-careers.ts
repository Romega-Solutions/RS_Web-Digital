export type CareerJob = {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  summary: string;
  skills: string[];
  applyUrl: string;
};

export const mockCareerJobs: CareerJob[] = [
  {
    id: "senior-talent-partner",
    title: "Senior Talent Partner",
    department: "Talent Solutions",
    location: "Remote, Philippines",
    type: "Full-time",
    summary:
      "Lead high-touch hiring across growth-stage clients, shape search strategy, and manage executive-caliber candidate pipelines.",
    skills: ["Executive search", "Stakeholder management", "Recruitment strategy"],
    applyUrl: "https://www.linkedin.com/company/romega-solutions/jobs/",
  },
  {
    id: "brand-growth-strategist",
    title: "Brand Growth Strategist",
    department: "Brand and Growth",
    location: "Hybrid, Metro Manila",
    type: "Contract",
    summary:
      "Translate business priorities into clear brand positioning, content direction, and go-to-market messaging for client engagements.",
    skills: ["Brand strategy", "Messaging", "Client consulting"],
    applyUrl: "https://www.linkedin.com/company/romega-solutions/jobs/",
  },
  {
    id: "operations-coordinator",
    title: "Operations Coordinator",
    department: "Strategic Operations",
    location: "Remote, APAC",
    type: "Full-time",
    summary:
      "Support internal delivery systems, improve workflows, and keep fast-moving client operations aligned across teams.",
    skills: ["Process design", "Documentation", "Cross-functional coordination"],
    applyUrl: "https://www.linkedin.com/company/romega-solutions/jobs/",
  },
  {
    id: "market-intelligence-associate",
    title: "Market Intelligence Associate",
    department: "Research",
    location: "Remote, Philippines",
    type: "Part-time",
    summary:
      "Build targeted research briefs, map competitive signals, and surface insights that support leadership hiring and growth planning.",
    skills: ["Research", "Analysis", "Presentation"],
    applyUrl: "https://www.linkedin.com/company/romega-solutions/jobs/",
  },
];
