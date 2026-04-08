import { createAuthClient } from "better-auth/react";
import { adminClient, twoFactorClient, usernameClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    usernameClient(),
    twoFactorClient({
      twoFactorPage: "/two-factor",
    }),
    adminClient(),
  ],
});
