import { NextResponse } from "next/server";

import { coerceProjectFormValues } from "./project-payload";
import {
  AdminProjectsAccessError,
  createAdminProject,
  getAdminProjects,
  getAdminProjectsContext,
  ProjectsStorageError,
} from "@/lib/projects";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await getAdminProjectsContext(request.headers);
    const projects = await getAdminProjects();

    return NextResponse.json(projects);
  } catch (error) {
    if (error instanceof AdminProjectsAccessError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    if (error instanceof ProjectsStorageError) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "The projects board could not be loaded right now." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await getAdminProjectsContext(request.headers);
    const payload = await request.json().catch(() => ({}));
    const result = await createAdminProject(coerceProjectFormValues(payload));

    return NextResponse.json(result, { status: result.ok ? 201 : 400 });
  } catch (error) {
    if (error instanceof AdminProjectsAccessError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { message: "The project could not be created right now." },
      { status: 500 },
    );
  }
}
