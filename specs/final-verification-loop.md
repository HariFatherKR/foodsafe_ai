# Final Verification Loop Spec

## Purpose

Define how Ralph Loop is used only for final stabilization and release verification.

## Scope

- Validate release gates in `AGENTS.md` repeatedly until stable.
- Fix only verified regressions/blockers.
- Keep changes minimal and evidence-driven.

## Out of Scope

- Large feature work
- Design rewrites
- Schema/migration overhauls unless required to pass gates

## Done Criteria

- Full gate passes with fresh evidence:
  - `pnpm test --run`
  - `pnpm exec tsc --noEmit`
  - `pnpm lint`
  - `pnpm build`
- `IMPLEMENTATION_PLAN.md` updated with completed items and residual risks.
- Manual smoke checks for `/nutritionist` and `/parent` recorded.

## Loop Discipline

- One task per iteration.
- One coherent commit per completed task.
- Push disabled by default (`RALPH_PUSH=0`) unless explicitly enabled.
