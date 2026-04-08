import { createAccessControl } from "better-auth/plugins/access";

const statement = {
  portfolio: ["create", "read", "update", "delete"],
  article: ["create", "read", "update", "delete", "publish", "draft"],
  settings: ["manage"],
  user: ["manage", "create", "list", "ban"],
  session: ["list", "revoke"],
} as const;

export const ac = createAccessControl(statement);

export const architectRole = ac.newRole({
  portfolio: ["create", "read", "update", "delete"],
  article: ["create", "read", "update", "delete", "publish", "draft"],
  settings: ["manage"],
  user: ["manage", "create", "list", "ban"],
  session: ["list", "revoke"],
});

export const curatorRole = ac.newRole({
  article: ["create", "read", "update", "delete", "publish", "draft"],
});

export const artisanRole = ac.newRole({
  // Artisan only draft & publish their own (validation ownership handle on application level)
  article: ["create", "read", "update", "publish", "draft"],
});

export const apprenticeRole = ac.newRole({
  // Apprentice only draft/read
  article: ["create", "read", "update", "draft"],
});
