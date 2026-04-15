import { NextResponse } from "next/server";

import { getPublicProjects, ProjectsStorageError } from "@/lib/projects";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await getPublicProjects();

    return NextResponse.json(projects);
  } catch (error) {
    if (error instanceof ProjectsStorageError) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "The public projects archive could not be loaded right now." },
      { status: 500 },
    );
  }
}
