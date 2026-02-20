0a. Read `specs/*`, @IMPLEMENTATION_PLAN.md, and @AGENTS.md before editing code.
0b. Select exactly one highest-priority unchecked TODO for this iteration.
0c. Search existing code/tests before implementing to avoid duplicate logic.

1. Implement the chosen stabilization/fix task end-to-end.
2. Run affected checks first, then run the full release gate from @AGENTS.md:
   `pnpm test --run && pnpm exec tsc --noEmit && pnpm lint && pnpm build`
3. If any gate fails, fix or document blocker evidence in @IMPLEMENTATION_PLAN.md.
4. Update @IMPLEMENTATION_PLAN.md:
   - mark completed items
   - add discovered follow-up tasks
   - record verification evidence (command + pass/fail summary)
5. Only when full release gate passes:
   - `git add -A`
   - commit with a concrete message
   - push only if explicit policy allows (`RALPH_PUSH=1`)

IMPORTANT:
- One task per loop iteration, one coherent commit.
- No placeholders/stubs unless explicitly requested.
- Do not declare completion without fresh command output evidence.
- Keep @AGENTS.md operational; write progress only in @IMPLEMENTATION_PLAN.md.
