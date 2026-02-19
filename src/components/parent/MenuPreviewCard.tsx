import { ParentMenuPlan } from "@/components/parent/types";
import { toKoreanDayLabel } from "@/lib/menu/day-label";

type MenuPreviewCardProps = {
  menuPlan: ParentMenuPlan | null;
};

export function MenuPreviewCard({ menuPlan }: MenuPreviewCardProps) {
  return (
    <section className="story-panel fade-up">
      <h2>이번 주 메뉴 미리보기</h2>
      {!menuPlan ? (
        <p>등록된 주간 메뉴가 없습니다.</p>
      ) : (
        <ul className="list">
          {menuPlan.days.map((day) => (
            <li key={day.day}>
              <strong>{toKoreanDayLabel(day.day)}</strong>: {day.items.join(", ")}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
