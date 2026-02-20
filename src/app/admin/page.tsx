import { HeaderRoleSwitch } from "@/components/common/HeaderRoleSwitch";
import { RoleChangeLogTable } from "@/components/admin/RoleChangeLogTable";
import { UserRoleTable } from "@/components/admin/UserRoleTable";
import { canAccessAdminPage } from "@/lib/auth/roles";
import {
  getCurrentProfile,
  listProfilesForAdmin,
  listRoleChangeLogsForAdmin,
} from "@/lib/auth/profile-server";
import { updateUserRoleAction } from "./actions";

type AdminPageProps = {
  searchParams?: Promise<{
    status?: string;
    error?: string;
  }>;
};

function messageFromParams(params: { status?: string; error?: string }) {
  if (params.status === "role_updated") {
    return { type: "safe" as const, text: "사용자 등급을 업데이트했습니다." };
  }

  switch (params.error) {
    case "admin_role_required":
      return { type: "danger" as const, text: "관리자 권한이 필요합니다." };
    case "self_demotion_blocked":
      return {
        type: "danger" as const,
        text: "자기 계정은 user로 변경할 수 없습니다.",
      };
    case "target_not_found":
      return { type: "danger" as const, text: "대상 사용자를 찾을 수 없습니다." };
    case "invalid_request":
      return { type: "warning" as const, text: "요청 값이 올바르지 않습니다." };
    case "unknown":
      return { type: "danger" as const, text: "권한 변경에 실패했습니다." };
    default:
      return null;
  }
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = (await searchParams) ?? {};
  let profile = null;
  try {
    profile = await getCurrentProfile();
  } catch {
    profile = null;
  }

  const canManage = Boolean(profile && canAccessAdminPage(profile.role));
  let users: Awaited<ReturnType<typeof listProfilesForAdmin>> = [];
  let logs: Awaited<ReturnType<typeof listRoleChangeLogsForAdmin>> = [];

  if (canManage) {
    try {
      [users, logs] = await Promise.all([
        listProfilesForAdmin(),
        listRoleChangeLogsForAdmin(),
      ]);
    } catch {
      users = [];
      logs = [];
    }
  }

  const message = messageFromParams(params);

  return (
    <main className="page-shell">
      <div className="page-container">
        <HeaderRoleSwitch />

        <section className="story-panel fade-up">
          <h1>관리자 권한 관리</h1>
          {profile ? (
            <p>
              로그인 계정: <strong>{profile.email}</strong> ({profile.role})
            </p>
          ) : (
            <p>공개 모드입니다. 모든 페이지에 로그인 없이 접근할 수 있습니다.</p>
          )}
          {message ? (
            <p
              className={`pill-chip ${
                message.type === "safe"
                  ? "pill-chip--safe"
                  : message.type === "warning"
                    ? "pill-chip--warning"
                    : "pill-chip--danger"
              }`}
            >
              {message.text}
            </p>
          ) : null}
        </section>

        {canManage && profile ? (
          <div className="story-grid">
            <UserRoleTable
              users={users}
              currentUserId={profile.id}
              onChangeRole={updateUserRoleAction}
            />
            <RoleChangeLogTable logs={logs} />
          </div>
        ) : (
          <section className="story-panel fade-up">
            <h2>권한 관리 기능</h2>
            <p>
              현재는 공개 모드로 운영 중이며, 권한 변경 기능은 로그인/권한 설정 후
              활성화됩니다.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
