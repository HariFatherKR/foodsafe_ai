# OpenAI Menu LLM Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** `POST /api/menu/generate`가 OpenAI(`gpt-5.2`)를 호출해 JSON Schema 준수 메뉴를 생성하고, 실패 시 기존 fallback 동작을 유지한다.

**Architecture:** `src/lib/llm/openai.ts`에 OpenAI 호출을 분리하고, `src/lib/menu/prompt.ts`는 프롬프트/파싱 책임만 유지한다. 라우트는 기존 저장 및 `fallbackUsed` 계약을 유지하며 LLM 에러를 fallback으로 흡수한다.

**Tech Stack:** Next.js 16, TypeScript, Vitest, OpenAI HTTP API(fetch), JSON Schema response format

---

Reference skills: `@superpowers/test-driven-development`, `@superpowers/verification-before-completion`

### Task 1: OpenAI 클라이언트 테스트 RED 만들기

**Files:**
- Create: `tests/unit/llm/openai.test.ts`
- Target implementation: `src/lib/llm/openai.ts`

**Step 1: Write the failing test**

```ts
import { afterEach, describe, expect, it, vi } from "vitest";

describe("generateOpenAiMenuJson", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_MODEL;
  });

  it("throws when OPENAI_API_KEY is missing", async () => {
    const { generateOpenAiMenuJson } = await import("@/lib/llm/openai");
    await expect(generateOpenAiMenuJson("prompt")).rejects.toThrow("OPENAI_API_KEY");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- --run tests/unit/llm/openai.test.ts`  
Expected: FAIL (`Cannot find module '@/lib/llm/openai'` 또는 동등 오류)

**Step 3: Write minimal implementation**

```ts
export async function generateOpenAiMenuJson(_prompt: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required");
  }
  throw new Error("not implemented");
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test -- --run tests/unit/llm/openai.test.ts`  
Expected: PASS (1 test)

**Step 5: Commit**

```bash
git add tests/unit/llm/openai.test.ts src/lib/llm/openai.ts
git commit -m "test: add initial openai llm client red-green"
```

### Task 2: OpenAI JSON Schema 응답 처리 구현

**Files:**
- Modify: `tests/unit/llm/openai.test.ts`
- Modify: `src/lib/llm/openai.ts`

**Step 1: Write the failing test**

```ts
it("returns JSON text from OpenAI response", async () => {
  process.env.OPENAI_API_KEY = "test-key";
  process.env.OPENAI_MODEL = "gpt-5.2";
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      new Response(
        JSON.stringify({ choices: [{ message: { content: "{\"days\":[]}" } }] }),
        { status: 200 },
      ),
    ),
  );

  const { generateOpenAiMenuJson } = await import("@/lib/llm/openai");
  const result = await generateOpenAiMenuJson("prompt");
  expect(result).toBe("{\"days\":[]}");
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- --run tests/unit/llm/openai.test.ts`  
Expected: FAIL (`not implemented`)

**Step 3: Write minimal implementation**

```ts
// POST https://api.openai.com/v1/chat/completions
// response_format: { type: "json_schema", json_schema: { ...strict schema... } }
// 반환 body에서 첫 message content 문자열을 추출해 return
```

**Step 4: Run test to verify it passes**

Run: `pnpm test -- --run tests/unit/llm/openai.test.ts`  
Expected: PASS (2+ tests)

**Step 5: Commit**

```bash
git add tests/unit/llm/openai.test.ts src/lib/llm/openai.ts
git commit -m "feat: implement openai json schema menu client"
```

### Task 3: 메뉴 생성 경로 연동 (prompt/route)

**Files:**
- Modify: `src/lib/menu/prompt.ts`
- Modify: `tests/unit/api/menu-generate.test.ts`

**Step 1: Write the failing test**

`tests/unit/api/menu-generate.test.ts`에서 `FOODSAFE_LLM_RESPONSE` 의존을 제거하고 `@/lib/llm/openai`를 mock한다.

