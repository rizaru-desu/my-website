import { NextResponse } from "next/server";

import { coerceProjectFormValues } from "../project-payload";
import {
  AdminProjectsAccessError,
  deleteAdminProject,
  getAdminProjectsContext,
  updateAdminProject,
} from "@/lib/projects";

export const dynamic = "force-dynamic";

type ProjectRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: ProjectRouteContext) {
  try {
    await getAdminProjectsContext(request.headers);
    const { id } = await context.params;
    const payload = await request.json().catch(() => ({}));
    const result = await updateAdminProject(id, coerceProjectFormValues(payload));

    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    if (error instanceof AdminProjectsAccessError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { message: "The project could not be updated right now." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, context: ProjectRouteContext) {
  try {
    await getAdminProjectsContext(request.headers);
    const { id } = await context.params;
    const result = await deleteAdminProject(id);

    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    if (error instanceof AdminProjectsAccessError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { message: "The project could not be deleted right now." },
      { status: 500 },
    );
  }
}
