import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("parent feed api", () => {
  let tempDir = "";

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), "foodsafe-parent-"));
    process.env.FOODSAFE_STORE_PATH = path.join(tempDir, "store.json");
  });

  afterEach(async () => {
    delete process.env.FOODSAFE_STORE_PATH;
    await rm(tempDir, { recursive: true, force: true });
  });

  it("publishes notice and returns it in feed", async () => {
    const publishRoute = await import("@/app/api/parent/publish/route");
    const feedRoute = await import("@/app/api/parent/feed/route");

    const publishResponse = await publishRoute.POST(
      new Request("http://localhost/api/parent/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Safety update",
          body: "Milk risk found",
          riskEventIds: ["risk-1"],
        }),
      }),
    );

    expect(publishResponse.status).toBe(200);

    const feedResponse = await feedRoute.GET();
    expect(feedResponse.status).toBe(200);

    const data = await feedResponse.json();
    expect(data.notices).toHaveLength(1);
    expect(data.notices[0]?.title).toBe("Safety update");
  });
});
