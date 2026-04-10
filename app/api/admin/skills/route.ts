import { NextResponse } from "next/server";

import {
  AdminSkillsAccessError,
  createAdminSkill,
  getAdminSkills,
  getAdminSkillsContext,
} from "@/lib/skills";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await getAdminSkillsContext(request.headers);
    const skills = await getAdminSkills();

    return NextResponse.json(skills);
  } catch (error) {
    if (error instanceof AdminSkillsAccessError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { message: "The skills board could not be loaded right now." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await getAdminSkillsContext(request.headers);
    const payload = (await request.json()) as {
      category?: string;
      featured?: boolean;
      level?: string;
      name?: string;
    };

    const result = await createAdminSkill({
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

    return NextResponse.json(result, { status: result.ok ? 201 : 400 });
  } catch (error) {
    if (error instanceof AdminSkillsAccessError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { message: "The skill could not be created right now." },
      { status: 500 },
    );
  }
}
