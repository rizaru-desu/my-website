import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogCard } from "@/components/blog-card";
import { ReadingProgress } from "@/components/reading-progress";
import { Badge } from "@/components/ui/badge";
import { EditorialCard } from "@/components/ui/editorial-card";
import { getBlogPostBySlug, blogPosts } from "@/lib/mock-content";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = blogPosts
    .filter((item) => item.slug !== post.slug)
    .filter((item) => item.tags.some((tag) => post.tags.includes(tag)))
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
                <Badge variant="blue">{post.kicker}</Badge>
                <Badge variant="cream">{post.date}</Badge>
                <Badge variant="cream">{post.readingTime}</Badge>
              </div>
              <div className="space-y-4">
                <h1 className="max-w-5xl font-display text-5xl uppercase leading-none text-ink sm:text-6xl lg:text-7xl">
                  {post.title}
                </h1>
                <p className="max-w-3xl text-base leading-7 text-ink/80 sm:text-lg">
                  {post.summary}
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
              <Badge variant="red">Pull Quote</Badge>
              <p className="text-2xl leading-9 text-ink sm:text-3xl sm:leading-10">
                {post.quote}
              </p>
            </EditorialCard>
            <EditorialCard accent="blue" className="space-y-4">
              <Badge variant="blue">Quick Take</Badge>
              <p className="text-base leading-8 text-ink/80 sm:text-lg">
                {post.callout}
              </p>
            </EditorialCard>
          </section>

          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
            <div className="space-y-8">
              {post.sections.map((section, index) => (
                <EditorialCard
                  key={section.heading}
                  accent={index % 2 === 0 ? "cream" : "blue"}
                  className="story-prose space-y-5"
                >
                  <h2 className="font-display text-4xl uppercase leading-none text-ink">
                    {section.heading}
                  </h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-base leading-8 text-ink/80">
                      {paragraph}
                    </p>
                  ))}
                </EditorialCard>
              ))}
            </div>
            <aside className="space-y-6 lg:sticky lg:top-28">
              <EditorialCard className="space-y-4">
                <Badge variant="cream">Article Context</Badge>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
                  Reading this as a recruiter?
                </p>
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
                  This article page includes a live scroll progress bar and
                  route-based detail layout built to keep longer reading
                  sessions focused and easy to scan.
                </p>
              </EditorialCard>
            </aside>
          </div>

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
        </article>
      </div>
    </>
  );
}
