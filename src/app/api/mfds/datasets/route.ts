import { NextResponse } from "next/server";
import { fetchMfdsPortalDatasets } from "@/lib/mfds/portal";

export const runtime = "nodejs";

export async function GET() {
  try {
    const datasets = await fetchMfdsPortalDatasets();
    return NextResponse.json({
      datasets,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "MFDS 데이터 조회 실패",
        error: error instanceof Error ? error.message : "unknown",
      },
      { status: 502 },
    );
  }
}
