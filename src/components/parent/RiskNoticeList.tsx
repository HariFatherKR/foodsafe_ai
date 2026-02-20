import { ParentNotice } from "@/components/parent/types";

type RiskNoticeListProps = {
  notices: ParentNotice[];
};

export function RiskNoticeList({ notices }: RiskNoticeListProps) {
  return (
    <section className="story-panel fade-up">
      <h2>최근 위험 공지</h2>
      {notices.length === 0 ? (
        <p>현재 확인할 위험 공지가 없습니다.</p>
      ) : (
        <ul className="list">
          {notices.map((notice) => (
            <li key={notice.id}>
              <strong>{notice.title}</strong>
              <p>{notice.body}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
