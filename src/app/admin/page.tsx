import { redirect } from "next/navigation";
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
  const profile = await getCurrentProfile();

  if (!profile || !canAccessAdminPage(profile.role)) {
    redirect("/");
  }

  const [users, logs] = await Promise.all([
    listProfilesForAdmin(),
    listRoleChangeLogsForAdmin(),
  ]);

  const message = messageFromParams(params);

  return (
    <main className="page-shell">
      <div className="page-container">
        <HeaderRoleSwitch />

        <section className="story-panel fade-up">
          <h1>관리자 권한 관리</h1>
          <p>
            로그인 계정: <strong>{profile.email}</strong> ({profile.role})
          </p>
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

        <div className="story-grid">
          <UserRoleTable
            users={users}
            currentUserId={profile.id}
            onChangeRole={updateUserRoleAction}
          />
          <RoleChangeLogTable logs={logs} />
        </div>
      </div>
    </main>
  );
}
