import "dotenv/config";

import argon2 from "argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL;
const fallbackEmail = "admin@portfolio.local";
const fallbackPassword = "ChangeMe123!";
const email = process.env.SEED_USER_EMAIL?.trim() || fallbackEmail;
const password = process.env.SEED_USER_PASSWORD || fallbackPassword;
const name = process.env.SEED_USER_NAME || "Rizaru Desu";
const role = process.env.SEED_USER_ROLE || "architect";
const requestedUsername =
  process.env.SEED_USER_USERNAME ||
  email?.split("@")[0]?.toLowerCase().replace(/[^a-z0-9_]/g, "_");
const testimonialSeeds = [
  {
    id: "testimonial-maya-hartono",
    name: "Maya Hartono",
    role: "Lead Recruiter",
    company: "Finch Labs",
    message:
      "Rizal presents work the way strong candidates actually need to: clear outcomes first, process second, and personality throughout.",
    rating: 5,
    relation: "CLIENT",
    status: "APPROVED",
    featured: true,
  },
  {
    id: "testimonial-arif-nugraha",
    name: "Arif Nugraha",
    role: "Product Manager",
    company: "Studio North",
    message:
      "He can take a visually ambitious direction and turn it into a UI system that still feels practical to ship.",
    rating: 5,
    relation: "COLLEAGUE",
    status: "APPROVED",
    featured: true,
  },
  {
    id: "testimonial-lina-pratama",
    name: "Lina Pratama",
    role: "Design Lead",
    company: "Northstar SaaS",
    message:
      "Rizal brought unusual clarity to the work. The visual direction was bold, but the delivery always stayed practical and easy to review.",
    rating: 5,
    relation: "COLLEAGUE",
    status: "APPROVED",
    featured: true,
  },
  {
    id: "testimonial-bima-santoso",
    name: "Bima Santoso",
    role: "Engineering Manager",
    company: "Atlas Logistics",
    message:
      "He moves quickly without making the team feel rushed. Decisions are documented, tradeoffs are visible, and execution holds up under detail.",
    rating: 5,
    relation: "COLLEAGUE",
    status: "APPROVED",
    featured: true,
  },
  {
    id: "testimonial-nadia-ramadhani",
    name: "Nadia Ramadhani",
    role: "Product Designer",
    company: "Signal Commerce",
    message:
      "Working with Rizal felt collaborative from day one. He translated rough product thinking into UI that looked sharp and still made engineering sense.",
    rating: 4,
    relation: "COLLEAGUE",
    status: "APPROVED",
    featured: false,
  },
  {
    id: "testimonial-ferdiansyah-akbar",
    name: "Ferdiansyah Akbar",
    role: "Founder",
    company: "Harbor Studio",
    message:
      "He understands that portfolio work is not just about visuals. The structure, pacing, and proof all helped communicate credibility much faster.",
    rating: 4,
    relation: "CLIENT",
    status: "APPROVED",
    featured: false,
  },
  {
    id: "testimonial-sri-wahyuni",
    name: "Sri Wahyuni",
    role: "Talent Partner",
    company: "Meridian Labs",
    message:
      "This note is already strong, but I wanted to submit a more polished version after internal review because it reflects the collaboration better.",
    rating: 4,
    relation: "CLIENT",
    status: "PENDING",
    featured: false,
  },
  {
    id: "testimonial-raka-mahesa",
    name: "Raka Mahesa",
    role: "Frontend Engineer",
    company: "Studio North",
    message:
      "Rizal set a high bar for presentation quality while still keeping implementation constraints visible. The process felt organized and calm.",
    rating: 5,
    relation: "MENTOR",
    status: "PENDING",
    featured: false,
  },
  {
    id: "testimonial-dewi-amaranti",
    name: "Dewi Amaranti",
    role: "Operations Lead",
    company: "Tidal Works",
    message:
      "The collaboration was strong, but this draft includes too much internal wording and should be revised before it becomes public-facing proof.",
    rating: 3,
    relation: "CLIENT",
    status: "REJECTED",
    featured: false,
  },
  {
    id: "testimonial-eko-prabowo",
    name: "Eko Prabowo",
    role: "Independent Consultant",
    company: "Nusantara Digital",
    message:
      "I appreciated the energy and the ambition here, but the current wording still feels too vague to serve as a credible public testimonial.",
    rating: 3,
    relation: "OTHER",
    status: "REJECTED",
    featured: false,
  },
];
const blogSeeds = [
  {
    slug: "designing-editorial-rhythm-in-a-portfolio",
    title: "Designing Editorial Rhythm in a Portfolio",
    excerpt:
      "A practical look at how spacing, proof, and sequencing can make portfolio writing feel sharper before a recruiter reads every line.",
    category: "Field Notes",
    tags: ["Portfolio", "Content Strategy", "UX Writing"],
    coverImagePlaceholder: "Editorial rhythm cover",
    status: "PUBLISHED",
    featured: true,
    publishDate: new Date("2026-04-09T00:00:00.000Z"),
    readingTime: "6 min read",
    seoTitle: "Designing Editorial Rhythm in a Portfolio",
    seoDescription:
      "How to structure portfolio writing so each section earns attention and supports faster credibility.",
    content: `# Designing Editorial Rhythm in a Portfolio

Strong portfolio writing is not only about saying smart things. It is also about controlling pace, emphasis, and proof so the reader never has to wonder where the signal is.

![Pinned notes and layout sketches](https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80)

## Start with a strong editorial spine

The best portfolio pages feel edited, not merely filled. Each section should answer one useful question: what changed, why it mattered, and what makes the work believable.

- Lead with the outcome before the process
- Keep one idea per section
- Let evidence arrive at regular intervals

> Readers trust momentum when the writing keeps paying off.

## Map the reading flow before polishing copy

A quick diagram helps you see whether the page escalates cleanly from context to proof.

\`\`\`mermaid
flowchart TD
  A[Hero claim] --> B[Project context]
  B --> C[Constraints]
  C --> D[Key decisions]
  D --> E[Outcome proof]
  E --> F[Reflection]
\`\`\`

## Use image moments with purpose

An image works best when it lands next to a specific point. Instead of treating visuals like decoration, use them to reset attention and reinforce a claim the paragraph just made.

## End with an earned takeaway

Close the story with the principle you would reuse on the next project. That final reflection makes the article feel intentional rather than abruptly complete.`,
  },
  {
    slug: "using-diagrams-to-explain-product-decisions",
    title: "Using Diagrams to Explain Product Decisions",
    excerpt:
      "A lightweight editorial pattern for turning messy product tradeoffs into diagrams and annotated visuals that teams can scan quickly.",
    category: "Systems Thinking",
    tags: ["Mermaid", "Product Design", "Communication"],
    coverImagePlaceholder: "Decision diagram cover",
    status: "PUBLISHED",
    featured: true,
    publishDate: new Date("2026-04-11T00:00:00.000Z"),
    readingTime: "7 min read",
    seoTitle: "Using Diagrams to Explain Product Decisions",
    seoDescription:
      "How a simple diagram plus one supporting image can make product decision writing faster to review and easier to trust.",
    content: `# Using Diagrams to Explain Product Decisions

Product writing gets clearer when you turn hidden tradeoffs into visible structure. A small diagram can often replace two paragraphs of abstract explanation.

## Show the decision path, not only the final answer

When stakeholders only see the conclusion, they often reopen questions that were already settled. Diagrams help preserve the reasoning path.

\`\`\`mermaid
graph LR
  A[User friction reported] --> B{Is the issue recurring?}
  B -- Yes --> C[Audit the current flow]
  B -- No --> D[Capture and monitor]
  C --> E{Can copy solve it?}
  E -- Yes --> F[Ship messaging update]
  E -- No --> G[Redesign interaction]
\`\`\`

## Pair diagrams with one concrete visual

The diagram explains the logic. The image gives the decision a real surface and helps the article feel grounded in actual product work.

![Annotated interface planning session](https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?auto=format&fit=crop&w=1400&q=80)

## Keep the explanation lean

After the diagram and image, the writing only needs to clarify the sharpest tradeoffs:

- what changed
- what stayed constrained
- what the team learned

That rhythm keeps the article readable while still showing strategic depth.`,
  },
];

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required.");
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({ adapter });

