type RiskCheckPanelProps = {
  onRun: () => void;
  disabled: boolean;
};

export function RiskCheckPanel({ onRun, disabled }: RiskCheckPanelProps) {
  return (
    <section className="story-panel fade-up">
      <h2>위해도 점검</h2>
      <p>식약처 최신 공개 데이터와 등록 식자재 목록을 교차 비교해 위험 징후를 찾습니다.</p>
      <button className="btn-primary" type="button" onClick={onRun} disabled={disabled}>
        위해도 검사 실행
      </button>
    </section>
  );
}
