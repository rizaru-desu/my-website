import "server-only";

import nodemailer from "nodemailer";

type AppEmailInput = {
  html?: string;
  replyTo?: string;
  subject: string;
  text: string;
  to: string;
};

const globalForMailer = globalThis as unknown as {
  portfolioMailer?: nodemailer.Transporter;
};

function getMailerConfig() {
  return {
    appPassword: process.env.GOOGLE_APP_PASSWORD?.trim() ?? "",
    fromAddress:
      process.env.MAIL_FROM_ADDRESS?.trim() ??
      process.env.GOOGLE_SMTP_USER?.trim() ??
      "",
    fromName: process.env.MAIL_FROM_NAME?.trim() ?? "Portofolio Admin",
    smtpUser: process.env.GOOGLE_SMTP_USER?.trim() ?? "",
  };
}

function hasMailerConfig() {
  const config = getMailerConfig();
  return Boolean(config.smtpUser && config.appPassword && config.fromAddress);
}

function getMailer() {
  if (!hasMailerConfig()) {
    return null;
  }

  if (globalForMailer.portfolioMailer) {
    return globalForMailer.portfolioMailer;
  }

  const { appPassword, smtpUser } = getMailerConfig();

  const transporter = nodemailer.createTransport({
    auth: {
      pass: appPassword,
      user: smtpUser,
    },
    service: "gmail",
  });

  if (process.env.NODE_ENV !== "production") {
    globalForMailer.portfolioMailer = transporter;
  }

  return transporter;
}

function getFormattedFrom() {
  const { fromAddress, fromName } = getMailerConfig();

  if (!fromAddress) {
    return "";
  }

  return fromName ? `"${fromName}" <${fromAddress}>` : fromAddress;
}

function logEmailFallback(input: AppEmailInput) {
  console.log(
    `\n=========================================\n[EMAIL DELIVERY FALLBACK]\nTo: ${input.to}\nSubject: ${input.subject}\nReply-To: ${input.replyTo ?? "-"}\n\n${input.text}\n=========================================\n`,
  );
}

export function isMailerConfigured() {
  return hasMailerConfig();
}

export async function sendAppEmail(input: AppEmailInput) {
  const transporter = getMailer();

  if (!transporter) {
    logEmailFallback(input);
    return {
      ok: false as const,
      reason: "missing-config" as const,
    };
  }

  const info = await transporter.sendMail({
    from: getFormattedFrom(),
    html: input.html,
    replyTo: input.replyTo,
    subject: input.subject,
    text: input.text,
    to: input.to,
  });

  return {
    messageId: info.messageId,
    ok: true as const,
  };
}
