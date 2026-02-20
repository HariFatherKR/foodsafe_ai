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

type FallbackReason =
  | "openai_request_failed"
  | "menu_parse_failed"
  | "unknown_error";

type FallbackLog = {
  event: "menu_generate_fallback";
  reason: FallbackReason;
  attempts: number | null;
  status: number | null;
  retryable: boolean | null;
  message: string;
  timestamp: string;
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

function toOptionalNumber(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

function toOptionalBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function buildFallbackLog(
  reason: FallbackReason,
  message: string,
  details?: {
    attempts?: unknown;
    status?: unknown;
    retryable?: unknown;
  },
): FallbackLog {
  return {
    event: "menu_generate_fallback",
    reason,
    attempts: toOptionalNumber(details?.attempts),
    status: toOptionalNumber(details?.status),
    retryable: toOptionalBoolean(details?.retryable),
    message,
    timestamp: new Date().toISOString(),
  };
}

function logFallback(log: FallbackLog): void {
  console.warn(JSON.stringify(log));
}

function buildErrorFallbackLog(error: unknown): FallbackLog {
  if (!error || typeof error !== "object") {
    return buildFallbackLog("unknown_error", "Unknown menu generation error");
  }

  const details = error as Record<string, unknown>;
  const message =
    error instanceof Error ? error.message : "Unknown menu generation error";

  if (details.code === "openai_request_failed") {
    return buildFallbackLog("openai_request_failed", message, {
      attempts: details.attempts,
      status: details.status,
      retryable: details.retryable,
    });
  }

  return buildFallbackLog("unknown_error", message);
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
      logFallback(
        buildFallbackLog(
          "menu_parse_failed",
          "Generated menu JSON did not match expected shape",
        ),
      );
      menuPlan = buildFallbackMenuPlan(constraints);
    } else {
      menuPlan = toMenuPlan(constraints, parsed);
    }
  } catch (error) {
    fallbackUsed = true;
    logFallback(buildErrorFallbackLog(error));
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
