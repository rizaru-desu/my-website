import Link from "next/link";

import { BlogFilter } from "@/components/blog-filter";
import { Badge } from "@/components/ui/badge";
import { EditorialCard } from "@/components/ui/editorial-card";
import { PageHero } from "@/components/ui/page-hero";
import { getFeaturedPublicBlogPosts, getPublicBlogPosts } from "@/lib/blog";

export const revalidate = 300;
export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const [featuredPosts, allPosts] = await Promise.all([
    getFeaturedPublicBlogPosts(1),
    getPublicBlogPosts(),
  ]);
  const leadPost = featuredPosts[0] ?? allPosts[0] ?? null;

  return (
    <div className="px-4 pb-6 pt-8 sm:px-6 sm:pt-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12">
        <PageHero
          label="Blog"
          title="Writing with product and interface perspective."
          description="The archive keeps the editorial energy of the portfolio while staying easy to skim. Articles are arranged to feel clear, readable, and intentional."
        >
          <div className="flex flex-wrap gap-4">
            <Link href="/projects" className="button-link">
              See Projects
            </Link>
            <Link href="/resume" className="button-link button-link-blue">
              Resume View
            </Link>
          </div>
        </PageHero>

        {leadPost ? (
          <EditorialCard
            accent="blue"
            className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end"
          >
            <div className="space-y-4">
              <Badge variant="blue">Featured Article</Badge>
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
                  {leadPost.publishDateLabel} • {leadPost.readingTime}
                </p>
                <h2 className="font-display text-5xl uppercase leading-none text-ink">
                  {leadPost.title}
                </h2>
                <p className="max-w-3xl text-base leading-7 text-ink/80">
                  {leadPost.excerpt}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {leadPost.tags.map((tag) => (
                  <Badge key={tag} variant="cream">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <Link href={`/blog/${leadPost.slug}`} className="button-link">
              Read Feature
            </Link>
          </EditorialCard>
        ) : (
          <EditorialCard accent="cream" className="space-y-4">
            <Badge variant="cream">No Published Stories</Badge>
            <h2 className="font-display text-4xl uppercase leading-none text-ink">
              The public archive is waiting for its first published article.
            </h2>
            <p className="max-w-3xl text-base leading-7 text-ink/80">
              Publish a story from the admin workspace to light up the featured
              article rail and the full blog archive.
            </p>
          </EditorialCard>
        )}

        <BlogFilter posts={allPosts} />
      </div>
    </div>
  );
}
