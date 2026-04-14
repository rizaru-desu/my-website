import { NextResponse } from "next/server";

import {
  AdminBlogAccessError,
  deleteAdminBlog,
  getAdminBlogContext,
  updateAdminBlog,
} from "@/lib/blog";

export const dynamic = "force-dynamic";

type BlogRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: BlogRouteContext) {
  try {
    const adminContext = await getAdminBlogContext(request.headers);
    const { id } = await context.params;
    const payload = (await request.json()) as {
      authorName?: string;
      category?: string;
      content?: string;
      coverImagePlaceholder?: string;
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

    const result = await updateAdminBlog(adminContext, id, {
      authorName: payload.authorName ?? adminContext.currentUserName,
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

    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    if (error instanceof AdminBlogAccessError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { message: "The blog post could not be updated right now." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, context: BlogRouteContext) {
  try {
    const adminContext = await getAdminBlogContext(request.headers);
    const { id } = await context.params;
    const result = await deleteAdminBlog(adminContext, id);

    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    if (error instanceof AdminBlogAccessError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { message: "The blog post could not be deleted right now." },
      { status: 500 },
    );
  }
}
