import "dotenv/config";

import argon2 from "argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL;
const fallbackEmail = "admin@portfolio.local";
const fallbackPassword = "ChangeMe123!";
const email = process.env.SEED_USER_EMAIL?.trim() || fallbackEmail;
const password = process.env.SEED_USER_PASSWORD || fallbackPassword;
const name = process.env.SEED_USER_NAME || "Rizaru Desu";
const role = process.env.SEED_USER_ROLE || "architect";
const username =
  process.env.SEED_USER_USERNAME ||
  email?.split("@")[0]?.toLowerCase().replace(/[^a-z0-9_]/g, "_");

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required.");
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({ adapter });

async function upsertCredentialAccount() {
  const normalizedEmail = email.toLowerCase();
  const hashedPassword = await argon2.hash(password);
  const now = new Date();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: {
      accounts: true,
    },
  });

  if (!existingUser) {
    const createdUser = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        emailVerified: true,
        image: null,
        createdAt: now,
        updatedAt: now,
        role,
        banned: false,
        banReason: null,
        banExpires: null,
        username,
        displayUsername: username,
      },
    });

    await prisma.account.create({
      data: {
        accountId: createdUser.id,
        providerId: "credential",
        userId: createdUser.id,
        password: hashedPassword,
        createdAt: now,
        updatedAt: now,
      },
    });

    return {
      status: "created",
      userId: createdUser.id,
      email: createdUser.email,
    };
  }

  await prisma.user.update({
    where: { id: existingUser.id },
    data: {
      name,
      emailVerified: true,
      updatedAt: now,
      role,
      banned: false,
      banReason: null,
      banExpires: null,
      username: existingUser.username || username,
      displayUsername: existingUser.displayUsername || username,
    },
  });

  const credentialAccount = existingUser.accounts.find(
    (account) => account.providerId === "credential",
  );

  if (credentialAccount) {
    await prisma.account.update({
      where: { id: credentialAccount.id },
      data: {
        accountId: existingUser.id,
        password: hashedPassword,
        updatedAt: now,
      },
    });

    return {
      status: "updated",
      userId: existingUser.id,
      email: normalizedEmail,
    };
  }

  await prisma.account.create({
    data: {
      accountId: existingUser.id,
      providerId: "credential",
      userId: existingUser.id,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    },
  });

  return {
    status: "linked-credential",
    userId: existingUser.id,
    email: normalizedEmail,
  };
}

try {
  if (!process.env.SEED_USER_EMAIL || !process.env.SEED_USER_PASSWORD) {
    console.log(
      JSON.stringify(
        {
          seedDefaults: {
            email,
            password,
            note: "Using development defaults because SEED_USER_EMAIL and/or SEED_USER_PASSWORD are not set.",
          },
        },
        null,
        2,
      ),
    );
  }

  const result = await upsertCredentialAccount();
  console.log(JSON.stringify(result, null, 2));
} finally {
  await prisma.$disconnect();
}
