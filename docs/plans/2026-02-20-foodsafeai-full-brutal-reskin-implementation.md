# FoodSafeAI Full Brutal Re-Skin Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 레퍼런스 이미지 무드의 강한 Brutal 스타일을 홈/영양사/학부모 전체 페이지에 적용하되, 기능 로직은 유지한다.

**Architecture:** 기존 Next.js App Router 페이지/컴포넌트 구조를 유지하고, 공통 토큰과 레이아웃 클래스를 전면 교체한다. 주요 화면은 대형 타이포, 강한 분할선, 비대칭 섹션 구조로 재편한다. API/도메인 로직은 건드리지 않고 UI 계층만 변경한다.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS, Vitest, Testing Library.

**Related Skills:** @test-driven-development, @verification-before-completion

---

### Task 1: 홈/페이지 계약 테스트 추가 (RED)

**Files:**
- Create: `tests/ui/home-page.test.tsx`
- Modify: `tests/ui/nutritionist-page.test.tsx`
- Modify: `tests/ui/parent-page.test.tsx`

**Step 1: Write failing tests**

```tsx
expect(screen.getByText(/SHIP GLOBAL/i)).toBeInTheDocument();
expect(screen.getByText(/RISK/i)).toBeInTheDocument();
expect(screen.getByText(/TODAY SAFETY/i)).toBeInTheDocument();
```

**Step 2: Run tests to verify RED**

Run: `pnpm test tests/ui/home-page.test.tsx tests/ui/nutritionist-page.test.tsx tests/ui/parent-page.test.tsx --run`
Expected: FAIL because new brutal layout/text contracts do not exist yet.

**Step 3: Commit test baseline**

```bash
git add tests/ui/home-page.test.tsx tests/ui/nutritionist-page.test.tsx tests/ui/parent-page.test.tsx
git commit -m "test: add brutal reskin ui contracts"
```

### Task 2: 공통 토큰/타이포/레이아웃 베이스 구축

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

**Step 1: Implement minimal brutal design tokens**

```css
:root { --bg: #050505; --accent: #ff3b00; --ink: #f2f2ea; --line: #1f1f1f; }
```

**Step 2: Add font imports and layout-safe defaults**

- Display: Anton
- Body: Epilogue
- Keep responsive defaults for mobile-first collapse

**Step 3: Verify no global regression**

Run: `pnpm test tests/ui/home-page.test.tsx --run`
Expected: Still failing on content contracts but no syntax/style import errors.

### Task 3: 홈(`/`) Brutal Re-Skin

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`

**Step 1: Implement minimal home structure**

- Top marquee bar
- Vertical mega hero typography
- Segment rail chips
- Hard-grid MFDS section

**Step 2: Run targeted tests**

Run: `pnpm test tests/ui/home-page.test.tsx --run`
Expected: PASS.

**Step 3: Commit**

```bash
git add src/app/page.tsx src/app/globals.css tests/ui/home-page.test.tsx
git commit -m "feat: apply brutal logistics home redesign"
```

### Task 4: 영양사(`/nutritionist`) Brutal Re-Skin

**Files:**
- Modify: `src/app/nutritionist/page.tsx`
- Modify: `src/components/nutritionist/*.tsx`
- Modify: `src/components/common/*.tsx`
- Modify: `src/app/globals.css`

**Step 1: Implement minimal layout conversion**

- First fold giant metrics: RISK / MENU / NOTICE
- Keep existing action handlers
- Convert panels/cards to hard-grid brutal style

**Step 2: Run tests**

Run: `pnpm test tests/ui/nutritionist-page.test.tsx --run`
Expected: PASS.

### Task 5: 학부모(`/parent`) Brutal Re-Skin

**Files:**
- Modify: `src/app/parent/page.tsx`
- Modify: `src/components/parent/*.tsx`
- Modify: `src/components/common/*.tsx`
- Modify: `src/app/globals.css`

**Step 1: Implement minimal layout conversion**

- Today safety headline-first fold
- asymmetric notices/menu blocks
- maintain mobile order of safety -> menu -> allergy

**Step 2: Run tests**

Run: `pnpm test tests/ui/parent-page.test.tsx --run`
Expected: PASS.

### Task 6: Responsive/visual polish and regression verification

**Files:**
- Modify: `src/app/globals.css`
- Modify: `tests/ui/home-page.test.tsx` (if text contracts changed)

**Step 1: Tune responsive breakpoints**

- 375px, 768px, 1024px, 1440px
- prevent horizontal overflow

**Step 2: Run full test gate**

Run: `pnpm test --run`
Expected: PASS.

### Task 7: Final verification and release checkpoint

**Files:**
- Modify: `IMPLEMENTATION_PLAN.md` (if using Ralph loop tracking)

**Step 1: Execute full verification**

Run:
- `pnpm test --run`
- `pnpm exec tsc --noEmit`
- `pnpm lint`
- `pnpm build`

Expected: All PASS.

**Step 2: Commit final reskin**

```bash
git add -A
git commit -m "feat: rollout full brutal reskin across all pages"
```
