import { NextResponse } from "next/server";

import { AdminBlogAccessError, getAdminBlogContext } from "@/lib/blog";
import {
  AdminBlogDiscussionAccessError,
  getAdminBlogComments,
} from "@/lib/blog-discussions";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const context = await getAdminBlogContext(request.headers);
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId")?.trim() ?? "";

    if (!postId) {
      return NextResponse.json(
        { message: "Choose a blog post before loading discussion moderation." },
        { status: 400 },
      );
    }

    const comments = await getAdminBlogComments(context, postId);

    return NextResponse.json(comments);
  } catch (error) {
    if (
      error instanceof AdminBlogAccessError ||
      error instanceof AdminBlogDiscussionAccessError
    ) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { message: "The discussion queue could not be loaded right now." },
      { status: 500 },
    );
  }
}
