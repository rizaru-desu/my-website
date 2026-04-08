export type Profile = {
  name: string;
  role: string;
  location: string;
  availability: string;
  tagline: string;
  intro: string;
  email: string;
  focus: string[];
  stats: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  socialLinks: Array<{
    label: string;
    href: string;
  }>;
};

export type SkillGroup = {
  title: string;
  description: string;
  skills: string[];
};

export type ProjectMetric = {
  label: string;
  value: string;
};

export type Project = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  year: string;
  impact: string;
  client: string;
  role: string;
  duration: string;
  techStack: string[];
  accent: "red" | "blue" | "cream";
  metrics: ProjectMetric[];
  challenge: string;
  process: string[];
  outcome: string;
  gallery: Array<{
    title: string;
    caption: string;
  }>;
  featured: boolean;
};

export type BlogPost = {
  slug: string;
  title: string;
  summary: string;
  date: string;
  readingTime: string;
  tags: string[];
  featured: boolean;
  kicker: string;
  quote: string;
  callout: string;
  sections: Array<{
    heading: string;
    paragraphs: string[];
  }>;
};

export type ExperienceItem = {
  role: string;
  company: string;
  period: string;
  location: string;
  summary: string;
  achievements: string[];
};

export type EducationItem = {
  degree: string;
  school: string;
  period: string;
  description: string;
  highlights: string[];
};

export type CertificateItem = {
  name: string;
  issuer: string;
  year: string;
  verificationLink: string;
  credentialId?: string;
  featured?: boolean;
};

export type AdminMetric = {
  label: string;
  value: string;
  change: string;
  note: string;
  accent: "red" | "blue" | "cream";
};

export type AdminCollection = {
  title: string;
  itemCount: string;
  status: string;
  description: string;
  href: string;
  accent: "red" | "blue" | "cream";
};

export type AdminActivity = {
  title: string;
  meta: string;
  detail: string;
  accent: "red" | "blue" | "cream";
};

export const profile: Profile = {
  name: "Rizal Achmad",
  role: "Full-Stack Product Engineer",
  location: "Jakarta, Indonesia",
  availability: "Available for selective 2026 opportunities",
  tagline:
    "Designing fast, memorable portfolio products that feel as sharp as the work behind them.",
  intro:
    "I build web experiences that give recruiters clarity fast: sharp storytelling, credible product thinking, and execution details that hold up under pressure.",
  email: "rizal@example.com",
  focus: [
    "Product-minded engineering",
    "Frontend systems with strong visual direction",
    "CMS and dashboard experience design",
  ],
  stats: [
    {
      label: "Projects shipped",
      value: "18",
      detail: "Across SaaS, internal tools, and brand sites",
    },
    {
      label: "Years building",
      value: "6+",
      detail: "From freelance delivery to product teams",
    },
    {
      label: "Avg. launch cycle",
      value: "3 wks",
      detail: "Prototype to polished stakeholder-ready UI",
    },
  ],
  socialLinks: [
    { label: "GitHub", href: "https://github.com/" },
    { label: "LinkedIn", href: "https://linkedin.com/" },
    { label: "Email", href: "mailto:hello@rizaru-desu.my.id" },
  ],
};

export const skillGroups: SkillGroup[] = [
  {
    title: "Frontend Systems",
    description:
      "Interfaces that feel editorial, deliberate, and easy to scan.",
    skills: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Design Systems",
      "Accessibility",
    ],
  },
  {
    title: "Product Delivery",
    description:
      "Turning briefs into clear flows, believable UI, and launch-ready scope.",
    skills: [
      "UX Strategy",
      "CMS Planning",
      "Dashboard Design",
      "Stakeholder Reviews",
      "Rapid Prototyping",
    ],
  },
  {
    title: "Technical Range",
    description:
      "Enough backend and platform fluency to build realistic product experiences.",
    skills: [
      "Node.js",
      "PostgreSQL",
      "Prisma",
      "REST APIs",
      "Analytics Thinking",
      "Content Modeling",
    ],
  },
  {
    title: "CMS / Dashboard Experience",
    description:
      "Admin flows shaped to feel maintainable, readable, and production-minded.",
    skills: [
      "Content Operations",
      "Admin Navigation",
      "Form Architecture",
      "Table Workflows",
      "Moderation UI",
      "Inbox Surfaces",
    ],
  },
];

