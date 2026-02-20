# Menu Fallback Structured Logging Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** `/api/menu/generate` fallback 발생 시 원인별 구조화 로그를 남긴다.

**Architecture:** OpenAI 호출 실패는 `OpenAiRequestError`로 표준화하고, 라우트에서 fallback 분기마다 `console.warn(JSON.stringify(...))`를 1회 출력한다. API 응답 스키마는 변경하지 않고 기존 `fallbackUsed` 계약을 유지한다.

**Tech Stack:** TypeScript, Next.js Route Handler, Vitest spy/mocks

---

Reference skills: `@superpowers/test-driven-development`, `@superpowers/verification-before-completion`

### Task 1: Route 로그 RED 테스트 추가

**Files:**
- Modify: `tests/unit/api/menu-generate.test.ts`
- Target implementation: `src/app/api/menu/generate/route.ts`

**Step 1: Write the failing test**

- OpenAI 실패 시 fallback + `console.warn` 1회 검증
- 파싱 실패 시 `reason: menu_parse_failed` 검증
- 로그 JSON에 `event/reason/attempts/status/retryable/timestamp` 검증

**Step 2: Run test to verify it fails**

Run: `pnpm test -- --run tests/unit/api/menu-generate.test.ts`  
Expected: 로그 관련 assertion FAIL

**Step 3: Write minimal implementation**

- route에 fallback 구조화 로그 함수 추가
- 파싱 실패와 예외 실패를 구분해 호출

**Step 4: Run test to verify it passes**

Run: `pnpm test -- --run tests/unit/api/menu-generate.test.ts`  
Expected: PASS

**Step 5: Commit**

```bash
git add tests/unit/api/menu-generate.test.ts src/app/api/menu/generate/route.ts
git commit -m "feat: add structured fallback logging in menu route"
```

### Task 2: OpenAI 커스텀 에러 메타 추가

**Files:**
- Modify: `src/lib/llm/openai.ts`
- Modify: `tests/unit/llm/openai.test.ts`

**Step 1: Write the failing test**

- 최종 실패에서 `OpenAiRequestError`가 `attempts/status/retryable` 메타를 포함하는지 검증

**Step 2: Run test to verify it fails**

Run: `pnpm test -- --run tests/unit/llm/openai.test.ts`  
Expected: custom error assertion FAIL

**Step 3: Write minimal implementation**

- `OpenAiRequestError` class 도입
- retry 루프 최종 실패 throw를 custom error로 교체

**Step 4: Run test to verify it passes**

Run: `pnpm test -- --run tests/unit/llm/openai.test.ts`  
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/llm/openai.ts tests/unit/llm/openai.test.ts
git commit -m "feat: expose openai error metadata for fallback logging"
```

### Task 3: Full Verification

**Files:**
- Modify: `IMPLEMENTATION_PLAN.md`

**Step 1: Run full backpressure commands**

1. `pnpm test -- --run`
2. `pnpm exec tsc --noEmit`
3. `pnpm lint`
4. `pnpm build`

Expected: all pass.

**Step 2: Update implementation checklist**

- `IMPLEMENTATION_PLAN.md`에 structured logging 완료 상태 반영

**Step 3: Commit**

```bash
git add IMPLEMENTATION_PLAN.md
git commit -m "docs: mark menu fallback logging verification complete"
```
