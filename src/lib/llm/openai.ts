const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_OPENAI_MODEL = "gpt-5.2";

const MENU_PLAN_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["days"],
  properties: {
    days: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["day", "items", "allergyWarnings"],
        properties: {
          day: {
            type: "string",
          },
          items: {
            type: "array",
            minItems: 1,
            items: { type: "string" },
          },
          allergyWarnings: {
            type: "array",
            items: { type: "string" },
          },
          substitutions: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
    },
  },
} as const;

function extractMessageContent(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const root = payload as Record<string, unknown>;
  const choices = root.choices;
  if (!Array.isArray(choices) || choices.length === 0) {
    return null;
  }

  const firstChoice = choices[0];
  if (!firstChoice || typeof firstChoice !== "object") {
    return null;
  }

  const message = (firstChoice as Record<string, unknown>).message;
  if (!message || typeof message !== "object") {
    return null;
  }

  const content = (message as Record<string, unknown>).content;
  if (typeof content === "string" && content.trim().length > 0) {
    return content.trim();
  }

  if (!Array.isArray(content)) {
    return null;
  }

  const joined = content
    .map((part) => {
      if (!part || typeof part !== "object") {
        return "";
      }

      const text = (part as Record<string, unknown>).text;
      return typeof text === "string" ? text : "";
    })
    .join("")
    .trim();

  return joined.length > 0 ? joined : null;
}

export async function generateOpenAiMenuJson(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required");
  }

  const model = process.env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL;
  const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "menu_plan",
          strict: true,
          schema: MENU_PLAN_SCHEMA,
        },
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed: ${response.status}`);
  }

  const payload = (await response.json()) as unknown;
  const content = extractMessageContent(payload);
  if (!content) {
    throw new Error("OpenAI response did not include menu JSON");
  }

  return content;
}