export const projects: Project[] = [
  {
    slug: "pulse-cms-portfolio",
    title: "Pulse CMS Portfolio",
    summary:
      "A recruiter-friendly portfolio and content studio concept built to let one creator manage projects, writing, and proof without touching code.",
    category: "Portfolio Platform",
    year: "2026",
    impact:
      "Clarified content hierarchy and reduced admin friction in the core showcase experience.",
    client: "Personal Product Concept",
    role: "Product Designer + Full-Stack Engineer",
    duration: "4 weeks",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Mock CMS"],
    accent: "red",
    metrics: [
      { label: "Public sections", value: "6" },
      { label: "Mock entities", value: "24" },
      { label: "Hero scan time", value: "<10 sec" },
    ],
    challenge:
      "Most portfolio sites either look generic or bury proof beneath decoration. The goal was to create a high-energy system that still lets a recruiter understand value quickly.",
    process: [
      "Mapped the recruiter journey into three beats: credibility, work evidence, and contact confidence.",
      "Built a visual language around poster-style framing, heavy borders, and headline hierarchy instead of illustration.",
      "Structured mock CMS content to prove the site could scale into admin-managed projects, writing, and resume updates later.",
    ],
    outcome:
      "The final concept balances personality with trust. It feels distinct on first glance but remains easy to scan, making it better suited for real hiring contexts than a novelty portfolio.",
    gallery: [
      {
        title: "Hero Composition",
        caption:
          "Layered title treatment, stat strip, and recruiter CTAs tuned for fast first impressions.",
      },
      {
        title: "Content Grid",
        caption:
          "Poster-like cards that make projects feel curated rather than dumped into a list.",
      },
      {
        title: "Resume Surface",
        caption:
          "A print-inspired resume page translated into a modern web layout.",
      },
    ],
    featured: true,
  },
  {
    slug: "northstar-sales-kit",
    title: "Northstar Sales Kit",
    summary:
      "A bold B2B microsite system that helped a sales team package product proof, feature stories, and launch decks into one coherent destination.",
    category: "Marketing Experience",
    year: "2025",
    impact:
      "Turned fragmented launch assets into one faster-to-share sales narrative.",
    client: "Northstar SaaS",
    role: "Frontend Lead",
    duration: "3 weeks",
    techStack: ["Next.js", "Contentful", "Framer Motion", "Figma"],
    accent: "blue",
    metrics: [
      { label: "Launch modules", value: "12" },
      { label: "Stakeholder teams", value: "4" },
      { label: "Review cycles", value: "2" },
    ],
    challenge:
      "Sales enablement material existed across decks, docs, and demo notes. The challenge was to make it persuasive without becoming another cluttered marketing page.",
    process: [
      "Created a modular page architecture with interchangeable proof panels and quote blocks.",
      "Used a highly visible typography system so new messaging could be swapped in quickly without redesigning each page.",
      "Focused on making each section self-sufficient for quick skim reading in live calls.",
    ],
    outcome:
      "The team gained a cleaner way to present launch messaging with fewer ad hoc deck requests and a more consistent demo narrative.",
    gallery: [
      {
        title: "Launch Header",
        caption:
          "Oversized message framing with support metrics placed directly beneath.",
      },
      {
        title: "Proof Modules",
        caption:
          "Reusable cards for adoption stats, customer quotes, and comparison points.",
      },
      {
        title: "CTA Rail",
        caption:
          "A sticky side rail to help sales teams jump between deck, demo, and docs.",
      },
    ],
    featured: true,
  },
  {
    slug: "atlas-ops-dashboard",
    title: "Atlas Ops Dashboard",
    summary:
      "An operations dashboard concept that translates complex workflow health into a friendlier, more explainable interface for non-technical managers.",
    category: "Internal Tooling",
    year: "2024",
    impact:
      "Improved information density while reducing the intimidation factor of enterprise UI.",
    client: "Atlas Logistics",
    role: "UI Engineer",
    duration: "5 weeks",
    techStack: ["React", "TypeScript", "Charts", "Design Tokens"],
    accent: "cream",
    metrics: [
      { label: "Workflow views", value: "8" },
      { label: "Data states", value: "30+" },
      { label: "Key audience", value: "Ops Leads" },
    ],
    challenge:
      "The product needed to present complex operational signals without looking hostile to stakeholders who only visited it a few times a week.",
    process: [
      "Reframed the information architecture around exceptions, trends, and direct next actions.",
      "Used strong panels and color markers to separate healthy state from intervention state at a glance.",
      "Tested a lighter content tone to make the tooling feel less punitive and more collaborative.",
    ],
    outcome:
      "The resulting direction made the dashboard easier to walk through in meetings and gave the team a better foundation for future admin tooling.",
    gallery: [
      {
        title: "Signal Board",
        caption:
          "Exception-first layout that brings urgent states above the fold.",
      },
      {
        title: "Trend Story",
        caption:
          "Charts framed as management summaries rather than isolated metrics.",
      },
      {
        title: "Action Detail",
        caption:
          "A clearer detail view with contextual notes and linked ownership.",
      },
    ],
    featured: false,
  },
];

