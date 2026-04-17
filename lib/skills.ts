import "server-only";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

import { skillSchema, type SkillFormValues } from "@/app/admin/skills/skill.schema";
import { auth } from "@/lib/auth";
import {
  isMissingSkillTableError,
  isPrismaConnectionError,
} from "@/lib/prisma-errors";
import { prisma } from "@/lib/prisma";
import type { SkillActionResult, SkillRecord } from "@/lib/skills.shared";

type StoredSkill = {
  category: string;
  createdAt: Date;
  featured: boolean;
  id: string;
  level: string;
  name: string;
  updatedAt: Date;
};

const skillAdminRoles = ["architect"] as const;

const skillModel = (prisma as typeof prisma & {
  skill: {
    create: (args: unknown) => Promise<StoredSkill>;
    delete: (args: unknown) => Promise<StoredSkill>;
    findMany: (args: unknown) => Promise<StoredSkill[]>;
    update: (args: unknown) => Promise<StoredSkill>;
  };
}).skill;

export class AdminSkillsAccessError extends Error {
  status: 401 | 403;

  constructor(status: 401 | 403, message: string) {
    super(message);
    this.name = "AdminSkillsAccessError";
    this.status = status;
  }
}

function normalizeDate(value: Date | string | null | undefined) {
  if (!value) {
    return new Date(0).toISOString();
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return new Date(0).toISOString();
  }

  return date.toISOString();
}

function normalizeStoredSkill(skill: StoredSkill): SkillRecord | null {
  const values = skillSchema.safeParse({
    category: skill.category,
    featured: skill.featured,
    level: skill.level,
    name: skill.name,
  });

  if (!values.success) {
    return null;
  }

  return {
    createdAt: normalizeDate(skill.createdAt),
    id: skill.id,
    source: "database",
    updatedAt: normalizeDate(skill.updatedAt),
    values: values.data,
  };
}

function getSkillStorageMessage(error: unknown) {
  if (isMissingSkillTableError(error)) {
    return "Skill storage is not ready yet. Start the database and run `npx prisma db push` first.";
  }

  if (isPrismaConnectionError(error)) {
    return "The database is not reachable right now. Make sure PostgreSQL is running, then try again.";
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    return "That skill could not be found.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "The skills data could not be updated right now.";
}

function revalidateSkillSurfaces() {
  revalidatePath("/");
  revalidatePath("/resume");
  revalidatePath("/admin");
  revalidatePath("/admin/skills");
}

export async function getAdminSkillsContext(requestHeaders: Headers) {
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session?.user) {
    throw new AdminSkillsAccessError(401, "You must be signed in to manage skills.");
  }

  if (!skillAdminRoles.includes(session.user.role as (typeof skillAdminRoles)[number])) {
    throw new AdminSkillsAccessError(403, "You are not allowed to manage skills.");
  }

  return {
    currentUserId: session.user.id,
    headers: requestHeaders,
    role: session.user.role ?? "",
  };
}

export async function getAdminSkills(): Promise<SkillRecord[]> {
  try {
    const skills = await skillModel.findMany({
      orderBy: [
        {
          category: "asc",
        },
        {
          featured: "desc",
        },
        {
          name: "asc",
        },
      ],
    });

    return skills
      .map((skill) => normalizeStoredSkill(skill))
      .filter((skill): skill is SkillRecord => Boolean(skill));
  } catch (error) {
    throw error;
  }
}

export async function getPublicSkills(): Promise<SkillRecord[]> {
  return getAdminSkills();
}

export async function hasPersistedSkillsCoverage() {
  const skills = await getAdminSkills();

  return skills.some((skill) => skill.source === "database");
}

export async function createAdminSkill(
  input: SkillFormValues,
): Promise<SkillActionResult> {
  try {
    const values = skillSchema.parse(input);

    await skillModel.create({
      data: values,
    });
    revalidateSkillSurfaces();

    return {
      ok: true,
      message: `${values.name} was saved to the skills database.`,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false,
        message: error.issues[0]?.message ?? "Please review the skill fields.",
      };
    }

    return {
      ok: false,
      message: getSkillStorageMessage(error),
    };
  }
}

export async function updateAdminSkill(
  id: string,
  input: SkillFormValues,
): Promise<SkillActionResult> {
  try {
    const values = skillSchema.parse(input);

    await skillModel.update({
      data: values,
      where: {
        id,
      },
    });
    revalidateSkillSurfaces();

    return {
      ok: true,
      message: `${values.name} was updated in the skills database.`,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false,
        message: error.issues[0]?.message ?? "Please review the skill fields.",
      };
    }

    return {
      ok: false,
      message: getSkillStorageMessage(error),
    };
  }
}

export async function deleteAdminSkill(id: string): Promise<SkillActionResult> {
  try {
    await skillModel.delete({
      where: {
        id,
      },
    });
    revalidateSkillSurfaces();

    return {
      ok: true,
      message: "Skill removed from the database.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getSkillStorageMessage(error),
    };
  }
}