function normalizeSeedUsername(value) {
  const normalized = value?.toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_");
  const trimmed = normalized?.replace(/^_+|_+$/g, "") ?? "";

  return trimmed || "admin";
}

async function resolveAvailableUsername(preferredUsername, excludeUserId) {
  const baseUsername = normalizeSeedUsername(preferredUsername);

  for (let index = 0; index < 10_000; index += 1) {
    const candidate = index === 0 ? baseUsername : `${baseUsername}_${index}`;
    const existingByUsername = await prisma.user.findFirst({
      select: {
        id: true,
      },
      where: {
        username: candidate,
      },
    });

    if (!existingByUsername || existingByUsername.id === excludeUserId) {
      return candidate;
    }
  }

  throw new Error(
    `Could not resolve an available username for base "${baseUsername}".`,
  );
}

async function upsertCredentialAccount() {
  const normalizedEmail = email.toLowerCase();
  const hashedPassword = await argon2.hash(password);
  const now = new Date();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: {
      accounts: true,
    },
  });

  const resolvedUsername = await resolveAvailableUsername(
    requestedUsername,
    existingUser?.id,
  );

  if (!existingUser) {
    const createdUser = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        emailVerified: true,
        image: null,
        createdAt: now,
        updatedAt: now,
        role,
        banned: false,
        banReason: null,
        banExpires: null,
        username: resolvedUsername,
        displayUsername: resolvedUsername,
      },
    });

    await prisma.account.create({
      data: {
        accountId: createdUser.id,
        providerId: "credential",
        userId: createdUser.id,
        password: hashedPassword,
        createdAt: now,
        updatedAt: now,
      },
    });

    return {
      status: "created",
      userId: createdUser.id,
      email: createdUser.email,
      username: createdUser.username,
    };
  }

  await prisma.user.update({
    where: { id: existingUser.id },
    data: {
      name,
      emailVerified: true,
      updatedAt: now,
      role,
      banned: false,
      banReason: null,
      banExpires: null,
      username: existingUser.username || resolvedUsername,
      displayUsername: existingUser.displayUsername || existingUser.username || resolvedUsername,
    },
  });

  const credentialAccount = existingUser.accounts.find(
    (account) => account.providerId === "credential",
  );

  if (credentialAccount) {
    await prisma.account.update({
      where: { id: credentialAccount.id },
      data: {
        accountId: existingUser.id,
        password: hashedPassword,
        updatedAt: now,
      },
    });

    return {
      status: "updated",
      userId: existingUser.id,
      email: normalizedEmail,
      username: existingUser.username || resolvedUsername,
    };
  }

  await prisma.account.create({
    data: {
      accountId: existingUser.id,
      providerId: "credential",
      userId: existingUser.id,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    },
  });

  return {
    status: "linked-credential",
    userId: existingUser.id,
    email: normalizedEmail,
    username: existingUser.username || resolvedUsername,
  };
}

