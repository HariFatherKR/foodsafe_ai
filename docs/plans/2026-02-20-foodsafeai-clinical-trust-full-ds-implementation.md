# FoodSafeAI Clinical Trust Full DS Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Clinical Trust 기반의 공통 UI/UX 규약을 적용해 상태 가시성, 입력 명확성, 접근성, 액션 신뢰도를 강화한다.

**Architecture:** 기존 App Router 구조를 유지하고 `src/components/common/*` 중심으로 공통 패턴을 추가한다. 페이지(`nutritionist`, `parent`)는 공통 상태/알림/라벨 규약을 소비하도록 최소 침습적으로 개선한다.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, Testing Library, CSS.

---

### Task 1: UI 계약을 테스트로 고정

**Files:**
- Modify: `tests/ui/nutritionist-page.test.tsx`
- Modify: `tests/ui/parent-page.test.tsx`

**Step 1: Write failing tests for new UI contracts**

- 영양사 페이지:
  - visible form labels (`식자재명`, `급식 인원`, `총 예산`) 존재
  - 메뉴 생성 중 버튼 loading text 노출
- 학부모 페이지:
  - TrustEvidenceBar 텍스트(데이터 출처/동기화 상태) 존재

**Step 2: Run tests to verify RED**

Run: `pnpm test tests/ui/nutritionist-page.test.tsx tests/ui/parent-page.test.tsx --run`
Expected: FAIL due to missing new UI behaviors.

**Step 3: Commit test changes (optional checkpoint)**

```bash
git add tests/ui/nutritionist-page.test.tsx tests/ui/parent-page.test.tsx
git commit -m "test: define clinical trust ui contracts"
```

### Task 2: 공통 신뢰/상태 컴포넌트 추가

**Files:**
- Create: `src/components/common/TrustEvidenceBar.tsx`
- Modify: `src/components/common/ErrorFallbackToast.tsx`
- Modify: `src/components/common/SyncStatusChip.tsx`
- Modify: `src/app/nutritionist/page.tsx`
- Modify: `src/app/parent/page.tsx`

**Step 1: Implement minimal code to satisfy tests**

- TrustEvidenceBar 추가 및 두 페이지에 배치
- Error/Status semantics 분리 (`role=alert` vs `role=status`)

**Step 2: Run target tests for GREEN**

Run: `pnpm test tests/ui/nutritionist-page.test.tsx tests/ui/parent-page.test.tsx --run`
Expected: PASS.

### Task 3: Field 라벨/로딩 액션 개선

**Files:**
- Modify: `src/components/nutritionist/IngredientInputPanel.tsx`
- Modify: `src/components/nutritionist/MenuGeneratorPanel.tsx`
- Modify: `src/components/nutritionist/RiskCheckPanel.tsx`
- Modify: `src/components/nutritionist/PublishNoticeButton.tsx`
- Modify: `src/app/nutritionist/page.tsx`

**Step 1: Implement minimal code**

- visible label 구조로 변경
- risk/menu/publish 액션 loading/disabled 상태 반영

**Step 2: Run affected tests**

Run: `pnpm test tests/ui/nutritionist-page.test.tsx --run`
Expected: PASS.

### Task 4: 스타일 토큰/접근성 강화

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Implement minimal style changes**

- high-contrast focus ring
- label, evidence bar, quick action chip 스타일 추가
- reduced-motion 정책 유지

**Step 2: Quick UI regression tests**

Run: `pnpm test tests/ui/nutritionist-page.test.tsx tests/ui/parent-page.test.tsx --run`
Expected: PASS.

### Task 5: 타입/검증 게이트 마무리

**Files:**
- Modify: `tests/unit/api/parent-feed.test.ts`

**Step 1: Fix typecheck issue**

- `GET` 핸들러 호출 시 시그니처와 맞지 않는 인자 제거

**Step 2: Run full verification**

Run:
- `pnpm test --run`
- `pnpm exec tsc --noEmit`
- `pnpm lint`
- `pnpm build`

Expected: All pass.

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: apply clinical trust design system baseline"
```
