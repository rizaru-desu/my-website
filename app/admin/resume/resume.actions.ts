"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminResumeContext } from "@/lib/resume";

const experienceSchema = z.object({
  id: z.string().optional(),
  role: z.string().min(1, "Role is required"),
  company: z.string().min(1, "Company is required"),
  period: z.string().min(1, "Period is required"),
  location: z.string().min(1, "Location is required"),
  summary: z.string().min(1, "Summary is required"),
  achievements: z.array(z.string()).min(1, "At least one achievement is required"),
  sortOrder: z.number().default(0),
});

export async function adminSaveExperience(input: z.infer<typeof experienceSchema>) {
  try {
    const requestHeaders = await headers();
    await getAdminResumeContext(requestHeaders);

    const values = experienceSchema.parse(input);

    const data = {
      role: values.role,
      company: values.company,
      period: values.period,
      location: values.location,
      summary: values.summary,
      achievements: values.achievements,
      sortOrder: values.sortOrder,
    };

    if (values.id) {
      await prisma.experience.update({
        where: { id: values.id },
        data,
      });
    } else {
      await prisma.experience.create({
        data,
      });
    }

    revalidatePath("/admin/resume");
    revalidatePath("/resume");
    return { ok: true, message: "Experience saved successfully." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Failed to save experience." };
  }
}

export async function adminDeleteExperience(id: string) {
  try {
    const requestHeaders = await headers();
    await getAdminResumeContext(requestHeaders);

    await prisma.experience.delete({ where: { id } });

    revalidatePath("/admin/resume");
    revalidatePath("/resume");
    return { ok: true, message: "Experience deleted successfully." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Failed to delete experience." };
  }
}

const educationSchema = z.object({
  id: z.string().optional(),
  degree: z.string().min(1, "Degree is required"),
  school: z.string().min(1, "School is required"),
  period: z.string().min(1, "Period is required"),
  description: z.string().min(1, "Description is required"),
  highlights: z.array(z.string()).min(1, "At least one highlight is required"),
  sortOrder: z.number().default(0),
});

export async function adminSaveEducation(input: z.infer<typeof educationSchema>) {
  try {
    const requestHeaders = await headers();
    await getAdminResumeContext(requestHeaders);

    const values = educationSchema.parse(input);

    const data = {
      degree: values.degree,
      school: values.school,
      period: values.period,
      description: values.description,
      highlights: values.highlights,
      sortOrder: values.sortOrder,
    };

    if (values.id) {
      await prisma.education.update({
        where: { id: values.id },
        data,
      });
    } else {
      await prisma.education.create({
        data,
      });
    }

    revalidatePath("/admin/resume");
    revalidatePath("/resume");
    return { ok: true, message: "Education saved successfully." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Failed to save education." };
  }
}

export async function adminDeleteEducation(id: string) {
  try {
    const requestHeaders = await headers();
    await getAdminResumeContext(requestHeaders);

    await prisma.education.delete({ where: { id } });

    revalidatePath("/admin/resume");
    revalidatePath("/resume");
    return { ok: true, message: "Education deleted successfully." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Failed to delete education." };
  }
}

const certificateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  issuer: z.string().min(1, "Issuer is required"),
  year: z.string().min(1, "Year is required"),
  verificationLink: z.string().min(1, "Verification link is required").url("Must be a valid URL"),
  credentialId: z.string().optional(),
  featured: z.boolean().default(false),
  sortOrder: z.number().default(0),
});

export async function adminSaveCertificate(input: z.infer<typeof certificateSchema>) {
  try {
    const requestHeaders = await headers();
    await getAdminResumeContext(requestHeaders);

    const values = certificateSchema.parse(input);

    const data = {
      name: values.name,
      issuer: values.issuer,
      year: values.year,
      verificationLink: values.verificationLink,
      credentialId: values.credentialId || null,
      featured: values.featured,
      sortOrder: values.sortOrder,
    };

    if (values.id) {
      await prisma.certificate.update({
        where: { id: values.id },
        data,
      });
    } else {
      await prisma.certificate.create({
        data,
      });
    }

    revalidatePath("/admin/resume");
    revalidatePath("/resume");
    return { ok: true, message: "Certificate saved successfully." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Failed to save certificate." };
  }
}

export async function adminDeleteCertificate(id: string) {
  try {
    const requestHeaders = await headers();
    await getAdminResumeContext(requestHeaders);

    await prisma.certificate.delete({ where: { id } });

    revalidatePath("/admin/resume");
    revalidatePath("/resume");
    return { ok: true, message: "Certificate deleted successfully." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Failed to delete certificate." };
  }
}
