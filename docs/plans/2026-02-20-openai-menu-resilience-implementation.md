# OpenAI Menu Resilience Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** OpenAI 메뉴 호출에 timeout/retry를 적용해 일시 장애 시 성공률을 높이고 fallback 회귀를 방지한다.

**Architecture:** `src/lib/llm/openai.ts` 내부에 `fetch + AbortController timeout`을 적용하고, retry 대상 상태코드/네트워크 오류만 재시도한다. 구현 전후로 `tests/unit/llm/openai.test.ts`에 RED/GREEN 케이스를 추가해 동작을 고정한다.

**Tech Stack:** TypeScript, Vitest, Next.js server runtime fetch, AbortController

---

Reference skills: `@superpowers/test-driven-development`, `@superpowers/verification-before-completion`

### Task 1: Retry/Timeout RED 테스트 추가

**Files:**
- Modify: `tests/unit/llm/openai.test.ts`
- Target implementation: `src/lib/llm/openai.ts`

**Step 1: Write the failing test**

- `429` 후 `200` 응답이면 성공하며 `fetch` 2회 호출됨을 검증
- `500` 3회면 최종 throw 검증
- `400`은 재시도 없이 1회 호출 후 실패 검증
- timeout(AbortError) 후 성공 응답 복구 검증

**Step 2: Run test to verify it fails**

Run: `pnpm test -- --run tests/unit/llm/openai.test.ts`  
Expected: retry/timeout 관련 신규 테스트 FAIL

**Step 3: Write minimal implementation**

- `MAX_ATTEMPTS=3`, `TIMEOUT_MS=8000`
- retryable: `429`, `5xx`, 네트워크/AbortError
- backoff: 300ms, 600ms

**Step 4: Run test to verify it passes**

Run: `pnpm test -- --run tests/unit/llm/openai.test.ts`  
Expected: PASS

**Step 5: Commit**

```bash
git add tests/unit/llm/openai.test.ts src/lib/llm/openai.ts
git commit -m "feat: add retry and timeout for openai menu requests"
```

### Task 2: Full Backpressure Verification

**Files:**
- Modify: `IMPLEMENTATION_PLAN.md`

**Step 1: Run full verification**

Run:
1. `pnpm test -- --run`
2. `pnpm exec tsc --noEmit`
3. `pnpm lint`
4. `pnpm build`

Expected: all commands pass.

**Step 2: Mark plan progress**

- `IMPLEMENTATION_PLAN.md`에 resilience 완료 상태를 반영

**Step 3: Commit**

```bash
git add IMPLEMENTATION_PLAN.md
git commit -m "docs: mark openai resilience verification complete"
```
