import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { EditorialCard } from "@/components/ui/editorial-card";
import type { PublicBlogSummary } from "@/lib/blog.shared";

type BlogCardProps = {
  post: PublicBlogSummary;
};

export function BlogCard({ post }: BlogCardProps) {
  return (
    <EditorialCard className="flex h-full flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <Badge variant="blue">{post.category}</Badge>
        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/60">
          {post.readingTime}
        </span>
      </div>
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
          {post.publishDateLabel}
        </p>
        <h3 className="font-display text-3xl uppercase leading-none text-ink">
          {post.title}
        </h3>
        <p className="text-sm leading-7 text-ink/80 sm:text-base">{post.excerpt}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border-[2px] border-ink bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-ink"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-auto flex justify-end border-t-[3px] border-dashed border-ink/30 pt-5">
        <Link href={`/blog/${post.slug}`} className="button-link">
          Read Notes
        </Link>
      </div>
    </EditorialCard>
  );
}
