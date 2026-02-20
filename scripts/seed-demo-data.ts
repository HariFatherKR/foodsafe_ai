import { saveStore } from "@/lib/storage/store";
import { DomainStore } from "@/types/domain";
import { pathToFileURL } from "node:url";

const DEMO_CREATED_AT = "2026-02-16T09:00:00.000Z";

function createDemoStore(): DomainStore {
  return {
    ingredients: [
      {
        id: "ing-1",
        name: "Milk",
        supplier: "SafeFoods",
        createdAt: DEMO_CREATED_AT,
      },
      {
        id: "ing-2",
        name: "Egg",
        supplier: "GreenFarm",
        createdAt: DEMO_CREATED_AT,
      },
    ],
    riskEvents: [
      {
        id: "risk-1",
        ingredientName: "Milk",
        level: "danger",
        sourceType: "recall",
        sourceTitle: "우유 리콜 공지",
        sourceDate: "2026-02-15",
        sourceUrl: "https://example.com/recall/milk",
        autoMatched: true,
        suggestedSubstitute: "두유",
        createdAt: DEMO_CREATED_AT,
      },
    ],
    menuPlans: [
      {
        id: "menu-1",
        constraints: {
          people: 120,
          budget: 450000,
          allergies: ["milk"],
        },
        days: [
          {
            day: "Monday",
            items: ["Rice", "Tofu Soup", "Chicken Salad"],
            allergyWarnings: ["milk"],
            substitutions: ["두유 소스"],
          },
        ],
        createdAt: DEMO_CREATED_AT,
      },
    ],
    parentNotices: [
      {
        id: "notice-1",
        title: "우유 리콜 관련 안내",
        body: "우유 식자재를 대체 식자재로 교체했습니다.",
        riskEventIds: ["risk-1"],
        menuPlanId: "menu-1",
        createdAt: DEMO_CREATED_AT,
      },
    ],
    lastSyncedAt: DEMO_CREATED_AT,
  };
}

export async function seedDemoData(): Promise<void> {
  await saveStore(createDemoStore());
}

async function runCli() {
  await seedDemoData();
  console.log("Demo data seeded.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
