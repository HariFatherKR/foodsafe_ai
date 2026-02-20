import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const generateOpenAiMenuJsonMock = vi.fn<
  (prompt: string) => Promise<string>
>();

vi.mock("@/lib/llm/openai", () => ({
  generateOpenAiMenuJson: generateOpenAiMenuJsonMock,
}));

describe("/api/menu/generate POST", () => {
  let tempDir = "";
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), "foodsafe-menu-"));
    process.env.FOODSAFE_STORE_PATH = path.join(tempDir, "store.json");
    generateOpenAiMenuJsonMock.mockReset();
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(async () => {
    delete process.env.FOODSAFE_STORE_PATH;
    warnSpy.mockRestore();
    await rm(tempDir, { recursive: true, force: true });
  });

  it("returns fallback when ai output is invalid json", async () => {
    generateOpenAiMenuJsonMock.mockResolvedValue("not-json");

    const { POST } = await import("@/app/api/menu/generate/route");
    const response = await POST(
      new Request("http://localhost/api/menu/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          constraints: {
            people: 100,
            budget: 500000,
            allergies: ["milk"],
          },
        }),
      }),
    );

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.fallbackUsed).toBe(true);
    expect(data.menuPlan.days.length).toBeGreaterThan(0);
    expect(warnSpy).toHaveBeenCalledTimes(1);

    const rawLog = String(warnSpy.mock.calls[0]?.[0]);
    const log = JSON.parse(rawLog) as {
      event: string;
      reason: string;
      attempts: number | null;
      status: number | null;
      retryable: boolean | null;
      timestamp: string;
    };
    expect(log.event).toBe("menu_generate_fallback");
    expect(log.reason).toBe("menu_parse_failed");
    expect(log.attempts).toBeNull();
    expect(log.status).toBeNull();
    expect(log.retryable).toBeNull();
    expect(log.timestamp).toBeTruthy();
  });

  it("uses ai output when valid json is returned", async () => {
    generateOpenAiMenuJsonMock.mockResolvedValue(
      JSON.stringify({
        days: [
          {
            day: "Monday",
            items: ["Rice", "Soup"],
            allergyWarnings: ["milk"],
          },
        ],
      }),
    );

    const { POST } = await import("@/app/api/menu/generate/route");
    const response = await POST(
      new Request("http://localhost/api/menu/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          constraints: {
            people: 80,
            budget: 400000,
            allergies: [],
          },
        }),
      }),
    );

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.fallbackUsed).toBe(false);
    expect(data.menuPlan.days[0]?.day).toBe("Monday");
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("logs openai failure metadata when falling back", async () => {
    generateOpenAiMenuJsonMock.mockRejectedValue(
      Object.assign(new Error("OpenAI request failed: 500"), {
        code: "openai_request_failed",
        attempts: 3,
        status: 500,
        retryable: true,
      }),
    );

    const { POST } = await import("@/app/api/menu/generate/route");
    const response = await POST(
      new Request("http://localhost/api/menu/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          constraints: {
            people: 80,
            budget: 400000,
            allergies: [],
          },
        }),
      }),
    );

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.fallbackUsed).toBe(true);
    expect(warnSpy).toHaveBeenCalledTimes(1);

    const rawLog = String(warnSpy.mock.calls[0]?.[0]);
    const log = JSON.parse(rawLog) as {
      reason: string;
      attempts: number | null;
      status: number | null;
      retryable: boolean | null;
    };
    expect(log.reason).toBe("openai_request_failed");
    expect(log.attempts).toBe(3);
    expect(log.status).toBe(500);
    expect(log.retryable).toBe(true);
  });
});