export const blogPosts: BlogPost[] = [
  {
    slug: "designing-portfolios-for-recruiter-attention",
    title: "Designing Portfolios for Recruiter Attention",
    summary:
      "A practical breakdown of how to make personal work feel distinct without sacrificing trust, clarity, or hiring relevance.",
    date: "March 2026",
    readingTime: "6 min read",
    tags: ["Portfolio", "UX", "Personal Branding"],
    featured: true,
    kicker: "Field Notes",
    quote:
      "A memorable portfolio is not the one with the loudest animation. It is the one that makes evidence feel effortless to find.",
    callout:
      "Recruiters are not reading your site like a case-study jury. They are scanning for confidence, relevance, and signal density.",
    sections: [
      {
        heading: "Start With the Hiring Context",
        paragraphs: [
          "Portfolio design gets better when we stop treating it like a blank artboard and start treating it like a hiring conversation. The first job of the homepage is to explain what kind of builder you are and why your work is credible.",
          "That means the hero should not only feel distinctive. It should also answer role, focus, and proof quickly enough that a recruiter can stay curious instead of confused.",
        ],
      },
      {
        heading: "Make Proof Obvious",
        paragraphs: [
          "Project cards should signal impact before they ask for attention. A sharp headline, a short summary, and one useful context line often outperform dense walls of copy.",
          "When each piece of work is framed with role, category, and outcome, the portfolio starts to feel easier to trust.",
        ],
      },
      {
        heading: "Style Should Organize, Not Distract",
        paragraphs: [
          "Bold visual direction works when it creates rhythm. Heavy borders, strong color blocks, and layered type can guide the eye if the content hierarchy remains disciplined.",
          "The goal is to create a site that feels authored, not chaotic.",
        ],
      },
    ],
  },
  {
    slug: "what-makes-a-ui-feel-premium",
    title: "What Makes a UI Feel Premium Without Feeling Cold",
    summary:
      "Why premium interfaces are less about luxury cues and more about confidence in spacing, sequence, and restraint.",
    date: "February 2026",
    readingTime: "5 min read",
    tags: ["UI Design", "Design Systems"],
    featured: true,
    kicker: "Perspective",
    quote:
      "Premium interfaces rarely shout through decoration alone. They feel expensive because every decision looks intentional.",
    callout:
      "A premium product can still be playful. The difference is that play serves hierarchy instead of replacing it.",
    sections: [
      {
        heading: "Confidence in Layout",
        paragraphs: [
          "A premium UI often has fewer competing ideas on screen at once. The spacing is generous where it matters and compressed only when density creates clarity.",
          "That confidence helps users understand what deserves attention first.",
        ],
      },
      {
        heading: "Visual Energy Needs Discipline",
        paragraphs: [
          "Strong color, typography, and motion are useful when they reinforce sequence. They become noise when every element asks to be the headline.",
          "The systems that age well usually reserve their loudest moves for the moments that matter most.",
        ],
      },
    ],
  },
  {
    slug: "building-ui-with-editorial-rhythm",
    title: "Building UI With Editorial Rhythm",
    summary:
      "Borrowing from magazine covers and print layouts can make product pages feel more intentional and easier to scan.",
    date: "January 2026",
    readingTime: "7 min read",
    tags: ["Editorial", "Frontend", "Layout"],
    featured: false,
    kicker: "Process",
    quote:
      "Editorial rhythm is what makes a page feel paced. It gives the eye places to sprint, pause, and settle.",
    callout:
      "Think in beats: headline, proof, explanation, release. The best interfaces move like a story, not a spreadsheet.",
    sections: [
      {
        heading: "Think in Beats",
        paragraphs: [
          "Editorial layouts are effective because they understand pacing. They know when to present a dominant message, when to shift to supporting evidence, and when to let the reader breathe.",
          "That pacing translates well to digital products, especially portfolios and launch pages.",
        ],
      },
      {
        heading: "Use Contrast Intentionally",
        paragraphs: [
          "If everything is framed the same way, nothing feels important. Introduce contrast through scale, density, and shape rather than relying on random visual tricks.",
          "A larger section title, a tighter stat strip, or a quieter text block can all change the tempo of a page.",
        ],
      },
    ],
  },
];

