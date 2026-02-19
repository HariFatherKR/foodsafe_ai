import { MenuPlan } from "@/types/domain";
import { MenuConstraints } from "@/lib/menu/prompt";

const DEFAULT_DAYS = ["월요일", "화요일", "수요일", "목요일", "금요일"];

const DEFAULT_ITEMS = [
  ["쌀밥", "닭곰탕", "김치"],
  ["보리밥", "콩나물국", "두부구이"],
  ["쌀밥", "미역국", "제육볶음"],
  ["쌀밥", "된장국", "생선구이"],
  ["쌀밥", "채소수프", "닭가슴살볶음"],
];

export function buildFallbackMenuPlan(constraints: MenuConstraints): MenuPlan {
  const createdAt = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    constraints,
    days: DEFAULT_DAYS.map((day, index) => ({
      day,
      items: DEFAULT_ITEMS[index] ?? ["쌀밥", "국", "반찬"],
      allergyWarnings: constraints.allergies,
      substitutions: [],
    })),
    createdAt,
  };
}
