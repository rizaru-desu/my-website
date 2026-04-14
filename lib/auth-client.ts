import { createAuthClient } from "better-auth/react";
import { adminClient, twoFactorClient, usernameClient } from "better-auth/client/plugins";

import {
  ac,
  apprenticeRole,
  architectRole,
  artisanRole,
  curatorRole,
} from "@/lib/permissions";

export const authClient = createAuthClient({
  plugins: [
    usernameClient(),
    twoFactorClient({
      twoFactorPage: "/two-factor",
    }),
    adminClient({
      ac,
      roles: {
        apprentice: apprenticeRole,
        architect: architectRole,
        artisan: artisanRole,
        curator: curatorRole,
      },
    }),
  ],
});
