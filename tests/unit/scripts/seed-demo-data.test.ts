import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadStore } from "@/lib/storage/store";
import { seedDemoData } from "../../../scripts/seed-demo-data";

describe("seedDemoData", () => {
  let tempDir = "";

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), "foodsafe-seed-"));
    process.env.FOODSAFE_STORE_PATH = path.join(tempDir, "store.json");
  });

  afterEach(async () => {
    delete process.env.FOODSAFE_STORE_PATH;
    await rm(tempDir, { recursive: true, force: true });
  });

  it("seeds deterministic demo payload without duplication", async () => {
    await seedDemoData();
    const first = await loadStore();

    expect(first.ingredients.length).toBeGreaterThan(0);
    expect(first.riskEvents.length).toBeGreaterThan(0);
    expect(first.menuPlans.length).toBeGreaterThan(0);
    expect(first.parentNotices.length).toBeGreaterThan(0);

    await seedDemoData();
    const second = await loadStore();

    expect(second.ingredients.length).toBe(first.ingredients.length);
    expect(second.riskEvents.length).toBe(first.riskEvents.length);
    expect(second.menuPlans.length).toBe(first.menuPlans.length);
    expect(second.parentNotices.length).toBe(first.parentNotices.length);
  });
});
