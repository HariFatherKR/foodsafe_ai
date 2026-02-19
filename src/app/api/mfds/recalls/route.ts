import { NextResponse } from "next/server";
import { fetchMfdsPortalDatasets } from "@/lib/mfds/portal";
import { loadStore, saveStore } from "@/lib/storage/store";

export const runtime = "nodejs";

export async function GET() {
  const store = await loadStore();

  try {
    const datasets = await fetchMfdsPortalDatasets();
    const syncedAt = new Date().toISOString();

    await saveStore({
      ...store,
      lastSyncedAt: syncedAt,
    });

    return NextResponse.json({
      datasets,
      syncedAt,
      fromCache: false,
    });
  } catch {
    return NextResponse.json(
      {
        datasets: [],
        syncedAt: store.lastSyncedAt,
        fromCache: true,
      },
      { status: 200 },
    );
  }
}
