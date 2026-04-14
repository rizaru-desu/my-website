"use client";

import { useState } from "react";

import { BlogCard } from "@/components/blog-card";
import { Badge } from "@/components/ui/badge";
import type { PublicBlogSummary } from "@/lib/blog.shared";

type BlogFilterProps = {
  posts: PublicBlogSummary[];
};

export function BlogFilter({ posts }: BlogFilterProps) {
  const tags = ["All", ...new Set(posts.flatMap((post) => post.tags))];
  const [activeTag, setActiveTag] = useState("All");

  const filteredPosts = posts.filter((post) => {
    return activeTag === "All" || post.tags.includes(activeTag);
  });

  return (
    <div className="space-y-8">
      <div className="surface-panel bg-panel">
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag)}
              className={activeTag === tag ? "button-link" : "button-link button-link-muted"}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t-[3px] border-dashed border-ink/30 pt-6">
          <Badge variant="cream">{filteredPosts.length} visible stories</Badge>
          <p className="text-sm text-ink/70">
            Filtered instantly on the client by tag for quick editorial scanning.
          </p>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {filteredPosts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
