export type TeamMember = {
  id: string;
  name: string;
  title: string;
  role: string;
  image: string;
  bio: string | string[];
  expertise: string[];
  achievements: string[];
  linkedin?: string;
};

export type Testimonial = {
  id: string;
  name: string;
  title: string;
  school: string;
  image?: string;
  rating: number;
  quote: string;
  linkedin?: string;
};

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "eliza-mae-perez",
    name: "Eliza Mae Perez",
    title: "Bookkeeper",
    role: "Bookkeeper",
    image: "/images/about/IC/IC_Bookkeeper_Eliza.png",
    bio: "Detail-oriented bookkeeper focused on accurate financial records, clean reporting, and reliable accounting support.",
    expertise: ["Financial record keeping", "Accounts reconciliation", "Compliance support"],
    achievements: ["Financial analysis", "Process improvement", "Accounting software"],
    linkedin: "https://www.linkedin.com/in/edmayelle-villavicencio-alforja-8a1580199/",
  },
  {
    id: "robbie-galoso",
    name: "Robbie Galoso",
    title: "Founder and CEO",
    role: "Founder and CEO",
    image: "/images/about/IC/IC_CEO_Robbie.png",
    bio: "Visionary leader driving company growth, business strategy, and long-term client partnerships.",
    expertise: ["Strategic leadership", "Business development", "Organizational growth"],
    achievements: ["Innovation", "Entrepreneurship", "Team building"],
    linkedin: "https://www.linkedin.com/in/robbie-galoso-9913389/",
  },
  {
    id: "christine-valencia",
    name: "Christine Valencia",
    title: "HR Business Partner & Recruiter",
    role: "HR Business Partner & Recruiter",
    image: "/images/about/IC/IC_Recruitment_Christine.jpg",
    bio: "HR business partner and recruiter focused on strategic talent acquisition and strong business partnerships.",
    expertise: ["HR business partnering", "Strategic recruitment", "Stakeholder management"],
    achievements: ["Talent strategy", "Employer branding", "Workforce planning"],
    linkedin: "https://www.linkedin.com/",
  },
  {
    id: "erich-belle-macabuhay",
    name: "Erich Belle F. Macabuhay",
    title: "Onboarding Lead",
    role: "Onboarding Lead",
    image: "/images/about/IC/IC_Onboarding_Erich.webp",
    bio: "Onboarding lead focused on smooth employee transitions, clear handoffs, and people-first internal support.",
    expertise: ["Employee onboarding", "HR operations", "Process coordination"],
    achievements: ["Onboarding systems", "Team coordination", "Employee support"],
    linkedin: "https://www.linkedin.com/",
  },
  {
    id: "princess-ramada-usman",
    name: "Princess Ramada Usman",
    title: "Executive Assistant",
    role: "Executive Assistant",
    image: "/images/about/IC/IC_Executive_Assistant_Princess.svg",
    bio: "Executive assistant supporting leadership coordination, operational follow-through, and day-to-day administrative clarity.",
    expertise: ["Executive support", "Administrative coordination", "Schedule management"],
    achievements: ["Leadership support", "Operations assistance", "Workflow coordination"],
    linkedin: "https://www.linkedin.com/",
  },
  {
    id: "aaron-garcia",
    name: "Aaron Garcia",
    title: "Social Media Coordinator",
    role: "Social Media Coordinator",
    image: "/images/about/IC/IC_Social_Media_Aaron.webp",
    bio: "Social media coordinator supporting brand presence, content scheduling, and audience engagement across digital channels.",
    expertise: ["Social media coordination", "Content planning", "Community engagement"],
    achievements: ["Content calendars", "Brand communication", "Digital campaigns"],
    linkedin: "https://www.linkedin.com/",
  },
  {
    id: "rhenalyn-inot",
    name: "Rhenalyn Inot",
    title: "Social Media Coordinator",
    role: "Social Media Coordinator",
    image: "/images/about/IC/IC_Social_Media_Rhenalyn.webp",
    bio: "Social media coordinator focused on consistent brand communication, campaign support, and content execution.",
    expertise: ["Content execution", "Social media support", "Brand coordination"],
    achievements: ["Campaign support", "Audience engagement", "Content operations"],
    linkedin: "https://www.linkedin.com/",
  },
  {
    id: "ken-patrick-garcia",
    name: "Ken Patrick Garcia",
    title: "Former Full Stack AI Engineer",
    role: "Former Full Stack AI Engineer",
    image: "/images/about/IC/IC_Web_Developer_Ken.jpg",
    bio: "Full-stack developer specializing in modern web and mobile applications with AI and cloud integration.",
    expertise: [
      "React, Next.js, and Node.js",
      "Mobile development",
      "AI integration and cloud computing",
    ],
    achievements: ["AI-powered solutions", "IoT systems", "Scalable architecture"],
    linkedin: "https://www.linkedin.com/",
  },
  {
    id: "mark-siazon",
    name: "Mark Siazon",
    title: "Former UI/UX Product Designer",
    role: "Former UI/UX Product Designer",
    image: "/images/about/IC/IC_UI_UX_Designer_Mark.png",
    bio: [
      "Shaping ideas into digital experiences",
      "Blending product thinking and design craft",
      "Creating results that make an impact",
    ],
    expertise: ["UX design", "Figma and prototyping", "Design systems"],
    achievements: ["Product research", "Interface design", "Interactive prototypes"],
    linkedin: "https://www.linkedin.com/in/mark-siazon/",
  },
  {
    id: "duane-vargas",
    name: "Duane Vargas",
    title: "Head of AI Operations",
    role: "Head of AI Operations",
    image: "/images/about/IC/IC_Recruiter_Duane.jpg",
    bio: "Recruiter specializing in identifying strong talent and aligning HR strategies with business needs.",
    expertise: ["Talent acquisition", "HR business partnering", "Recruitment strategy"],
    achievements: ["Strategic HR", "Talent development", "Organizational development"],
    linkedin: "https://www.linkedin.com/",
  },
  {
    id: "rich-salvador",
    name: "Rich Salvador",
    title: "Account Executive & Associate",
    role: "Account Executive & Associate",
    image: "/images/about/IC/IC_Account_Executive_Associate_Rich.png",
    bio: [
      "Account executive focused on client relationships and growth",
      "Supports sales training and development programs",
      "Detail-oriented partner for client-facing execution",
    ],
    expertise: ["Account management", "Sales support", "Client communication"],
    achievements: ["Sales development", "Client coordination", "Relationship building"],
    linkedin: "https://www.linkedin.com/in/ricardo-salvador-cssyb-5463a9321/",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "rob-belarmino",
    name: "Rob Belarmino",
    title: "Former Intern",
    school: "University of the Philippines",
    image: "/images/about/Rob.webp",
    rating: 4,
    quote:
      "As a freshman, my first internship at Romega turned daunting expectations into a supportive, skill-building experience that grew my confidence and gratitude.",
    linkedin: "https://www.linkedin.com/in/rob-belarmino/",
  },
  {
    id: "gerard-palma",
    name: "Gerard Palma",
    title: "Account Executive Intern",
    school: "University of the Philippines",
    image: "/images/about/PALMA.webp",
    rating: 5,
    quote:
      "As an Account Executive Intern, I learned how to build client relationships and strengthen my communication skills.",
    linkedin: "https://www.linkedin.com/in/gerard-francis-palma-32639a212/",
  },
  {
    id: "eiran-penaflor",
    name: "Eiran John Peñaflor",
    title: "Account Executive Intern",
    school: "University of the Philippines",
    image: "/images/about/Peñaflor.webp",
    rating: 5,
    quote:
      "My internship as an Account Executive helped me grow in client engagement, adaptability, and teamwork.",
    linkedin: "https://www.linkedin.com/in/eiran-john-pe%C3%B1aflor-aa48332bb/",
  },
  {
    id: "katrina-ignacio",
    name: "Katrina Ignacio",
    title: "Account Executive Intern",
    school: "Bulacan State University",
    image: "/images/about/Katrina.webp",
    rating: 5,
    quote:
      "Romega was the first company that gave me a chance to experience the corporate world. I walked in with nothing but curiosity and determination.",
    linkedin: "https://www.linkedin.com/in/katrina-ignacio/",
  },
  {
    id: "edmayelle-alforja",
    name: "Edmayelle Alforja",
    title: "Market Intelligence Intern",
    school: "University of Sto. Tomas",
    image: "/images/about/Edmayelle.jpg",
    rating: 5,
    quote:
      "My internship at Romega Solutions deepened my understanding of semiconductors through real-world analytics, while the collaborative culture strengthened my skills in research and strategic thinking.",
    linkedin: "https://www.linkedin.com/in/edmayelle-alforja/",
  },
  {
    id: "lyle-paraboles",
    name: "Lyle Joseph P. Paraboles",
    title: "Former Human Resources Intern",
    school: "University of Sto. Tomas",
    image: "/images/about/Lyle.jpg",
    rating: 5,
    quote:
      "My time at Romega Solutions gave me meaningful, hands-on experience in technical recruitment and market research while sharpening both my analytical thinking and attention to detail.",
    linkedin: "https://www.linkedin.com/",
  },
];
