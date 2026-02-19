# FoodSafeAI MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a hackathon-ready Next.js MVP that completes both risk-check and menu-generation E2E demo flows with parent feed reflection.

**Architecture:** Single Next.js App Router project with colocated API routes and UI pages. Domain data is stored in a local JSON store and accessed through a small storage abstraction. MFDS data is fetched server-side, normalized, then used by risk checking and menu cross-validation APIs.

**Tech Stack:** Next.js 16 (App Router), TypeScript, React, Vitest, Testing Library, ESLint, pnpm.

---

### Task 1: Bootstrap Project and Health Utility

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `src/lib/health.ts`
- Test: `tests/unit/health.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { getHealthStatus } from "@/lib/health";

describe("getHealthStatus", () => {
  it("returns ok payload", () => {
    expect(getHealthStatus()).toEqual({ status: "ok" });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/health.test.ts --run`
Expected: FAIL because `getHealthStatus` is missing.

**Step 3: Write minimal implementation**

```ts
export function getHealthStatus() {
  return { status: "ok" as const };
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/unit/health.test.ts --run`
Expected: PASS.

**Step 5: Commit**

```bash
git add package.json tsconfig.json next.config.ts vitest.config.ts vitest.setup.ts tests/unit/health.test.ts src/lib/health.ts
git commit -m "feat: bootstrap next app and add health utility"
```

### Task 2: Domain Types and Local JSON Store

**Files:**
- Create: `src/types/domain.ts`
- Create: `src/lib/storage/store.ts`
- Create: `data/store.json`
- Test: `tests/unit/storage/store.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { loadStore, saveStore } from "@/lib/storage/store";

describe("store", () => {
  it("loads and saves domain payload", async () => {
    const snapshot = await loadStore();
    await saveStore(snapshot);
    const next = await loadStore();
    expect(next.ingredients).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/storage/store.test.ts --run`
Expected: FAIL due to missing store module.

**Step 3: Write minimal implementation**

Implement domain types and file-backed JSON read/write with safe defaults.

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/unit/storage/store.test.ts --run`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/types/domain.ts src/lib/storage/store.ts data/store.json tests/unit/storage/store.test.ts
git commit -m "feat: add domain types and local json store"
```

### Task 3: MFDS Client and Normalizer

**Files:**
- Create: `src/lib/mfds/client.ts`
- Create: `src/lib/mfds/normalize.ts`
- Test: `tests/unit/mfds/normalize.test.ts`

**Step 1: Write the failing test**

Create tests for normalized fields, default values, and source metadata retention.

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/mfds/normalize.test.ts --run`
Expected: FAIL.

**Step 3: Write minimal implementation**

Implement MFDS fetch wrapper and record normalizer with defensive defaults.

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/unit/mfds/normalize.test.ts --run`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/mfds/client.ts src/lib/mfds/normalize.ts tests/unit/mfds/normalize.test.ts
git commit -m "feat: add mfds client and normalization"
```

### Task 4: Risk Matcher and Risk Check API

**Files:**
- Create: `src/lib/risk/matcher.ts`
- Create: `src/app/api/risk/check/route.ts`
- Test: `tests/unit/risk/matcher.test.ts`
- Test: `tests/unit/api/risk-check.test.ts`

**Step 1: Write the failing tests**

Add matcher unit tests for exact/partial matching and API route tests for response shape.

**Step 2: Run tests to verify failure**

Run: `pnpm test tests/unit/risk/matcher.test.ts tests/unit/api/risk-check.test.ts --run`
Expected: FAIL.

**Step 3: Write minimal implementation**

Build matcher scoring logic and route handler persisting risk events.

**Step 4: Run tests to verify pass**

Run: `pnpm test tests/unit/risk/matcher.test.ts tests/unit/api/risk-check.test.ts --run`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/risk/matcher.ts src/app/api/risk/check/route.ts tests/unit/risk/matcher.test.ts tests/unit/api/risk-check.test.ts
git commit -m "feat: add risk matcher and risk check api"
```

### Task 5: Menu Generation API with Fallback

**Files:**
- Create: `src/lib/menu/prompt.ts`
- Create: `src/lib/menu/fallback.ts`
- Create: `src/app/api/menu/generate/route.ts`
- Test: `tests/unit/api/menu-generate.test.ts`

**Step 1: Write the failing test**

Cover successful generation path and fallback path when AI parsing fails.

**Step 2: Run test to verify failure**

Run: `pnpm test tests/unit/api/menu-generate.test.ts --run`
Expected: FAIL.

**Step 3: Write minimal implementation**

