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

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), "foodsafe-menu-"));
    process.env.FOODSAFE_STORE_PATH = path.join(tempDir, "store.json");
    generateOpenAiMenuJsonMock.mockReset();
  });

  afterEach(async () => {
    delete process.env.FOODSAFE_STORE_PATH;
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
  });
});
