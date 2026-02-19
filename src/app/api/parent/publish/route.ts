import { NextResponse } from "next/server";
import { loadStore, saveStore } from "@/lib/storage/store";

type PublishBody = {
  title: string;
  body: string;
  riskEventIds?: string[];
  menuPlanId?: string;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as PublishBody;

  if (!payload.title || !payload.body) {
    return NextResponse.json(
      { message: "title과 body는 필수입니다." },
      { status: 400 },
    );
  }

  const store = await loadStore();
  const notice = {
    id: crypto.randomUUID(),
    title: payload.title.trim(),
    body: payload.body.trim(),
    riskEventIds: payload.riskEventIds ?? [],
    menuPlanId: payload.menuPlanId,
    createdAt: new Date().toISOString(),
  };

  await saveStore({
    ...store,
    parentNotices: [...store.parentNotices, notice],
  });

  return NextResponse.json({ notice });
}
