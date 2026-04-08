export type UserStatusKey = "active" | "inactive" | "banned";
export type ManagedUserRole = "architect" | "curator" | "artisan" | "apprentice";

export const managedUserRoleOptions: ManagedUserRole[] = [
  "architect",
  "curator",
  "artisan",
  "apprentice",
];

export type ManagedUserRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  banned: boolean;
  banReason: string | null;
  banExpires: string | null;
  createdAt: string;
  updatedAt: string;
  sessionCount: number;
  inactive: boolean;
  lastSeenAt: string | null;
  statusKey: UserStatusKey;
  isCurrentUser: boolean;
};

export type ManagedUserActionResult = {
  ok: boolean;
  message: string;
};

export type CreateManagedUserInput = {
  email: string;
  name: string;
  password: string;
  role: ManagedUserRole;
};

export type BanManagedUserInput = {
  userId: string;
  banReason: string;
  banExpiresAt: string;
};

export function getUserStatus(record: Pick<ManagedUserRecord, "banned" | "inactive">): UserStatusKey {
  if (record.banned) {
    return "banned";
  }

  if (record.inactive) {
    return "inactive";
  }

  return "active";
}
