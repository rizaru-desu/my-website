import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { twoFactor, username, anonymous, admin } from "better-auth/plugins";
import * as argon2 from "argon2";
import { ac, architectRole, curatorRole, artisanRole, apprenticeRole } from "./permissions";

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
          console.log(
            `\n=========================================\n[2FA EMAIL OTP SIMULATION]\nTo: ${user.email}\nOTP: ${otp}\n=========================================\n`,
          );
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
        // TODO: Ganti dengan service email sungguhan (Resend, SendGrid, dsb.)
        console.log(
          `\n=========================================\n[DELETE ACCOUNT EMAIL SIMULATION]\nTo: ${user.email}\nConfirm deletion: ${url}\n=========================================\n`,
        );
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
      // TODO: Ganti dengan service email sungguhan (Resend, SendGrid, dsb.)
      console.log(`\n=========================================\n[RESET PASSWORD EMAIL SIMULATION]\nTo: ${user.email}\nLink: ${url}\n=========================================\n`);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    async sendVerificationEmail({ user, url }) {
      // TODO: Ganti dengan service email sungguhan (Resend, SendGrid, dsb.)
      console.log(`\n=========================================\n[VERIFICATION EMAIL SIMULATION]\nTo: ${user.email}\nLink: ${url}\n=========================================\n`);
    },
  },
});
