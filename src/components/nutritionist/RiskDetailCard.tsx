import { RiskEventItem } from "@/components/nutritionist/types";

type RiskDetailCardProps = {
  riskEvents: RiskEventItem[];
};

export function RiskDetailCard({ riskEvents }: RiskDetailCardProps) {
  function levelMeta(level: RiskEventItem["level"]) {
    if (level === "danger") {
      return {
        label: "위험",
        className: "pill-chip pill-chip--danger",
      };
    }

    if (level === "caution") {
      return {
        label: "주의",
        className: "pill-chip pill-chip--warning",
      };
    }

    return {
      label: "안전",
      className: "pill-chip pill-chip--safe",
    };
  }

  return (
    <section className="story-panel fade-up">
      <h2>위험 상세 결과</h2>
      {riskEvents.length === 0 ? (
        <p>현재 식자재 기준으로 탐지된 위험 이벤트가 없습니다.</p>
      ) : (
        <ul className="list">
          {riskEvents.map((event) => {
            const meta = levelMeta(event.level);

            return (
              <li key={event.id}>
                <div className="input-row">
                  <strong>{event.ingredientName}</strong>
                  <span className={meta.className}>{meta.label}</span>
                </div>
                <p>근거 데이터: {event.sourceTitle}</p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
