type MenuGeneratorPanelProps = {
  people: number;
  budget: number;
  allergies: string;
  onPeopleChange: (value: number) => void;
  onBudgetChange: (value: number) => void;
  onAllergiesChange: (value: string) => void;
  onGenerate: () => void;
};

export function MenuGeneratorPanel({
  people,
  budget,
  allergies,
  onPeopleChange,
  onBudgetChange,
  onAllergiesChange,
  onGenerate,
}: MenuGeneratorPanelProps) {
  return (
    <section className="story-panel story-panel--soft fade-up">
      <h2>메뉴 조건 설정</h2>
      <p>인원, 예산, 알레르기 조건을 반영해 안전한 급식안을 자동 제안합니다.</p>
      <div className="input-row">
        <input
          className="input--number"
          type="number"
          value={people}
          onChange={(event) => onPeopleChange(Number(event.target.value))}
          aria-label="급식 인원"
        />
        <input
          className="input--number"
          type="number"
          value={budget}
          onChange={(event) => onBudgetChange(Number(event.target.value))}
          aria-label="총 예산"
        />
        <input
          className="input"
          value={allergies}
          onChange={(event) => onAllergiesChange(event.target.value)}
          placeholder="알레르기 항목(쉼표 구분)"
          aria-label="알레르기 항목"
        />
        <button className="btn-secondary" type="button" onClick={onGenerate}>
          메뉴 생성
        </button>
      </div>
    </section>
  );
}
