## Build & Run

Succinct rules for how to build and run this project.

- Install: `pnpm install`
- Dev server: `pnpm dev`
- Demo seed: `pnpm seed:demo`
- Local URL: `http://localhost:3000`

## Validation

Run these after implementing to apply backpressure:

- Tests: `pnpm test -- --run`
- Typecheck: `pnpm exec tsc --noEmit`
- Lint: `pnpm lint`
- Build: `pnpm build`

## Operational Notes

Keep this section short and operational:

- Required environment variables:
- `OPENAI_API_KEY` is required for real menu generation.
- `OPENAI_MODEL` is optional; default is `gpt-5.2`.
- No external DB required; store defaults to `data/store.json`.
- Override local store with `FOODSAFE_STORE_PATH`.

### Codebase Patterns

Short notes on shared patterns/utilities that should be reused.

- Keep API routes in `src/app/api/**/route.ts`.
- Reuse shared logic in `src/lib/**` instead of route-local duplication.
- Maintain fallback behavior for user-facing flows (`fallbackUsed` contract).
