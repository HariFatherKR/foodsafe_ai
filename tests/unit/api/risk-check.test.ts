import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/mfds/client", () => ({
  fetchNormalizedMfdsRecords: vi.fn(async () => [
    {
      ingredientName: "Milk",
      sourceType: "recall",
      sourceTitle: "Recall notice",
      sourceDate: "2026-02-16",
      sourceUrl: "https://example.com/recall",
      raw: {},
    },
  ]),
}));

describe("/api/risk/check POST", () => {
  let tempDir = "";

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), "foodsafe-risk-"));
    process.env.FOODSAFE_STORE_PATH = path.join(tempDir, "store.json");
  });

  afterEach(async () => {
    delete process.env.FOODSAFE_STORE_PATH;
    await rm(tempDir, { recursive: true, force: true });
  });

  it("returns matched risk events", async () => {
    const { POST } = await import("@/app/api/risk/check/route");
    const request = new Request("http://localhost/api/risk/check", {
      method: "POST",
      body: JSON.stringify({
        ingredients: [{ name: "Milk" }],
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.riskEvents).toHaveLength(1);
    expect(data.riskEvents[0]?.ingredientName).toBe("Milk");
  });
});
