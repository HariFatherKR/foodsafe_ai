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

  it("returns JSON content from OpenAI chat completions response", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_MODEL = "gpt-5.2";

    const fetchMock = vi.fn<
      (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
    >(async () => {
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content:
                  '{"days":[{"day":"Monday","items":["Rice"],"allergyWarnings":[]}]}',
              },
            },
          ],
        }),
        { status: 200 },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const { generateOpenAiMenuJson } = await import("@/lib/llm/openai");
    const result = await generateOpenAiMenuJson("menu prompt");

    expect(result).toBe(
      '{"days":[{"day":"Monday","items":["Rice"],"allergyWarnings":[]}]}',
    );
  });

  it("sends JSON schema format and default model", async () => {
    process.env.OPENAI_API_KEY = "test-key";

    const fetchMock = vi.fn<
      (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
    >(async () => {
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: '{"days":[]}',
              },
            },
          ],
        }),
        { status: 200 },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const { generateOpenAiMenuJson } = await import("@/lib/llm/openai");
    await generateOpenAiMenuJson("prompt for schema");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const options = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined;
    const payload = JSON.parse(String(options?.body)) as {
      model: string;
      response_format: {
        type: string;
        json_schema: { name: string; strict: boolean; schema: unknown };
      };
    };

    expect(payload.model).toBe("gpt-5.2");
    expect(payload.response_format.type).toBe("json_schema");
    expect(payload.response_format.json_schema.name).toBe("menu_plan");
    expect(payload.response_format.json_schema.strict).toBe(true);
  });

  it("throws when OpenAI returns non-ok status", async () => {
    process.env.OPENAI_API_KEY = "test-key";

    const fetchMock = vi.fn<
      (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
    >(async () => {
      return new Response("bad request", { status: 400 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const { generateOpenAiMenuJson } = await import("@/lib/llm/openai");
    await expect(generateOpenAiMenuJson("prompt")).rejects.toThrow(
      "OpenAI request failed: 400",
    );
  });
});
