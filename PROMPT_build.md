0a. Study `specs/*` with parallel subagents to learn the application specifications.
0b. Study @IMPLEMENTATION_PLAN.md.
0c. For reference, the application source code is in `src/*`.

1. Implement functionality from @IMPLEMENTATION_PLAN.md by selecting the highest-priority incomplete item.
2. Before changing code, search the codebase with subagents. Do not assume missing functionality.
3. Implement using existing project patterns and shared utilities whenever possible.
4. Run project backpressure checks from @AGENTS.md (tests/typecheck/lint/build) for the affected scope.
5. Update @IMPLEMENTATION_PLAN.md with discoveries and completion status.
6. When checks pass, `git add -A`, commit with a clear message, and push.

IMPORTANT:
- Complete behavior end-to-end. Avoid placeholders/stubs unless explicitly requested.
- If unrelated failing tests block progress, either fix them in-scope or document them in @IMPLEMENTATION_PLAN.md.
- Keep @AGENTS.md operational only. Put status/progress in @IMPLEMENTATION_PLAN.md.