```ts
vi.mock("@/lib/llm/openai", () => ({
  generateOpenAiMenuJson: vi.fn(async () =>
    JSON.stringify({
      days: [{ day: "Monday", items: ["Rice"], allergyWarnings: [] }],
    }),
  ),
}));
```

기대값:
- 성공 케이스 `fallbackUsed === false`
- 오류 throw 케이스 `fallbackUsed === true`

**Step 2: Run test to verify it fails**

Run: `pnpm test -- --run tests/unit/api/menu-generate.test.ts`  
Expected: FAIL (mock 함수가 실제 경로에서 사용되지 않음)

**Step 3: Write minimal implementation**

```ts
// src/lib/menu/prompt.ts
import { generateOpenAiMenuJson } from "@/lib/llm/openai";

export async function generateMenuFromAi(prompt: string): Promise<string> {
  return generateOpenAiMenuJson(prompt);
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test -- --run tests/unit/api/menu-generate.test.ts`  
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/menu/prompt.ts tests/unit/api/menu-generate.test.ts
git commit -m "refactor: wire menu generation to openai client"
```

### Task 4: 운영 문서와 환경변수 반영

**Files:**
- Modify: `README.md`
- Optional: `docs/runbooks/foodsafeai-demo-runbook.md`

**Step 1: Write the failing test/check**

문서 검증 체크리스트 작성:
- `OPENAI_API_KEY` 필수 표기
- `OPENAI_MODEL` 기본값 `gpt-5.2` 표기
- 실패 시 fallback 동작 표기

**Step 2: Run check to verify it fails**

Run: `rg -n "OPENAI_API_KEY|OPENAI_MODEL|fallback" README.md docs/runbooks/foodsafeai-demo-runbook.md`  
Expected: 관련 항목 누락

**Step 3: Write minimal implementation**

README 실행 섹션에 env 예시 추가:

```bash
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5.2
```

**Step 4: Run check to verify it passes**

Run: `rg -n "OPENAI_API_KEY|OPENAI_MODEL|fallback" README.md docs/runbooks/foodsafeai-demo-runbook.md`

**Step 5: Commit**

```bash
git add README.md docs/runbooks/foodsafeai-demo-runbook.md
git commit -m "docs: document openai env and fallback behavior"
```

### Task 5: Ralph Loop 백프레셔 검증 실행

**Files:**
- Create/Modify (if needed): `AGENTS.md`, `PROMPT_plan.md`, `PROMPT_build.md`, `IMPLEMENTATION_PLAN.md`, `loop.sh`

**Step 1: Write the failing setup check**

Run: `ls AGENTS.md PROMPT_plan.md PROMPT_build.md IMPLEMENTATION_PLAN.md loop.sh`  
Expected: 파일 누락 가능

**Step 2: Run setup to satisfy missing pieces**

Run: `bash ~/.codex/skills/ralph-loop/scripts/bootstrap-ralph-loop.sh --target .`

**Step 3: Write minimal configuration**

`AGENTS.md` 검증 게이트를 다음으로 설정:
- Tests: `pnpm test -- --run`
- Typecheck: `pnpm exec tsc --noEmit`
- Lint: `pnpm lint`
- Build: `pnpm build`

**Step 4: Run verification loops**

Run:
- `./loop.sh plan 1`
- `./loop.sh 1` (필요 횟수만큼 반복)

Expected:
- `IMPLEMENTATION_PLAN.md` 갱신
- 각 루프 후 검증 게이트 통과 유지

**Step 5: Commit**

```bash
git add AGENTS.md PROMPT_plan.md PROMPT_build.md IMPLEMENTATION_PLAN.md loop.sh
git commit -m "chore: add ralph loop workflow with validation gates"
```

### Final Verification

Run in order:

1. `pnpm test -- --run`
2. `pnpm exec tsc --noEmit`
3. `pnpm lint`
4. `pnpm build`

Expected: 모두 PASS, 경고/오류 없이 완료

### Final Delivery Commit

```bash
git add -A
git commit -m "feat: integrate openai menu generation with safe fallback"
```
