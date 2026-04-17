import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogArticleMdx } from "@/components/blog-article-mdx";
import { BlogCard } from "@/components/blog-card";
import { BlogDiscussion, BlogDiscussionSummary } from "@/components/blog-discussion";
import { ReadingProgress } from "@/components/reading-progress";
import { Badge } from "@/components/ui/badge";
import { EditorialCard } from "@/components/ui/editorial-card";
import { getPublicBlogPostBySlug, getPublicBlogPosts } from "@/lib/blog";
import { getPublicBlogComments } from "@/lib/blog-discussions";

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublicBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const publishedPosts = await getPublicBlogPosts();
  const discussion = await getPublicBlogComments(slug);
  const relatedPosts = publishedPosts
    .filter((item) => item.slug !== post.slug)
    .filter(
      (item) =>
        item.category === post.category ||
        item.tags.some((tag) => post.tags.includes(tag)),
    )
    .slice(0, 2);

  return (
    <>
      <ReadingProgress />
      <div className="px-4 pb-6 pt-12 sm:px-6 sm:pt-14">
        <article className="mx-auto flex w-full max-w-7xl flex-col gap-12">
          <section className="surface-panel relative overflow-hidden bg-panel px-6 py-10 sm:px-8 sm:py-12">
            <div className="accent-plate right-10 top-8 hidden h-20 w-20 rotate-6 rounded-[28px] bg-accent-red lg:block" />
            <div className="accent-plate bottom-6 left-10 hidden h-14 w-32 -rotate-3 rounded-full bg-accent-blue lg:block" />
            <div className="relative z-10 space-y-6">
              <div className="flex flex-wrap gap-3">
                <Badge variant="blue">{post.category}</Badge>
                <Badge variant="cream">{post.publishDateLabel}</Badge>
                <Badge variant="cream">{post.readingTime}</Badge>
              </div>
              <div className="space-y-4">
                <h1 className="max-w-5xl font-display text-5xl uppercase leading-none text-ink sm:text-6xl lg:text-7xl">
                  {post.title}
                </h1>
                <p className="max-w-3xl text-base leading-7 text-ink/80 sm:text-lg">
                  {post.excerpt}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="yellow">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
            <EditorialCard accent="red" className="space-y-4">
              <Badge variant="red">Article Context</Badge>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
                Written by {post.authorName}
              </p>
              <p className="text-base leading-8 text-ink/80">
                {post.seoDescription}
              </p>
            </EditorialCard>
            <EditorialCard accent="blue" className="space-y-4">
              <Badge variant="blue">MDX Article Body</Badge>
              <p className="text-base leading-8 text-ink/80 sm:text-lg">
                This story is rendered from MDX stored in the admin blog workspace,
                so the article body can use headings, lists, blockquotes, code blocks,
                and richer editorial structure without switching to raw HTML.
              </p>
            </EditorialCard>
          </section>

          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
            <div className="space-y-8">
              <EditorialCard accent="cream">
                <BlogArticleMdx source={post.content} />
              </EditorialCard>
            </div>
            <aside className="space-y-6 lg:sticky lg:top-28">
              <EditorialCard className="space-y-4">
                <Badge variant="cream">Reading this as a recruiter?</Badge>
                <p className="text-sm leading-7 text-ink/75">
                  The writing here is meant to reinforce how product decisions are
                  framed, not just show visual taste in isolation.
                </p>
                <Link href="/projects" className="button-link button-link-blue">
                  Browse Work
                </Link>
              </EditorialCard>
              <EditorialCard accent="red" className="space-y-4">
                <Badge variant="red">Article Detail</Badge>
                <p className="text-sm leading-7 text-ink/75">
                  This article view reads directly from the admin blog workspace, so
                  publishing or updating a story reflects here without maintaining a
                  second content source.
                </p>
              </EditorialCard>
              <BlogDiscussionSummary totalCount={discussion.totalCount} />
            </aside>
          </div>

          <BlogDiscussion blogSlug={post.slug} comments={discussion.comments} />

          {relatedPosts.length > 0 ? (
            <section className="space-y-8">
              <div className="space-y-4">
                <span className="section-label">Related</span>
                <h2 className="font-display text-4xl uppercase leading-none text-ink sm:text-5xl">
                  More notes in the same lane.
                </h2>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                {relatedPosts.map((item) => (
                  <BlogCard key={item.slug} post={item} />
                ))}
              </div>
            </section>
          ) : null}
        </article>
      </div>
    </>
  );
}