export const experiences: ExperienceItem[] = [
  {
    role: "Senior Frontend Engineer",
    company: "Studio North",
    period: "2024 - Present",
    location: "Remote",
    summary:
      "Leading product UI delivery for brand-forward marketing surfaces and internal CMS tools.",
    achievements: [
      "Shipped reusable UI patterns that shortened new page delivery for launch work.",
      "Partnered with design to turn high-concept directions into responsive systems.",
      "Improved stakeholder review quality by using realistic mock content in early prototypes.",
    ],
  },
  {
    role: "Product Engineer",
    company: "Bento Works",
    period: "2022 - 2024",
    location: "Jakarta",
    summary:
      "Built customer-facing dashboards, onboarding flows, and content management interfaces for growing SaaS teams.",
    achievements: [
      "Created component patterns for dense product views without losing readability.",
      "Worked across frontend and API shape discussions to keep delivery grounded in real workflows.",
      "Owned several recruiter-facing and sales-facing marketing pages end to end.",
    ],
  },
  {
    role: "Freelance Web Designer & Developer",
    company: "Independent",
    period: "2020 - 2022",
    location: "Remote",
    summary:
      "Delivered portfolio sites, microsites, and visual identity-driven landing pages for startups and creators.",
    achievements: [
      "Balanced fast turnaround with tailored visual systems instead of template-driven sites.",
      "Built trust with clients through clearer scoping, content framing, and launch polish.",
    ],
  },
];

export const education: EducationItem[] = [
  {
    degree: "B.S. in Information Systems",
    school: "Universitas Multimedia",
    period: "2018 - 2022",
    description:
      "Focused on web engineering, product thinking, and interactive systems.",
    highlights: [
      "UI engineering track",
      "Capstone in digital product design",
      "Student tech community organizer",
    ],
  },
];

