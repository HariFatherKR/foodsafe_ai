0a. Read `specs/*` to understand the release/verification requirements.
0b. Read @IMPLEMENTATION_PLAN.md and keep only actionable, testable items.
0c. Use code search across `src/*` and `tests/*` before claiming missing behavior.
0d. Read @AGENTS.md and treat validation commands as non-negotiable gates.

1. Update @IMPLEMENTATION_PLAN.md into a prioritized stabilization plan for final release verification:
- Group by failing gate type: tests, typecheck, lint, build, runtime/manual.
- Each TODO must include evidence target (which command/output proves done).
- Include debt tasks for TODO/FIXME/skipped tests/flaky tests if found.
- Keep tasks small enough for one Ralph build iteration per commit.

2. Add a short "risk register" section in @IMPLEMENTATION_PLAN.md:
- unresolved blockers
- assumptions
- rollback notes if applicable

IMPORTANT:
- Planning only. Do NOT implement code in plan mode.
- Do NOT commit code changes in plan mode.
- Do NOT invent missing features without code search evidence.
- Prefer existing shared utilities in `src/lib/*`.

ULTIMATE GOAL:
- Reach a release-candidate state where all gates in @AGENTS.md pass and remaining risks are explicitly documented.
