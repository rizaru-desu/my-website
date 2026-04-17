import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MDXRemote, type MDXRemoteOptions } from "next-mdx-remote-client/rsc";
import remarkGfm from "remark-gfm";

import { blogSchema } from "../app/admin/blog/blog.schema.ts";
import { buildPublicBlogCommentTree } from "../lib/blog-discussions.shared.ts";
import { canManageBlogPost } from "../lib/blog.shared.ts";
import { blogCommentSchema } from "../lib/validations/blog-comment.schema.ts";

const mdxOptions: MDXRemoteOptions = {
  disableExports: true,
  disableImports: true,
  mdxOptions: {
    remarkPlugins: [remarkGfm],
  },
};

function TestErrorFallback() {
  return createElement("div", null, "Article Render Error");
}

const validBlogPayload = {
  authorName: "  Rizal Achmad  ",
  category: "  Field Notes  ",
  content: [
    "Opening perspective for the article with enough detail to pass the minimum content threshold and mimic the real admin textarea payload.",
    "## Start Here",
    "Paragraph one expands the first section with a realistic amount of detail for validation.",
    "Paragraph two keeps the sample article comfortably above the minimum character count.",
  ].join("\n\n"),
  coverImagePlaceholder: "  Hero cover  ",
  excerpt:
    "  A practical breakdown of how to make personal work feel distinct without sacrificing trust.  ",
  featured: true,
  publishDate: "2026-04-12",
  readingTime: " 6 min read ",
  seoDescription: "  Practical guidance for portfolio writing.  ",
  seoTitle: "  Designing Portfolios for Recruiter Attention  ",
  slug: "designing-portfolios-for-recruiter-attention",
  status: "published",
  tags: [" Portfolio ", " UX "],
  title: "  Designing Portfolios for Recruiter Attention  ",
} as const;

test("blog schema trims persisted form fields", () => {
  const result = blogSchema.parse(validBlogPayload);

  assert.equal(result.authorName, "Rizal Achmad");
  assert.equal(result.category, "Field Notes");
  assert.equal(result.readingTime, "6 min read");
  assert.equal(result.seoTitle, "Designing Portfolios for Recruiter Attention");
  assert.deepEqual(result.tags, ["Portfolio", "UX"]);
});

test("blog article MDX renders headings, lists, blockquotes, and code", async () => {
  const element = await MDXRemote({
    onError: TestErrorFallback,
    options: mdxOptions,
    source: [
      "## Start Here",
      "",
      "Lead paragraph for the article body.",
      "",
      "- First point",
      "- Second point",
      "",
      "> Sharpen the point with a quote.",
      "",
      "```ts",
      "const signal = 'clean mdx';",
      "```",
    ].join("\n"),
  });
  const markup = renderToStaticMarkup(element);

  assert.match(markup, /Start Here/);
  assert.match(markup, /First point/);
  assert.match(markup, /Sharpen the point with a quote/);
  assert.match(markup, /clean mdx/);
});

test("blog article MDX falls back to a controlled error state on malformed source", async () => {
  const element = await MDXRemote({
    onError: TestErrorFallback,
    options: mdxOptions,
    source: "## Broken article\n\n<Callout",
  });
  const markup = renderToStaticMarkup(element);

  assert.match(markup, /Article Render Error/);
});

test("artisan ownership checks allow own edits but block others", () => {
  const artisanPermissions = {
    canCreate: true,
    canDelete: false,
    canDeleteComments: false,
    canDraft: true,
    canModerateComments: false,
    canPublish: true,
    canRead: true,
    canReadComments: true,
    canUpdate: true,
    currentUserId: "user-artisan",
    requiresOwnershipForWrite: true,
    role: "artisan",
  } as const;

  assert.equal(
    canManageBlogPost(artisanPermissions, { authorUserId: "user-artisan" }, "update"),
    true,
  );
  assert.equal(
    canManageBlogPost(artisanPermissions, { authorUserId: "another-user" }, "publish"),
    false,
  );
});

test("apprentice cannot publish or delete even when update access exists", () => {
  const apprenticePermissions = {
    canCreate: true,
    canDelete: false,
    canDeleteComments: false,
    canDraft: true,
    canModerateComments: false,
    canPublish: false,
    canRead: true,
    canReadComments: true,
    canUpdate: true,
    currentUserId: "user-apprentice",
    requiresOwnershipForWrite: false,
    role: "apprentice",
  } as const;

  assert.equal(
    canManageBlogPost(apprenticePermissions, { authorUserId: "any-user" }, "update"),
    true,
  );
  assert.equal(
    canManageBlogPost(apprenticePermissions, { authorUserId: "any-user" }, "publish"),
    false,
  );
  assert.equal(
    canManageBlogPost(apprenticePermissions, { authorUserId: "any-user" }, "delete"),
    false,
  );
});

test("blog comment schema trims identity fields and preserves reply targets", () => {
  const result = blogCommentSchema.parse({
    _honeypot: "",
    blogSlug: "  designing-editorial-rhythm  ",
    body: "  This article clarified how pacing shapes credibility in a portfolio.  ",
    displayName: "  Rizal  ",
    email: "  RIZAL@EXAMPLE.COM  ",
    parentId: "  comment-parent-1  ",
  });

  assert.equal(result.blogSlug, "designing-editorial-rhythm");
  assert.equal(
    result.body,
    "This article clarified how pacing shapes credibility in a portfolio.",
  );
  assert.equal(result.displayName, "Rizal");
  assert.equal(result.email, "RIZAL@EXAMPLE.COM");
  assert.equal(result.parentId, "comment-parent-1");
});

test("public blog comment tree orders parents newest-first and replies chronologically", () => {
  const thread = buildPublicBlogCommentTree([
    {
      body: "Older top-level comment",
      createdAt: "2026-04-10T08:00:00.000Z",
      displayName: "Older Reader",
      id: "comment-1",
      parentId: null,
    },
    {
      body: "Second reply",
      createdAt: "2026-04-10T11:00:00.000Z",
      displayName: "Reply Two",
      id: "comment-1-reply-2",
      parentId: "comment-1",
    },
    {
      body: "Newest top-level comment",
      createdAt: "2026-04-11T08:00:00.000Z",
      displayName: "Newest Reader",
      id: "comment-2",
      parentId: null,
    },
    {
      body: "First reply",
      createdAt: "2026-04-10T09:00:00.000Z",
      displayName: "Reply One",
      id: "comment-1-reply-1",
      parentId: "comment-1",
    },
  ]);

  assert.deepEqual(
    thread.map((comment) => comment.id),
    ["comment-2", "comment-1"],
  );
  assert.deepEqual(
    thread[1]?.replies.map((reply) => reply.id),
    ["comment-1-reply-1", "comment-1-reply-2"],
  );
  assert.deepEqual(thread[0]?.replies, []);
});
