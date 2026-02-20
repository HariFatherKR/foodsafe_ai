import { NextResponse } from "next/server";
import { fetchNormalizedMfdsRecords } from "@/lib/mfds/client";
import { matchRiskEvents } from "@/lib/risk/matcher";
import { loadStore, saveStore } from "@/lib/storage/store";
import { Ingredient, RiskEvent } from "@/types/domain";

type RiskCheckBody = {
  ingredients?: Array<{
    name: string;
    supplier?: string;
    expiresAt?: string;
  }>;
};

function buildIncomingIngredients(body: RiskCheckBody): Ingredient[] {
  const createdAt = new Date().toISOString();
  return (body.ingredients ?? [])
    .filter((ingredient) => ingredient.name && ingredient.name.trim().length > 0)
    .map((ingredient) => ({
      id: crypto.randomUUID(),
      name: ingredient.name.trim(),
      supplier: ingredient.supplier,
      expiresAt: ingredient.expiresAt,
      createdAt,
    }));
}

export async function POST(request: Request) {
  const body = (await request.json()) as RiskCheckBody;
  const incomingIngredients = buildIncomingIngredients(body);
  const store = await loadStore();
  const nextIngredients = [...store.ingredients, ...incomingIngredients];

  let fromCache = false;
  let matchedRiskEvents: RiskEvent[] = [];
  let syncedAt = store.lastSyncedAt;

  try {
    const records = await fetchNormalizedMfdsRecords();
    matchedRiskEvents = matchRiskEvents(nextIngredients, records);
    syncedAt = new Date().toISOString();
  } catch {
    fromCache = true;
    matchedRiskEvents = [];
  }

  const nextStore = {
    ...store,
    ingredients: nextIngredients,
    riskEvents: [...store.riskEvents, ...matchedRiskEvents],
    lastSyncedAt: syncedAt,
  };
  await saveStore(nextStore);

  return NextResponse.json({
    riskEvents: matchedRiskEvents,
    fromCache,
    syncedAt,
  });
}
