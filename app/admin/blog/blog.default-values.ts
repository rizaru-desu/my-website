import type { BlogFormValues } from "./blog.schema";

export function createBlogDefaultValues(authorName = "Rizal Achmad"): BlogFormValues {
  return {
    authorName,
    category: "",
    content: "",
    coverImagePlaceholder: "",
    excerpt: "",
    featured: false,
    publishDate: "",
    readingTime: "5 min read",
    seoDescription: "",
    seoTitle: "",
    slug: "",
    status: "draft",
    tags: [],
    title: "",
  };
}
