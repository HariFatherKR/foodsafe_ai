# Implementation Plan

- [x] Integrate OpenAI menu client with JSON schema strict mode.
- [x] Add OpenAI request resilience (8s timeout, max 2 retries for retryable failures).
- [x] Wire `/api/menu/generate` to OpenAI client while preserving fallback behavior.
- [x] Add structured fallback logging with OpenAI failure metadata (`attempts/status/retryable`).
- [x] Add/update tests for OpenAI client and menu route behavior.
- [x] Document OpenAI environment variables and fallback behavior.
- [x] Run final backpressure checks from `AGENTS.md` and summarize results.
- [x] Add CI workflow drafts (`ci-fast`, `ci-build`, `ci-supabase`) and verify with tests.
- [x] Configure branch protection required checks on `main`.
- [x] Bootstrap Ralph loop files and replace placeholders with operational project commands.
- [ ] Add `specs/` source-of-truth documents for personal nutrition MVP requirements.
- [ ] Implement Supabase schema/RLS and auth-protected APIs for personal mode.
- [ ] Build personal nutrition flow UI: today log, scan/search, recommendation, safety.
- [ ] Add Supabase-aware CI checks once `supabase/config.toml` and migrations land.
