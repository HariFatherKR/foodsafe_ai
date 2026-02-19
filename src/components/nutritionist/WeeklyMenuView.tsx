import { MenuPlan } from "@/components/nutritionist/types";
import { toKoreanDayLabel } from "@/lib/menu/day-label";

type WeeklyMenuViewProps = {
  menuPlan: MenuPlan | null;
  fallbackUsed: boolean;
};

export function WeeklyMenuView({ menuPlan, fallbackUsed }: WeeklyMenuViewProps) {
  return (
    <section className="story-panel fade-up">
      <h2>주간 메뉴 보기</h2>
      {!menuPlan ? (
        <p>생성된 메뉴가 없습니다.</p>
      ) : (
        <ul className="list">
          {menuPlan.days.map((day) => (
            <li key={day.day}>
              <strong>{toKoreanDayLabel(day.day)}</strong>: {day.items.join(", ")}
            </li>
          ))}
        </ul>
      )}
      {fallbackUsed ? (
        <p>AI 응답 지연으로 기본 대체 메뉴를 사용했습니다.</p>
      ) : null}
    </section>
  );
}
