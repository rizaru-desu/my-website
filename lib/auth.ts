import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { twoFactor, username, anonymous, admin } from "better-auth/plugins";
import * as argon2 from "argon2";
import { ac, architectRole, curatorRole, artisanRole, apprenticeRole } from "./permissions";
import { sendAppEmail } from "./mailer";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildEmailHtml({
  body,
  ctaHref,
  ctaLabel,
  heading,
  preview,
}: {
  body: string[];
  ctaHref?: string;
  ctaLabel?: string;
  heading: string;
  preview: string;
}) {
  const bodyHtml = body
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;color:#1f2937;font-size:16px;line-height:1.7;">${escapeHtml(paragraph)}</p>`,
    )
    .join("");

  const ctaHtml =
    ctaHref && ctaLabel
      ? `<a href="${escapeHtml(ctaHref)}" style="display:inline-block;margin-top:8px;border:3px solid #111111;border-radius:999px;background:#2463eb;padding:14px 22px;color:#ffffff;font-size:12px;font-weight:700;letter-spacing:0.18em;text-decoration:none;text-transform:uppercase;">${escapeHtml(ctaLabel)}</a>`
      : "";

  return `
    <div style="background:#f6d54a;padding:32px 16px;font-family:'Space Grotesk',Arial,sans-serif;">
      <div style="margin:0 auto;max-width:640px;border:3px solid #111111;border-radius:28px;background:#fffdf4;padding:32px;box-shadow:8px 8px 0 #111111;">
        <p style="margin:0 0 12px;color:#5b6470;font-size:12px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;">Portofolio Admin</p>
        <h1 style="margin:0 0 16px;color:#111111;font-family:'Archivo Black',Arial,sans-serif;font-size:34px;line-height:1.05;text-transform:uppercase;">${escapeHtml(heading)}</h1>
        <p style="margin:0 0 24px;color:#334155;font-size:15px;line-height:1.7;">${escapeHtml(preview)}</p>
        ${bodyHtml}
        ${ctaHtml}
      </div>
    </div>
  `;
}

async function deliverAuthEmail({
  body,
  ctaHref,
  ctaLabel,
  heading,
  preview,
  subject,
  to,
}: {
  body: string[];
  ctaHref?: string;
  ctaLabel?: string;
  heading: string;
  preview: string;
  subject: string;
  to: string;
}) {
  await sendAppEmail({
    html: buildEmailHtml({
      body,
      ctaHref,
      ctaLabel,
      heading,
      preview,
    }),
    subject,
    text: [heading, "", preview, "", ...body, ctaHref && ctaLabel ? `${ctaLabel}: ${ctaHref}` : ""]
      .filter(Boolean)
      .join("\n"),
    to,
  });
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  appName: "Portofolio Admin",
  rateLimit: {
    window: 60,
    max: 100,
  },
  plugins: [
    twoFactor({
      issuer: "Portofolio Admin",
      // Keep Better Auth on its default enrollment path:
      // confirm password -> generate TOTP secret/QR -> verify code -> enable 2FA.
      skipVerificationOnEnable: false,
      otpOptions: {
        async sendOTP({ user, otp }) {
          await deliverAuthEmail({
            body: [
              `Use this one-time code to continue your sign-in flow: ${otp}`,
              "If you did not request this code, you can safely ignore this email.",
            ],
            heading: "Your 2FA Code",
            preview: "A fresh one-time verification code is ready for this sign-in attempt.",
            subject: "Your Portofolio Admin verification code",
            to: user.email,
          });
        },
      },
    }),
    username(),
    anonymous(),
    admin({
      ac,
      adminRoles: ["architect"],
      roles: {
        architect: architectRole,
        curator: curatorRole,
        artisan: artisanRole,
        apprentice: apprenticeRole,
      },
    }),
  ],
  user: {
    changeEmail: {
      enabled: true,
    },
    deleteUser: {
      enabled: true,
      async sendDeleteAccountVerification({ user, url }) {
        await deliverAuthEmail({
          body: [
            "Follow the confirmation link below if you still want to delete this account.",
            "If this request was not made by you, do not open the link and keep the account as it is.",
          ],
          ctaHref: url,
          ctaLabel: "Confirm Deletion",
          heading: "Delete Account Request",
          preview: "This verification step protects the account before permanent deletion.",
          subject: "Confirm your Portofolio Admin account deletion",
          to: user.email,
        });
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    customSyntheticUser: ({ coreFields, additionalFields, id }) => ({
      ...coreFields,
      role: "user",
      banned: false,
      banReason: null,
      banExpires: null,
      ...additionalFields,
      id,
    }),
    password: {
      hash: async (password: string) => {
        return await argon2.hash(password);
      },
      verify: async ({ hash, password }: { hash: string; password: string }) => {
        return await argon2.verify(hash, password);
      },
    },
    async sendResetPassword({ user, url }) {
      await deliverAuthEmail({
        body: [
          "Use the link below to reset your password and secure the account again.",
          "If you did not request a reset, you can ignore this message.",
        ],
        ctaHref: url,
        ctaLabel: "Reset Password",
        heading: "Reset Your Password",
        preview: "A password reset link is ready for your account.",
        subject: "Reset your Portofolio Admin password",
        to: user.email,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    async sendVerificationEmail({ user, url }) {
      await deliverAuthEmail({
        body: [
          "Open the verification link below to confirm the email address for this account.",
          "After confirmation, sign-in and password recovery flows can continue normally.",
        ],
        ctaHref: url,
        ctaLabel: "Verify Email",
        heading: "Verify Your Email",
        preview: "One quick confirmation keeps the account secure and fully active.",
        subject: "Verify your Portofolio Admin email",
        to: user.email,
      });
    },
  },
});
