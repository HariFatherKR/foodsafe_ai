## Build & Run

- Install dependencies: `pnpm install`
- Seed demo data: `pnpm seed:demo`
- Start dev server: `pnpm dev`
- Build production bundle: `pnpm build`

## Validation

Run these after each meaningful change:

- Tests: `pnpm test --run`
- Typecheck: `pnpm exec tsc --noEmit`
- Lint: `pnpm lint`
- Build: `pnpm build`

Final release gate (required before completion claim):

- `pnpm test --run && pnpm exec tsc --noEmit && pnpm lint && pnpm build`

## Operational Notes

- This repository uses Next.js App Router + TypeScript + pnpm.
- API handlers live in `src/app/api/*`, UI pages in `src/app/*`.
- Domain persistence goes through `src/lib/storage/store.ts`; avoid ad-hoc file writes.
- When running in a git worktree, Next.js may warn about multiple lockfiles; warning is expected unless `turbopack.root` is set.

Required/optional environment variables:

- `FOODSAFE_STORE_PATH` (optional): override JSON store path (default `data/store.json`)
- `FOODSAFE_LLM_RESPONSE` (optional): mocked JSON response for menu generation
- `MFDS_API_BASE_URL` (optional): MFDS base API URL
- `MFDS_API_KEY` (optional): MFDS service key

### Codebase Patterns

- Reuse shared domain logic in `src/lib/*` (`risk`, `mfds`, `menu`, `storage`) instead of duplicating in routes/components.
- Keep UI state in page-level containers and pass typed props into components.
- Prefer extending existing tests in `tests/unit/*` and `tests/ui/*` before adding new patterns.
