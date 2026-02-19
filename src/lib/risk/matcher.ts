import { MfdsNormalizedRecord } from "@/lib/mfds/normalize";
import { Ingredient, RiskEvent } from "@/types/domain";

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

function isExactMatch(a: string, b: string): boolean {
  return normalize(a) === normalize(b);
}

function isPartialMatch(a: string, b: string): boolean {
  const left = normalize(a);
  const right = normalize(b);
  return left.includes(right) || right.includes(left);
}

export function matchRiskEvents(
  ingredients: Ingredient[],
  records: MfdsNormalizedRecord[],
): RiskEvent[] {
  const createdAt = new Date().toISOString();
  const result: RiskEvent[] = [];
  const seen = new Set<string>();

  for (const ingredient of ingredients) {
    for (const record of records) {
      const exact = isExactMatch(ingredient.name, record.ingredientName);
      const partial = !exact && isPartialMatch(ingredient.name, record.ingredientName);

      if (!exact && !partial) {
        continue;
      }

      const key = `${ingredient.name}:${record.sourceTitle}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);

      result.push({
        id: crypto.randomUUID(),
        ingredientName: ingredient.name,
        level: exact ? "danger" : "caution",
        sourceType: record.sourceType,
        sourceTitle: record.sourceTitle,
        sourceDate: record.sourceDate,
        sourceUrl: record.sourceUrl,
        autoMatched: true,
        suggestedSubstitute: partial ? undefined : `${ingredient.name} 대체 식자재`,
        createdAt,
      });
    }
  }

  return result;
}
