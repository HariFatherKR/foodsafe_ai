export type MenuConstraints = {
  people: number;
  budget: number;
  allergies: string[];
};

export type GeneratedMenuDays = Array<{
  day: string;
  items: string[];
  allergyWarnings: string[];
  substitutions?: string[];
}>;

export function buildMenuPrompt(constraints: MenuConstraints): string {
  return [
    "You are a school nutrition planner.",
    "Return JSON only with shape {\"days\": [{\"day\": string, \"items\": string[], \"allergyWarnings\": string[], \"substitutions\"?: string[]}]}",
    `People: ${constraints.people}`,
    `Budget: ${constraints.budget}`,
    `Allergies: ${constraints.allergies.join(", ") || "none"}`,
  ].join("\n");
}

export async function generateMenuFromAi(prompt: string): Promise<string> {
  void prompt;
  const mocked = process.env.FOODSAFE_LLM_RESPONSE;
  if (!mocked) {
    throw new Error("LLM response is unavailable");
  }

  return mocked;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function parseGeneratedMenu(raw: string): GeneratedMenuDays | null {
  try {
    const payload = JSON.parse(raw) as { days?: unknown };
    if (!Array.isArray(payload.days)) {
      return null;
    }

    const days: GeneratedMenuDays = [];
    for (const day of payload.days) {
      if (!day || typeof day !== "object") {
        return null;
      }

      const current = day as Record<string, unknown>;
      if (typeof current.day !== "string" || !isStringArray(current.items)) {
        return null;
      }

      const allergyWarnings = isStringArray(current.allergyWarnings)
        ? current.allergyWarnings
        : [];

      const substitutions = isStringArray(current.substitutions)
        ? current.substitutions
        : undefined;

      days.push({
        day: current.day,
        items: current.items,
        allergyWarnings,
        substitutions,
      });
    }

    return days;
  } catch {
    return null;
  }
}
