## Build & Run

- Install dependencies: `pnpm install`
- Run local app: `pnpm dev`
- Seed local demo data: `pnpm seed:demo`
- Open app: `http://localhost:3000`

## Validation

Run these after implementing to apply backpressure:

- Tests: `pnpm test --run`
- Typecheck: `pnpm exec tsc --noEmit`
- Lint: `pnpm lint`
- Build: `pnpm build`

## Operational Notes

- Supabase auth integration requires:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
  - `NEXT_PUBLIC_SITE_URL`
- `ci-supabase` workflow expects `supabase/config.toml` in repository.
- In git worktree environments, Next.js may show multiple-lockfile root warning. This is expected if both root and worktree lockfiles exist.

### Codebase Patterns

- API routes: `src/app/api/**/route.ts`
- Domain logic/utilities: `src/lib/**`
- UI pages/components: `src/app/**`, `src/components/**`
- Tests: `tests/unit/**`, `tests/ui/**`
