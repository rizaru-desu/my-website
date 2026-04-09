"use server";

import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

import {
  isMissingMessageTableError,
  isPrismaConnectionError,
} from "@/lib/prisma-errors";
import { prisma } from "@/lib/prisma";
import {
  contactSchema,
  getFirstZodMessage,
} from "@/lib/validations/contact.schema";
import { type MessageActionResult } from "@/lib/messages.shared";

function readFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function submitContactAction(
  formData: FormData,
): Promise<MessageActionResult> {
  try {
    const values = contactSchema.parse({
      email: readFormValue(formData, "email"),
      message: readFormValue(formData, "message"),
      name: readFormValue(formData, "name"),
      subject: readFormValue(formData, "subject"),
      website: readFormValue(formData, "website"),
    });

    await prisma.message.create({
      data: {
        body: values.message,
        senderEmail: values.email,
        senderName: values.name,
        subject: values.subject,
      },
    });

    return {
      ok: true,
      message:
        "Message received. Thanks for reaching out. It is now waiting in the studio inbox.",
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false,
        message: getFirstZodMessage(error),
      };
    }

    if (isMissingMessageTableError(error)) {
      return {
        ok: false,
        message:
          "Message storage is not ready yet. Start the database and run `npx prisma db push` first.",
      };
    }

    if (isPrismaConnectionError(error)) {
      return {
        ok: false,
        message:
          "The database is not reachable right now. Make sure PostgreSQL is running, then try again.",
      };
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.message) {
      console.error("[contact.action] Prisma request failed:", error.message);
    } else if (error instanceof Error) {
      console.error("[contact.action] Message submission failed:", error.message);
    } else {
      console.error("[contact.action] Message submission failed with unknown error.");
    }

    return {
      ok: false,
      message: "The message could not be sent right now. Please try again shortly.",
    };
  }
}
