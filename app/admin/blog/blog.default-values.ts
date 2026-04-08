import { blogPosts } from "@/lib/mock-content";

import type { BlogFormValues, BlogStatus } from "./blog.schema";

export type BlogRecord = {
  id: string;
  lastUpdated: string;
  values: BlogFormValues;
};

const mockStatuses: BlogStatus[] = ["published", "published", "draft"];
const mockPublishDates = ["2026-03-12", "2026-02-18", "2026-01-24"];
const mockUpdatedAt = ["Mar 18, 2026", "Mar 05, 2026", "Feb 14, 2026"];

export function createBlogDefaultValues(): BlogFormValues {
  return {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    tags: [],
    category: "",
    coverImagePlaceholder: "",
    status: "draft",
    featured: false,
    publishDate: "",
    readingTime: "5 min read",
    seoTitle: "",
    seoDescription: "",
    authorName: "Rizal Achmad",
  };
}

function createBlogContent(index: number) {
  const post = blogPosts[index];

  return [
    post.quote,
    post.callout,
    ...post.sections.flatMap((section) => [
      `## ${section.heading}`,
      ...section.paragraphs,
    ]),
  ].join("\n\n");
}

function toBlogRecord(index: number): BlogRecord {
  const post = blogPosts[index];

  return {
    id: `post-${post.slug}`,
    lastUpdated: mockUpdatedAt[index] ?? formatBlogUpdatedAt(),
    values: {
      title: post.title,
      slug: post.slug,
      excerpt: post.summary,
      content: createBlogContent(index),
      tags: post.tags,
      category: post.kicker,
      coverImagePlaceholder: `${post.title} cover frame`,
      status: mockStatuses[index] ?? "draft",
      featured: post.featured,
      publishDate: mockPublishDates[index] ?? "",
      readingTime: post.readingTime,
      seoTitle: post.title,
      seoDescription: post.summary,
      authorName: "Rizal Achmad",
    },
  };
}

export const blogSeedRecords: BlogRecord[] = blogPosts.map((_, index) =>
  toBlogRecord(index),
);

export function formatBlogUpdatedAt(date = new Date()) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}
