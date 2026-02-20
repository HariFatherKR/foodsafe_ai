import { AppProfile } from "@/lib/auth/profile-server";

type UserRoleTableProps = {
  users: AppProfile[];
  currentUserId: string;
  onChangeRole: (formData: FormData) => void | Promise<void>;
};

export function UserRoleTable({ users, currentUserId, onChangeRole }: UserRoleTableProps) {
  return (
    <section className="story-panel fade-up">
      <h2>사용자 등급 관리</h2>
      <div className="list">
        {users.map((user) => {
          const nextRole = user.role === "admin" ? "user" : "admin";
          const blockSelfDemotion =
            user.id === currentUserId && user.role === "admin" && nextRole === "user";

          return (
            <article key={user.id} className="flow-step">
              <h3>{user.email}</h3>
              <p>현재 등급: {user.role}</p>
              <form action={onChangeRole} className="input-row">
                <input type="hidden" name="targetUserId" value={user.id} />
                <input type="hidden" name="nextRole" value={nextRole} />
                <button
                  type="submit"
                  className="btn-secondary"
                  aria-label={`${user.email}-to-${nextRole}`}
                  disabled={blockSelfDemotion}
                >
                  {nextRole}로 변경
                </button>
              </form>
              {blockSelfDemotion ? (
                <p className="pill-chip pill-chip--warning">
                  자기 계정은 user로 변경할 수 없습니다.
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
