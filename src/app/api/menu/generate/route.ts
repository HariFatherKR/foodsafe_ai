import { NextResponse } from "next/server";
import { buildFallbackMenuPlan } from "@/lib/menu/fallback";
import {
  buildMenuPrompt,
  generateMenuFromAi,
  MenuConstraints,
  parseGeneratedMenu,
} from "@/lib/menu/prompt";
import { loadStore, saveStore } from "@/lib/storage/store";
import { MenuPlan } from "@/types/domain";

type MenuRequestBody = {
  constraints?: Partial<MenuConstraints>;
};

function normalizeConstraints(input?: Partial<MenuConstraints>): MenuConstraints {
  return {
    people: input?.people ?? 100,
    budget: input?.budget ?? 500000,
    allergies: input?.allergies ?? [],
  };
}

function toMenuPlan(
  constraints: MenuConstraints,
  days: NonNullable<ReturnType<typeof parseGeneratedMenu>>,
): MenuPlan {
  return {
    id: crypto.randomUUID(),
    constraints,
    days,
    createdAt: new Date().toISOString(),
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as MenuRequestBody;
  const constraints = normalizeConstraints(body.constraints);
  let fallbackUsed = false;
  let menuPlan: MenuPlan;

  try {
    const prompt = buildMenuPrompt(constraints);
    const aiRaw = await generateMenuFromAi(prompt);
    const parsed = parseGeneratedMenu(aiRaw);

    if (!parsed) {
      fallbackUsed = true;
      menuPlan = buildFallbackMenuPlan(constraints);
    } else {
      menuPlan = toMenuPlan(constraints, parsed);
    }
  } catch {
    fallbackUsed = true;
    menuPlan = buildFallbackMenuPlan(constraints);
  }

  const store = await loadStore();
  await saveStore({
    ...store,
    menuPlans: [...store.menuPlans, menuPlan],
  });

  return NextResponse.json({
    menuPlan,
    fallbackUsed,
  });
}
