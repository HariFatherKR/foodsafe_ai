import { FormEvent } from "react";

type IngredientInputPanelProps = {
  value: string;
  ingredients: string[];
  onValueChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function IngredientInputPanel({
  value,
  ingredients,
  onValueChange,
  onSubmit,
}: IngredientInputPanelProps) {
  return (
    <section className="story-panel fade-up">
      <h2>식자재 등록</h2>
      <p>학교에서 사용할 식자재를 먼저 등록하면 다음 단계에서 위해 정보를 빠르게 대조합니다.</p>
      <form onSubmit={onSubmit} className="input-row">
        <label className="field-group" htmlFor="ingredient-input">
          <span className="field-label">식자재명</span>
        </label>
        <input
          id="ingredient-input"
          className="input"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder="식자재명 입력 (예: 닭고기, 우유)"
          aria-label="식자재명"
        />
        <button className="btn-primary" type="submit">
          식자재 추가
        </button>
      </form>
      <p>등록 식자재: {ingredients.join(", ") || "없음"}</p>
    </section>
  );
}
