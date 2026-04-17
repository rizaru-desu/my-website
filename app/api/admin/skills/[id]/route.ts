import { NextResponse } from "next/server";

import {
  AdminSkillsAccessError,
  deleteAdminSkill,
  getAdminSkillsContext,
  updateAdminSkill,
} from "@/lib/skills";

export const dynamic = "force-dynamic";

type SkillRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: SkillRouteContext) {
  try {
    await getAdminSkillsContext(request.headers);
    const { id } = await context.params;
    const payload = (await request.json()) as {
      category?: string;
      featured?: boolean;
      level?: string;
      name?: string;
    };

    const result = await updateAdminSkill(id, {
      category: payload.category ?? "",
      featured: Boolean(payload.featured),
      level:
        payload.level === "beginner" ||
        payload.level === "intermediate" ||
        payload.level === "advanced"
          ? payload.level
          : "intermediate",
      name: payload.name ?? "",
    });

    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    if (error instanceof AdminSkillsAccessError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { message: "The skill could not be updated right now." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, context: SkillRouteContext) {
  try {
    await getAdminSkillsContext(request.headers);
    const { id } = await context.params;
    const result = await deleteAdminSkill(id);

    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    if (error instanceof AdminSkillsAccessError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { message: "The skill could not be deleted right now." },
      { status: 500 },
    );
  }
}
