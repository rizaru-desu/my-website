"use client";

export type MessageFilter = "all" | "unread" | "archived";

export type MessageRecord = {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  preview: string;
  body: string;
  date: string;
  company: string;
  archived: boolean;
  read: boolean;
};

export const messageSeedRecords: MessageRecord[] = [
  {
    id: "msg-01",
    senderName: "Amanda Liu",
    senderEmail: "amanda@northfoundry.co",
    subject: "Portfolio review request for senior product design role",
    preview:
      "We are hiring for a design systems lead and your portfolio stood out for its clarity and presentation.",
    body:
      "Hi Rizal,\n\nI came across your portfolio while reviewing candidates for a senior product design role at North Foundry. The way you frame process, constraints, and outcomes feels very recruiter-friendly without losing visual energy. If you are open to a conversation next week, I would love to share more about the role and get your thoughts.\n\nBest,\nAmanda",
    date: "Mar 18, 2026",
    company: "North Foundry",
    archived: false,
    read: false,
  },
  {
    id: "msg-02",
    senderName: "Rico Pranata",
    senderEmail: "rico@atelierframe.id",
    subject: "Interested in collaborating on a branded microsite",
    preview:
      "We have a short editorial campaign and your work feels like a strong fit for the direction.",
    body:
      "Hello Rizal,\n\nI am reaching out from Atelier Frame. We are planning a branded microsite for a campaign launch and I think your editorial UI approach could fit the tone really well. Would you be available for a quick intro call this week?\n\nRegards,\nRico",
    date: "Mar 17, 2026",
    company: "Atelier Frame",
    archived: false,
    read: true,
  },
  {
    id: "msg-03",
    senderName: "Nadia Kurnia",
    senderEmail: "nadia@halcyon.vc",
    subject: "Resume and case study follow-up",
    preview:
      "Thanks again for sharing your materials. I wanted to ask a few follow-up questions before the panel review.",
    body:
      "Hi Rizal,\n\nThank you for sending over your resume and selected case studies. Before we move to the next review round, could you share a little more about your role in the portfolio CMS concept and how much of the front-end implementation you owned directly?\n\nWarmly,\nNadia",
    date: "Mar 16, 2026",
    company: "Halcyon Ventures",
    archived: false,
    read: false,
  },
  {
    id: "msg-04",
    senderName: "Kevin Tan",
    senderEmail: "kevin@signaldock.com",
    subject: "Checking availability for a short design audit",
    preview:
      "Our team needs a quick product UX pass and I wanted to check your availability in April.",
    body:
      "Rizal,\n\nYour portfolio has the right balance of energy and rigor for the kind of audit we need. We are exploring a short engagement in April to review our onboarding and dashboard flows. Let me know if you are available and what your preferred next step would be.\n\nThanks,\nKevin",
    date: "Mar 14, 2026",
    company: "Signal Dock",
    archived: true,
    read: true,
  },
  {
    id: "msg-05",
    senderName: "Sinta Mahendra",
    senderEmail: "sinta@publicgrid.co",
    subject: "Recruiter intro and portfolio feedback",
    preview:
      "Your landing page felt memorable in a strong way, and I wanted to introduce myself for future openings.",
    body:
      "Hi Rizal,\n\nI recruit for product and front-end design roles at Public Grid. I am not hiring for your exact profile this week, but I wanted to say your portfolio presentation is one of the clearest I have seen recently. I would love to keep in touch for future openings on our team.\n\nBest,\nSinta",
    date: "Mar 12, 2026",
    company: "Public Grid",
    archived: true,
    read: false,
  },
];
