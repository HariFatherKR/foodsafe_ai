import { describe, expect, it } from "vitest";
import { matchRiskEvents } from "@/lib/risk/matcher";
import { Ingredient } from "@/types/domain";
import { MfdsNormalizedRecord } from "@/lib/mfds/normalize";

describe("matchRiskEvents", () => {
  it("matches exact ingredient names as danger", () => {
    const ingredients: Ingredient[] = [
      {
        id: "i-1",
        name: "Milk",
        createdAt: "2026-02-16T00:00:00.000Z",
      },
    ];
    const records: MfdsNormalizedRecord[] = [
      {
        ingredientName: "Milk",
        sourceType: "recall",
        sourceTitle: "Recall",
        raw: {},
      },
    ];

    const result = matchRiskEvents(ingredients, records);
    expect(result).toHaveLength(1);
    expect(result[0]?.level).toBe("danger");
  });

  it("matches partial names as caution", () => {
    const ingredients: Ingredient[] = [
      {
        id: "i-2",
        name: "Egg",
        createdAt: "2026-02-16T00:00:00.000Z",
      },
    ];
    const records: MfdsNormalizedRecord[] = [
      {
        ingredientName: "Fresh Egg Liquid",
        sourceType: "administrative",
        sourceTitle: "Administrative notice",
        raw: {},
      },
    ];

    const result = matchRiskEvents(ingredients, records);
    expect(result).toHaveLength(1);
    expect(result[0]?.level).toBe("caution");
  });
});
