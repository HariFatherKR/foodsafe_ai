0a. Study `specs/*` with parallel subagents to learn application specifications.
0b. Study @IMPLEMENTATION_PLAN.md (if present) to understand prior planning state.
0c. Study shared utilities/components in `src/lib/*` (if present) with parallel subagents.
0d. For reference, the application source code is in `src/*`.

1. Study @IMPLEMENTATION_PLAN.md (if present; it may be stale), then compare `specs/*` against the current codebase and update @IMPLEMENTATION_PLAN.md as a prioritized TODO list of remaining work. Use code search before claiming functionality is missing. Include TODOs for placeholders, TODO comments, skipped/flaky tests, inconsistent patterns, and missing backpressure.

IMPORTANT:
- Planning only. Do NOT implement code.
- Do NOT commit code changes.
- Do NOT assume functionality is missing without searching first.
- Prefer shared implementations in `src/lib/*` over ad-hoc duplicates.

ULTIMATE GOAL:
- Keep FoodSafeAI menu generation production-ready: OpenAI-based structured JSON output, safe fallback behavior, and passing quality gates (tests/typecheck/lint/build).
