import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadStore, saveStore } from "@/lib/storage/store";

describe("store", () => {
  let tempDir = "";
  let storePath = "";

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), "foodsafe-store-"));
    storePath = path.join(tempDir, "store.json");
    process.env.FOODSAFE_STORE_PATH = storePath;
  });

  afterEach(async () => {
    delete process.env.FOODSAFE_STORE_PATH;
    await rm(tempDir, { recursive: true, force: true });
  });

  it("loads defaults and persists updates", async () => {
    const initial = await loadStore();
    expect(initial.ingredients).toEqual([]);
    expect(initial.riskEvents).toEqual([]);
    expect(initial.menuPlans).toEqual([]);
    expect(initial.parentNotices).toEqual([]);

    const next = {
      ...initial,
      ingredients: [
        {
          id: "ing-1",
          name: "Milk",
          createdAt: "2026-02-16T00:00:00.000Z",
        },
      ],
    };

    await saveStore(next);

    const raw = JSON.parse(await readFile(storePath, "utf-8"));
    expect(raw.ingredients).toHaveLength(1);

    const loaded = await loadStore();
    expect(loaded.ingredients[0]?.name).toBe("Milk");
  });
});
