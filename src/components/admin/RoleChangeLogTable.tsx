import { RoleChangeLog } from "@/lib/auth/profile-server";

type RoleChangeLogTableProps = {
  logs: RoleChangeLog[];
};

export function RoleChangeLogTable({ logs }: RoleChangeLogTableProps) {
  return (
    <section className="story-panel fade-up">
      <h2>최근 권한 변경 이력</h2>
      {logs.length === 0 ? (
        <p>아직 기록이 없습니다.</p>
      ) : (
        <div className="list">
          {logs.map((log) => (
            <article key={log.id} className="flow-step">
              <h3>
                {log.targetEmail} : {log.oldRole} → {log.newRole}
              </h3>
              <p>
                변경자: {log.changedByEmail} | 시각: {new Date(log.createdAt).toLocaleString("ko-KR")}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
