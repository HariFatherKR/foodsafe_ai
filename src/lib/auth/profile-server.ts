import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AppRole, isAppRole, isSelfDemotionBlocked } from "@/lib/auth/roles";

export type AppProfile = {
  id: string;
  email: string;
  role: AppRole;
  updatedAt: string;
};

export type RoleChangeLog = {
  id: string;
  targetUserId: string;
  oldRole: AppRole;
  newRole: AppRole;
  changedBy: string;
  targetEmail: string;
  changedByEmail: string;
  createdAt: string;
};

export type RoleUpdateErrorCode =
  | "authentication_required"
  | "admin_role_required"
  | "target_not_found"
  | "self_demotion_blocked"
  | "unknown";

export class RoleUpdateError extends Error {
  code: RoleUpdateErrorCode;

  constructor(code: RoleUpdateErrorCode, message: string) {
    super(message);
    this.name = "RoleUpdateError";
    this.code = code;
  }
}

type SupabaseErrorLike = {
  code?: string;
  message?: string;
};

function isNoRowsError(error: SupabaseErrorLike | null): boolean {
  return Boolean(error && error.code === "PGRST116");
}

function toRole(value: unknown): AppRole {
  if (!isAppRole(value)) {
    return "user";
  }

  return value;
}

function toProfile(row: Record<string, unknown>): AppProfile {
  return {
    id: String(row.id ?? ""),
    email: String(row.email ?? ""),
    role: toRole(row.role),
    updatedAt: String(row.updated_at ?? ""),
  };
}

function mapRoleUpdateError(error: SupabaseErrorLike): RoleUpdateError {
  const code = error.code ?? "";
  const message = error.message ?? "unknown error";
  const lowerMessage = message.toLowerCase();

  if (code === "42501" || lowerMessage.includes("admin role required")) {
    return new RoleUpdateError("admin_role_required", "관리자 권한이 필요합니다.");
  }

  if (code === "P0002" || lowerMessage.includes("target profile not found")) {
    return new RoleUpdateError("target_not_found", "대상 사용자를 찾을 수 없습니다.");
  }

  if (code === "P0001" || lowerMessage.includes("self demotion")) {
    return new RoleUpdateError(
      "self_demotion_blocked",
      "자기 계정을 user로 변경할 수 없습니다.",
    );
  }

  return new RoleUpdateError("unknown", message);
}

async function getCurrentAuthUser() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { supabase, user: null as null };
  }

  return { supabase, user: data.user };
}

type ServerSupabaseClient = Awaited<ReturnType<typeof createServerSupabaseClient>>;

async function fetchProfileById(supabase: ServerSupabaseClient, userId: string): Promise<AppProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,role,updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    if (isNoRowsError(error)) {
      return null;
    }

    throw error;
  }

  if (!data) {
    return null;
  }

  return toProfile(data);
}

export async function getCurrentProfile(): Promise<AppProfile | null> {
  const { supabase, user } = await getCurrentAuthUser();

  if (!user) {
    return null;
  }

  return fetchProfileById(supabase, user.id);
}

export async function ensureCurrentProfile(): Promise<AppProfile | null> {
  const { supabase, user } = await getCurrentAuthUser();

  if (!user) {
    return null;
  }

  const existing = await fetchProfileById(supabase, user.id);
  if (existing) {
    return existing;
  }

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email ?? "",
      role: "user",
    })
    .select("id,email,role,updated_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      return fetchProfileById(supabase, user.id);
    }

    throw error;
  }

  return toProfile(data);
}

export async function setUserRoleAsAdmin(
  targetUserId: string,
  nextRole: AppRole,
): Promise<AppProfile> {
  const { supabase, user } = await getCurrentAuthUser();
  if (!user) {
    throw new RoleUpdateError("authentication_required", "로그인이 필요합니다.");
  }

  const actorProfile = await ensureCurrentProfile();
  if (!actorProfile || actorProfile.role !== "admin") {
    throw new RoleUpdateError("admin_role_required", "관리자 권한이 필요합니다.");
  }

  if (
    isSelfDemotionBlocked({
      actorId: actorProfile.id,
      targetId: targetUserId,
      actorRole: actorProfile.role,
      nextRole,
    })
  ) {
    throw new RoleUpdateError(
      "self_demotion_blocked",
      "자기 계정을 user로 변경할 수 없습니다.",
    );
  }

  const { data, error } = await supabase.rpc("admin_set_user_role", {
    target_user_id: targetUserId,
    next_role: nextRole,
  });

  if (error) {
    throw mapRoleUpdateError(error);
  }

  if (!data || typeof data !== "object") {
    throw new RoleUpdateError("unknown", "권한 변경 결과를 확인할 수 없습니다.");
  }

  return toProfile(data as Record<string, unknown>);
}

export async function listProfilesForAdmin(): Promise<AppProfile[]> {
  const profile = await ensureCurrentProfile();
  if (!profile || profile.role !== "admin") {
    throw new RoleUpdateError("admin_role_required", "관리자 권한이 필요합니다.");
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,role,updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: Record<string, unknown>) => toProfile(row));
}

export async function listRoleChangeLogsForAdmin(limit = 20): Promise<RoleChangeLog[]> {
  const profile = await ensureCurrentProfile();
  if (!profile || profile.role !== "admin") {
    throw new RoleUpdateError("admin_role_required", "관리자 권한이 필요합니다.");
  }

  const supabase = await createServerSupabaseClient();

  const { data: logs, error: logError } = await supabase
    .from("role_change_logs")
    .select("id,target_user_id,old_role,new_role,changed_by,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (logError) {
    throw logError;
  }

  const userIds = Array.from(
    new Set(
      (logs ?? []).flatMap((log: Record<string, unknown>) => [
        String(log.target_user_id ?? ""),
        String(log.changed_by ?? ""),
      ]),
    ),
  ).filter(Boolean);

  const emailMap = new Map<string, string>();

  if (userIds.length > 0) {
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id,email")
      .in("id", userIds);

    if (profileError) {
      throw profileError;
    }

    for (const row of profiles ?? []) {
      emailMap.set(String(row.id ?? ""), String(row.email ?? ""));
    }
  }

  return (logs ?? []).map((log: Record<string, unknown>) => ({
    id: String(log.id ?? ""),
    targetUserId: String(log.target_user_id ?? ""),
    oldRole: toRole(log.old_role),
    newRole: toRole(log.new_role),
    changedBy: String(log.changed_by ?? ""),
    targetEmail: emailMap.get(String(log.target_user_id ?? "")) ?? "",
    changedByEmail: emailMap.get(String(log.changed_by ?? "")) ?? "",
    createdAt: String(log.created_at ?? ""),
  }));
}
