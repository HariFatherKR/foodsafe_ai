export type AppRole = "admin" | "user";

export function isAppRole(value: unknown): value is AppRole {
  return value === "admin" || value === "user";
}

export function canAccessAdminPage(role: AppRole | null | undefined): boolean {
  return role === "admin";
}

type SelfDemotionInput = {
  actorId: string;
  targetId: string;
  actorRole: AppRole;
  nextRole: AppRole;
};

export function isSelfDemotionBlocked(input: SelfDemotionInput): boolean {
  return (
    input.actorRole === "admin" &&
    input.nextRole === "user" &&
    input.actorId === input.targetId
  );
}
