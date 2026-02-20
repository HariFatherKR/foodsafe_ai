# Implementation Plan

## Objective

Create a final-verification loop that safely stabilizes this branch and proves release readiness with repeatable gates.

## Verification Gates

- Tests: `pnpm test --run`
- Typecheck: `pnpm exec tsc --noEmit`
- Lint: `pnpm lint`
- Build: `pnpm build`
- Final gate: `pnpm test --run && pnpm exec tsc --noEmit && pnpm lint && pnpm build`

## Prioritized TODOs

- [x] Capture baseline by running full final gate and recording output summary.
- [x] Identify and fix highest-impact failing gate item:
  - fixed `tests/unit/api/parent-feed.test.ts` GET call signature mismatch
- [x] Re-run full final gate and confirm all commands pass.
- [ ] Run manual smoke flows:
  - [ ] `/nutritionist` core flow (ingredient -> risk check -> menu generate -> publish)
  - [ ] `/parent` feed flow (safety banner -> notices -> menu/alergy cards)
- [ ] Prepare release notes snippet:
  - [ ] changed files summary
  - [ ] risk/known limitations summary

## Risk Register

- Next.js worktree warning for multiple lockfiles may appear during `pnpm build`; this is expected unless `turbopack.root` is set.
- External MFDS/LLM dependencies can fail; app should continue via fallback/cache paths.

## Evidence Log

- 2026-02-20 baseline in verification worktree:
  - `pnpm test --run`: PASS (11 files, 18 tests)
  - `pnpm exec tsc --noEmit`: FAIL (`tests/unit/api/parent-feed.test.ts:38`, TS2554)
  - `pnpm lint`: PASS
  - `pnpm build`: PASS (with worktree lockfile warning)
- 2026-02-20 after design-system baseline update:
  - `pnpm test --run`: PASS (11 files, 19 tests)
  - `pnpm exec tsc --noEmit`: PASS
  - `pnpm lint`: PASS
  - `pnpm build`: PASS (with worktree lockfile warning)
