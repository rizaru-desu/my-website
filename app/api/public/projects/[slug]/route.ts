import { NextResponse } from "next/server";

import { getPublicProjectBySlug, ProjectsStorageError } from "@/lib/projects";

export const dynamic = "force-dynamic";

type PublicProjectRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, context: PublicProjectRouteContext) {
  try {
    const { slug } = await context.params;
    const project = await getPublicProjectBySlug(slug);

    if (!project) {
      return NextResponse.json({ message: "Project not found." }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    if (error instanceof ProjectsStorageError) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "The public project could not be loaded right now." },
      { status: 500 },
    );
  }
}
