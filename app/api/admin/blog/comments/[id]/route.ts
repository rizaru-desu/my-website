import { NextResponse } from "next/server";

import { AdminBlogAccessError, getAdminBlogContext } from "@/lib/blog";
import {
  AdminBlogDiscussionAccessError,
  deleteAdminBlogComment,
  moderateAdminBlogComment,
} from "@/lib/blog-discussions";
import {
  blogCommentModerationActionValues,
  type BlogCommentModerationAction,
} from "@/lib/blog-discussions.shared";

export const dynamic = "force-dynamic";

type CommentRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: CommentRouteContext) {
  try {
    const adminContext = await getAdminBlogContext(request.headers);
    const { id } = await context.params;
    const payload = (await request.json()) as {
      action?: string;
    };

    if (!payload.action || !blogCommentModerationActionValues.includes(payload.action as never)) {
      return NextResponse.json(
        { message: "The comment moderation action is invalid." },
        { status: 400 },
      );
    }

    const result = await moderateAdminBlogComment(
      adminContext,
      id,
      payload.action as BlogCommentModerationAction,
    );

    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    if (
      error instanceof AdminBlogAccessError ||
      error instanceof AdminBlogDiscussionAccessError
    ) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { message: "The comment moderation action could not be completed right now." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, context: CommentRouteContext) {
  try {
    const adminContext = await getAdminBlogContext(request.headers);
    const { id } = await context.params;
    const result = await deleteAdminBlogComment(adminContext, id);

    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    if (
      error instanceof AdminBlogAccessError ||
      error instanceof AdminBlogDiscussionAccessError
    ) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { message: "The comment could not be deleted right now." },
      { status: 500 },
    );
  }
}