async function upsertTestimonialSeeds() {
  const now = new Date();

  for (const testimonial of testimonialSeeds) {
    const isApproved = testimonial.status === "APPROVED";
    const shouldBeFeatured = isApproved ? testimonial.featured : false;
    const reviewedAt = testimonial.status === "PENDING" ? null : now;

    await prisma.testimonial.upsert({
      where: {
        id: testimonial.id,
      },
      create: {
        ...testimonial,
        featured: shouldBeFeatured,
        reviewedAt,
      },
      update: {
        company: testimonial.company,
        featured: shouldBeFeatured,
        message: testimonial.message,
        name: testimonial.name,
        rating: testimonial.rating,
        relation: testimonial.relation,
        reviewedAt,
        role: testimonial.role,
        status: testimonial.status,
      },
    });
  }
}

async function upsertBlogSeeds(userId) {
  for (const post of blogSeeds) {
    await prisma.blogPost.upsert({
      where: {
        slug: post.slug,
      },
      create: {
        authorName: name,
        authorUserId: userId,
        category: post.category,
        content: post.content,
        coverImagePlaceholder: post.coverImagePlaceholder,
        excerpt: post.excerpt,
        featured: post.featured,
        publishDate: post.publishDate,
        readingTime: post.readingTime,
        seoDescription: post.seoDescription,
        seoTitle: post.seoTitle,
        slug: post.slug,
        status: post.status,
        tags: post.tags,
        title: post.title,
      },
      update: {
        authorName: name,
        authorUserId: userId,
        category: post.category,
        content: post.content,
        coverImagePlaceholder: post.coverImagePlaceholder,
        excerpt: post.excerpt,
        featured: post.featured,
        publishDate: post.publishDate,
        readingTime: post.readingTime,
        seoDescription: post.seoDescription,
        seoTitle: post.seoTitle,
        status: post.status,
        tags: post.tags,
        title: post.title,
      },
    });
  }
}

try {
  if (!process.env.SEED_USER_EMAIL || !process.env.SEED_USER_PASSWORD) {
    console.log(
      JSON.stringify(
        {
          seedDefaults: {
            email,
            password,
            note: "Using development defaults because SEED_USER_EMAIL and/or SEED_USER_PASSWORD are not set.",
          },
        },
        null,
        2,
      ),
    );
  }

  const result = await upsertCredentialAccount();
  await upsertTestimonialSeeds();
  await upsertBlogSeeds(result.userId);
  console.log(JSON.stringify(result, null, 2));
} finally {
  await prisma.$disconnect();
}
