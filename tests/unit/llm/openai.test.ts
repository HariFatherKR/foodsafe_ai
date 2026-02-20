import { afterEach, describe, expect, it, vi } from "vitest";

describe("generateOpenAiMenuJson", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_MODEL;
  });

  it("throws when OPENAI_API_KEY is missing", async () => {
    const { generateOpenAiMenuJson } = await import("@/lib/llm/openai");
    await expect(generateOpenAiMenuJson("prompt")).rejects.toThrow(
      "OPENAI_API_KEY is required",
    );
  });
});
