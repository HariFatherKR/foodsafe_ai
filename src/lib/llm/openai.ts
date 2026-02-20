const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_OPENAI_MODEL = "gpt-5.2";
const REQUEST_TIMEOUT_MS = 8_000;
const MAX_ATTEMPTS = 3;
const RETRY_BACKOFF_MS = [300, 600];
const OPENAI_REQUEST_FAILED_CODE = "openai_request_failed";

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

function isRetryableStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.name === "AbortError" || error.name === "TypeError";
}

function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error(String(error));
}

function backoffDelayMs(attempt: number): number {
  return RETRY_BACKOFF_MS[attempt - 1] ?? RETRY_BACKOFF_MS[RETRY_BACKOFF_MS.length - 1] ?? 0;
}

function buildRequestBody(model: string, prompt: string): string {
  return JSON.stringify({
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
  });
}

async function sleep(ms: number): Promise<void> {
  if (ms <= 0) {
    return;
  }
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(
  apiKey: string,
  model: string,
  prompt: string,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: buildRequestBody(model, prompt),
      cache: "no-store",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

type OpenAiErrorPhase = "network" | "http" | "response";

type OpenAiRequestErrorInput = {
  message: string;
  attempts: number;
  status: number | null;
  retryable: boolean;
  phase: OpenAiErrorPhase;
};

export class OpenAiRequestError extends Error {
  readonly code = OPENAI_REQUEST_FAILED_CODE;
  readonly attempts: number;
  readonly status: number | null;
  readonly retryable: boolean;
  readonly phase: OpenAiErrorPhase;

  constructor(input: OpenAiRequestErrorInput) {
    super(input.message);
    this.name = "OpenAiRequestError";
    this.attempts = input.attempts;
    this.status = input.status;
    this.retryable = input.retryable;
    this.phase = input.phase;
  }
}

export async function generateOpenAiMenuJson(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required");
  }

  const model = process.env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL;
  let lastError: OpenAiRequestError | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    let response: Response;

    try {
      response = await fetchWithTimeout(apiKey, model, prompt);
    } catch (error) {
      const current = toError(error);
      const retryable = isRetryableError(current);
      const wrapped = new OpenAiRequestError({
        message: current.message,
        attempts: attempt,
        status: null,
        retryable,
        phase: "network",
      });

      if (attempt < MAX_ATTEMPTS && retryable) {
        lastError = wrapped;
        await sleep(backoffDelayMs(attempt));
        continue;
      }
      throw wrapped;
    }

    if (!response.ok) {
      const retryable = isRetryableStatus(response.status);
      const wrapped = new OpenAiRequestError({
        message: `OpenAI request failed: ${response.status}`,
        attempts: attempt,
        status: response.status,
        retryable,
        phase: "http",
      });

      if (attempt < MAX_ATTEMPTS && retryable) {
        lastError = wrapped;
        await sleep(backoffDelayMs(attempt));
        continue;
      }
      throw wrapped;
    }

    const payload = (await response.json()) as unknown;
    const content = extractMessageContent(payload);
    if (!content) {
      throw new OpenAiRequestError({
        message: "OpenAI response did not include menu JSON",
        attempts: attempt,
        status: response.status,
        retryable: false,
        phase: "response",
      });
    }

    return content;
  }

  throw (
    lastError ??
    new OpenAiRequestError({
      message: "OpenAI request failed",
      attempts: MAX_ATTEMPTS,
      status: null,
      retryable: false,
      phase: "http",
    })
  );
}
