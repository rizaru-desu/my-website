"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  deleteManagedFileFromR2ByUrl,
  uploadCertificateFileToR2,
} from "@/lib/cloudflare-r2";
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

const certificateMetadataSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  issuer: z.string().min(1, "Issuer is required"),
  year: z.string().min(1, "Year is required"),
  credentialId: z.string().optional(),
  featured: z.boolean().default(false),
  sortOrder: z.number().default(0),
});

const MAX_CERTIFICATE_FILE_BYTES = 10 * 1024 * 1024;
const allowedCertificateMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const allowedCertificateExtensions = new Set(["pdf", "jpg", "jpeg", "png", "webp"]);

function normalizeOptionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed || undefined;
}

function parseCheckboxValue(value: FormDataEntryValue | null) {
  return value === "true";
}

function parseSortOrderValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getCertificateUploadValidationError(file: File) {
  if (file.size <= 0) {
    return "Choose a certificate file before uploading.";
  }

  if (file.size > MAX_CERTIFICATE_FILE_BYTES) {
    return "Keep the certificate file under 10MB before uploading.";
  }

  const normalizedType = file.type.trim().toLowerCase();
  const extension = file.name.trim().toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] ?? "";

  if (
    normalizedType &&
    !allowedCertificateMimeTypes.has(normalizedType) &&
    !allowedCertificateExtensions.has(extension)
  ) {
    return "Upload a PDF, PNG, JPG, or WEBP certificate file.";
  }

  if (!normalizedType && !allowedCertificateExtensions.has(extension)) {
    return "Upload a PDF, PNG, JPG, or WEBP certificate file.";
  }

  return null;
}

export async function adminSaveCertificate(formData: FormData) {
  let uploadedFileUrl: string | null = null;

  try {
    const requestHeaders = await headers();
    await getAdminResumeContext(requestHeaders);

    const values = certificateMetadataSchema.parse({
      credentialId: normalizeOptionalString(formData.get("credentialId")),
      featured: parseCheckboxValue(formData.get("featured")),
      id: normalizeOptionalString(formData.get("id")),
      issuer: normalizeOptionalString(formData.get("issuer")) ?? "",
      name: normalizeOptionalString(formData.get("name")) ?? "",
      sortOrder: parseSortOrderValue(formData.get("sortOrder")),
      year: normalizeOptionalString(formData.get("year")) ?? "",
    });
    const existingCertificate = values.id
      ? await prisma.certificate.findUnique({ where: { id: values.id } })
      : null;
    const fileEntry = formData.get("file");
    const uploadFile =
      fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : null;

    if (values.id && !existingCertificate) {
      return { ok: false, message: "Certificate record was not found." };
    }

    if (!existingCertificate && !uploadFile) {
      return { ok: false, message: "Upload a certificate file before saving." };
    }

    if (uploadFile) {
      const validationError = getCertificateUploadValidationError(uploadFile);

      if (validationError) {
        return { ok: false, message: validationError };
      }
    }

    if (uploadFile) {
      const uploadedAsset = await uploadCertificateFileToR2(uploadFile);
      uploadedFileUrl = uploadedAsset.publicUrl;
    }

    const verificationLink =
      uploadedFileUrl ?? existingCertificate?.verificationLink ?? "";

    if (!verificationLink) {
      return {
        ok: false,
        message: "Upload a certificate file before saving this record.",
      };
    }

    const data = {
      name: values.name,
      issuer: values.issuer,
      year: values.year,
      verificationLink,
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

    let cleanupWarning: string | null = null;

    if (
      uploadedFileUrl &&
      existingCertificate?.verificationLink &&
      existingCertificate.verificationLink !== uploadedFileUrl
    ) {
      try {
        await deleteManagedFileFromR2ByUrl(existingCertificate.verificationLink);
      } catch (error) {
        cleanupWarning =
          error instanceof Error
            ? error.message
            : "Remote certificate cleanup could not be completed.";
      }
    }

    revalidatePath("/admin/resume");
    revalidatePath("/resume");
    return {
      ok: true,
      message: cleanupWarning
        ? `Certificate saved, but the previous file still needs cleanup: ${cleanupWarning}`
        : uploadedFileUrl
          ? "Certificate saved and uploaded to Cloudflare R2 successfully."
          : "Certificate saved successfully.",
    };
  } catch (error) {
    if (uploadedFileUrl) {
      try {
        await deleteManagedFileFromR2ByUrl(uploadedFileUrl);
      } catch {
        // Ignore upload rollback failures and return the original error.
      }
    }

    return { ok: false, message: error instanceof Error ? error.message : "Failed to save certificate." };
  }
}

export async function adminDeleteCertificate(id: string) {
  try {
    const requestHeaders = await headers();
    await getAdminResumeContext(requestHeaders);

    const existingCertificate = await prisma.certificate.findUnique({ where: { id } });

    if (!existingCertificate) {
      return { ok: false, message: "Certificate record was not found." };
    }

    await prisma.certificate.delete({ where: { id } });

    let cleanupWarning: string | null = null;

    try {
      await deleteManagedFileFromR2ByUrl(existingCertificate.verificationLink);
    } catch (error) {
      cleanupWarning =
        error instanceof Error
          ? error.message
          : "Remote certificate cleanup could not be completed.";
    }

    revalidatePath("/admin/resume");
    revalidatePath("/resume");
    return {
      ok: true,
      message: cleanupWarning
        ? `Certificate deleted, but remote file cleanup needs attention: ${cleanupWarning}`
        : "Certificate deleted successfully.",
    };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Failed to delete certificate." };
  }
}
