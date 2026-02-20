import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { DomainStore } from "@/types/domain";

const DEFAULT_STORE_PATH = path.join(process.cwd(), "data", "store.json");

export function createEmptyStore(): DomainStore {
  return {
    ingredients: [],
    riskEvents: [],
    menuPlans: [],
    parentNotices: [],
    lastSyncedAt: null,
  };
}

function getStorePath(): string {
  return process.env.FOODSAFE_STORE_PATH ?? DEFAULT_STORE_PATH;
}

export async function loadStore(): Promise<DomainStore> {
  const storePath = getStorePath();

  try {
    const content = await readFile(storePath, "utf-8");
    const parsed = JSON.parse(content) as Partial<DomainStore>;

    return {
      ingredients: parsed.ingredients ?? [],
      riskEvents: parsed.riskEvents ?? [],
      menuPlans: parsed.menuPlans ?? [],
      parentNotices: parsed.parentNotices ?? [],
      lastSyncedAt: parsed.lastSyncedAt ?? null,
    };
  } catch {
    const empty = createEmptyStore();
    await saveStore(empty);
    return empty;
  }
}

export async function saveStore(store: DomainStore): Promise<void> {
  const storePath = getStorePath();
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, JSON.stringify(store, null, 2), "utf-8");
}
