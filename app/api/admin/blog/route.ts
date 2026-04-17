import { NextResponse } from "next/server";

import {
  AdminBlogAccessError,
  createAdminBlog,
  duplicateAdminBlog,
  getAdminBlogContext,
  getAdminBlogs,
} from "@/lib/blog";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await getAdminBlogContext(request.headers);
    const posts = await getAdminBlogs();

    return NextResponse.json(posts);
  } catch (error) {
    if (error instanceof AdminBlogAccessError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { message: "The blog board could not be loaded right now." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const context = await getAdminBlogContext(request.headers);
    const payload = (await request.json()) as {
      authorName?: string;
      category?: string;
      content?: string;
      coverImagePlaceholder?: string;
      duplicateFromId?: string;
      excerpt?: string;
      featured?: boolean;
      publishDate?: string;
      readingTime?: string;
      seoDescription?: string;
      seoTitle?: string;
      slug?: string;
      status?: string;
      tags?: string[];
      title?: string;
    };

    if (typeof payload.duplicateFromId === "string" && payload.duplicateFromId.trim()) {
      const result = await duplicateAdminBlog(context, payload.duplicateFromId);

      return NextResponse.json(result, { status: result.ok ? 200 : 400 });
    }

    const result = await createAdminBlog(context, {
      authorName: payload.authorName ?? context.currentUserName,
      category: payload.category ?? "",
      content: payload.content ?? "",
      coverImagePlaceholder: payload.coverImagePlaceholder ?? "",
      excerpt: payload.excerpt ?? "",
      featured: Boolean(payload.featured),
      publishDate: payload.publishDate ?? "",
      readingTime: payload.readingTime ?? "",
      seoDescription: payload.seoDescription ?? "",
      seoTitle: payload.seoTitle ?? "",
      slug: payload.slug ?? "",
      status:
        payload.status === "published" ||
        payload.status === "archived" ||
        payload.status === "draft"
          ? payload.status
          : "draft",
      tags: Array.isArray(payload.tags) ? payload.tags : [],
      title: payload.title ?? "",
    });

    return NextResponse.json(result, { status: result.ok ? 201 : 400 });
  } catch (error) {
    if (error instanceof AdminBlogAccessError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { message: "The blog post could not be created right now." },
      { status: 500 },
    );
  }
}
