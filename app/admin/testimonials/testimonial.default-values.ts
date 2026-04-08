import { testimonials } from "@/lib/mock-content";

export const testimonialStatusValues = ["pending", "approved", "rejected"] as const;

export type TestimonialStatus = (typeof testimonialStatusValues)[number];

export type TestimonialRecord = {
  id: string;
  name: string;
  role: string;
  company: string;
  message: string;
  rating: number;
  status: TestimonialStatus;
  featured: boolean;
  submittedAt: string;
};

const seededTestimonials: TestimonialRecord[] = [
  {
    id: "testimonial-maya-hartono",
    name: testimonials[0]?.name ?? "Maya Hartono",
    role: "Lead Recruiter",
    company: "Finch Labs",
    message:
      testimonials[0]?.quote ??
      "Rizal presents work the way strong candidates actually need to: clear outcomes first, process second, and personality throughout.",
    rating: 5,
    status: "approved",
    featured: true,
    submittedAt: "Mar 12, 2026",
  },
  {
    id: "testimonial-arif-nugraha",
    name: testimonials[1]?.name ?? "Arif Nugraha",
    role: "Product Manager",
    company: "Studio North",
    message:
      testimonials[1]?.quote ??
      "He can take a visually ambitious direction and turn it into a UI system that still feels practical to ship.",
    rating: 5,
    status: "approved",
    featured: false,
    submittedAt: "Mar 04, 2026",
  },
  {
    id: "testimonial-lina-pratama",
    name: "Lina Pratama",
    role: "Design Lead",
    company: "Northstar SaaS",
    message:
      "The delivery felt unusually mature for an early-stage portfolio concept. The work was clear, reviewable, and easy to trust.",
    rating: 4,
    status: "pending",
    featured: false,
    submittedAt: "Mar 18, 2026",
  },
  {
    id: "testimonial-dimas-putra",
    name: "Dimas Putra",
    role: "Engineering Manager",
    company: "Atlas Logistics",
    message:
      "Strong implementation partner, but this note needs a quick rewrite before it is public-facing because the phrasing still feels too internal.",
    rating: 3,
    status: "rejected",
    featured: false,
    submittedAt: "Feb 26, 2026",
  },
];

export const testimonialSeedRecords = seededTestimonials;