Implement prompt builder, JSON parser guard, and deterministic fallback menu.

**Step 4: Run test to verify pass**

Run: `pnpm test tests/unit/api/menu-generate.test.ts --run`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/menu/prompt.ts src/lib/menu/fallback.ts src/app/api/menu/generate/route.ts tests/unit/api/menu-generate.test.ts
git commit -m "feat: add menu generation api with fallback"
```

### Task 6: Parent Feed APIs

**Files:**
- Create: `src/app/api/parent/feed/route.ts`
- Create: `src/app/api/parent/publish/route.ts`
- Test: `tests/unit/api/parent-feed.test.ts`

**Step 1: Write the failing test**

Cover publish behavior and feed ordering for notices and latest menu plan.

**Step 2: Run test to verify failure**

Run: `pnpm test tests/unit/api/parent-feed.test.ts --run`
Expected: FAIL.

**Step 3: Write minimal implementation**

Implement publish and feed handlers using local store persistence.

**Step 4: Run test to verify pass**

Run: `pnpm test tests/unit/api/parent-feed.test.ts --run`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/api/parent/feed/route.ts src/app/api/parent/publish/route.ts tests/unit/api/parent-feed.test.ts
git commit -m "feat: add parent feed and publish apis"
```

### Task 7: Nutritionist Page and Components

**Files:**
- Create: `src/app/nutritionist/page.tsx`
- Create: `src/components/nutritionist/*`
- Test: `tests/ui/nutritionist-page.test.tsx`

**Step 1: Write the failing test**

Validate key controls render: ingredient input, risk panel, menu generator, publish CTA.

**Step 2: Run test to verify failure**

Run: `pnpm test tests/ui/nutritionist-page.test.tsx --run`
Expected: FAIL.

**Step 3: Write minimal implementation**

Implement page layout and basic client interactions wired to APIs.

**Step 4: Run test to verify pass**

Run: `pnpm test tests/ui/nutritionist-page.test.tsx --run`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/nutritionist/page.tsx src/components/nutritionist tests/ui/nutritionist-page.test.tsx
git commit -m "feat: add nutritionist dashboard page"
```

### Task 8: Parent Page and Components

**Files:**
- Create: `src/app/parent/page.tsx`
- Create: `src/components/parent/*`
- Test: `tests/ui/parent-page.test.tsx`

**Step 1: Write the failing test**

Validate safety banner, notice list, allergy card, and menu preview render.

**Step 2: Run test to verify failure**

Run: `pnpm test tests/ui/parent-page.test.tsx --run`
Expected: FAIL.

**Step 3: Write minimal implementation**

Implement mobile-first parent feed UI and fetch integration.

**Step 4: Run test to verify pass**

Run: `pnpm test tests/ui/parent-page.test.tsx --run`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/parent/page.tsx src/components/parent tests/ui/parent-page.test.tsx
git commit -m "feat: add parent mobile page"
```

### Task 9: Reliability UI and Demo Seed Script

**Files:**
- Create: `src/components/common/SyncStatusChip.tsx`
- Create: `src/components/common/ErrorFallbackToast.tsx`
- Create: `scripts/seed-demo-data.ts`
- Test: `tests/unit/scripts/seed-demo-data.test.ts`

**Step 1: Write the failing test**

Cover seed script writing valid fixtures and idempotent behavior.

**Step 2: Run test to verify failure**

Run: `pnpm test tests/unit/scripts/seed-demo-data.test.ts --run`
Expected: FAIL.

**Step 3: Write minimal implementation**

Implement reusable reliability components and seed script.

**Step 4: Run test to verify pass**

Run: `pnpm test tests/unit/scripts/seed-demo-data.test.ts --run`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/common/SyncStatusChip.tsx src/components/common/ErrorFallbackToast.tsx scripts/seed-demo-data.ts tests/unit/scripts/seed-demo-data.test.ts
git commit -m "feat: add reliability widgets and demo seed script"
```

### Task 10: Runbook, README, and Full Verification

**Files:**
- Create: `docs/runbooks/foodsafeai-demo-runbook.md`
- Modify: `README.md`

**Step 1: Write docs for demo operation**

Document setup, seed command, risk E2E flow, menu E2E flow, and failure fallback story.

**Step 2: Run quality gate commands**

Run: `pnpm test`
Expected: PASS.

Run: `pnpm lint`
Expected: PASS.

Run: `pnpm build`
Expected: PASS.

**Step 3: Commit**

```bash
git add docs/runbooks/foodsafeai-demo-runbook.md README.md
git commit -m "docs: add demo runbook and update readme"
```