export const certificates: CertificateItem[] = [
  {
    name: "Google UX Design Certificate",
    issuer: "Google",
    year: "2023",
    verificationLink: "https://example.com/google-ux-certificate",
    credentialId: "GUX-2023-1842",
    featured: true,
  },
  {
    name: "Meta Front-End Developer Certificate",
    issuer: "Meta",
    year: "2022",
    verificationLink: "https://example.com/meta-frontend-certificate",
    credentialId: "META-FE-2207",
    featured: false,
  },
];

export const testimonials = [
  {
    name: "Maya Hartono",
    role: "Lead Recruiter, Finch Labs",
    quote:
      "Rizal presents work the way strong candidates actually need to: clear outcomes first, process second, and personality throughout.",
  },
  {
    name: "Arif Nugraha",
    role: "Product Manager, Studio North",
    quote:
      "He can take a visually ambitious direction and turn it into a UI system that still feels practical to ship.",
  },
];

export const adminMetrics: AdminMetric[] = [
  {
    label: "Published Projects",
    value: "12",
    change: "+2 this month",
    note: "Fresh case studies are keeping the portfolio story current.",
    accent: "red",
  },
  {
    label: "Blog Posts Live",
    value: "08",
    change: "+1 this week",
    note: "Writing inventory supports personal branding and recruiter context.",
    accent: "blue",
  },
  {
    label: "Messages Flagged",
    value: "05",
    change: "2 need replies",
    note: "Incoming recruiter and collaborator messages surfaced for fast follow-up.",
    accent: "cream",
  },
  {
    label: "Resume Sync",
    value: "98%",
    change: "Ready to publish",
    note: "Public profile, skill mix, and experience timeline are aligned.",
    accent: "blue",
  },
];

export const adminCollections: AdminCollection[] = [
  {
    title: "Profile & Resume",
    itemCount: "14 fields",
    status: "Ready",
    description:
      "Core identity, availability, links, and resume highlights that drive the public hero and resume route.",
    href: "/admin/profile",
    accent: "blue",
  },
  {
    title: "Account Settings",
    itemCount: "6 controls",
    status: "Security Preview",
    description:
      "Login identity, password and email changes, 2FA setup, and delete-account confirmation in a dedicated surface.",
    href: "/admin/account",
    accent: "red",
  },
  {
    title: "Projects Library",
    itemCount: `${projects.length} entries`,
    status: "In Review",
    description:
      "Case-study cards, detail-page content, metrics, and featured ordering for the public work archive.",
    href: "/admin/projects",
    accent: "red",
  },
  {
    title: "Blog Editorial",
    itemCount: `${blogPosts.length} entries`,
    status: "Draft + Live",
    description:
      "Article lineup with tag organization, featured stories, and editorial framing for the thought-leadership side.",
    href: "/admin/blog",
    accent: "cream",
  },
];

export const adminActivity: AdminActivity[] = [
  {
    title: "Homepage hero copy revised",
    meta: "12 minutes ago • Profile",
    detail:
      "Updated the hero promise to position the product as a recruiter-facing portfolio paired with a content studio.",
    accent: "red",
  },
  {
    title: "Pulse CMS Portfolio moved to featured slot",
    meta: "43 minutes ago • Projects",
    detail:
      "Featured ordering adjusted so the strongest portfolio-plus-CMS case appears first in the public project rail.",
    accent: "blue",
  },
  {
    title: "Resume summary aligned with public bio",
    meta: "Today • Resume",
    detail:
      "Profile summary now matches the messaging used on landing and resume routes for stronger consistency.",
    accent: "cream",
  },
];

export const adminQueue = [
  {
    title: "Profile polish",
    status: "Ready to publish",
    note: "Availability badge, intro paragraph, and social CTA are aligned.",
  },
  {
    title: "Project refresh",
    status: "Needs review",
    note: "Atlas Ops Dashboard still needs updated outcome copy before it goes live.",
  },
  {
    title: "Blog cadence",
    status: "Drafting",
    note: "Two more writing prompts are staged for the next editorial batch.",
  },
];

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export const featuredProjects = projects.filter((project) => project.featured);
export const featuredPosts = blogPosts.filter((post) => post.featured);
