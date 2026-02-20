# Implementation Plan

- [x] Integrate OpenAI menu client with JSON schema strict mode.
- [x] Add OpenAI request resilience (8s timeout, max 2 retries for retryable failures).
- [x] Wire `/api/menu/generate` to OpenAI client while preserving fallback behavior.
- [x] Add/update tests for OpenAI client and menu route behavior.
- [x] Document OpenAI environment variables and fallback behavior.
- [x] Run final backpressure checks from `AGENTS.md` and summarize results.
