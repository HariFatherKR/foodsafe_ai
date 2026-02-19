import { NextResponse } from "next/server";
import { loadStore } from "@/lib/storage/store";

export async function GET() {
  const store = await loadStore();

  const notices = [...store.parentNotices].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  );
  const latestMenuPlan =
    store.menuPlans.length > 0 ? store.menuPlans[store.menuPlans.length - 1] : null;

  return NextResponse.json({
    notices,
    latestMenuPlan,
    syncedAt: store.lastSyncedAt,
  });
}
