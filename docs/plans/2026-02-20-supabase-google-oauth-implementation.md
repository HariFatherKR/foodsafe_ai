# FoodSafeAI Supabase Google OAuth Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Vercel 배포 환경에서 Supabase Google OAuth 로그인을 추가하고 전체 앱 경로를 서버 측에서 보호한다.

**Architecture:** `@supabase/ssr` 클라이언트를 브라우저/서버/미들웨어로 분리한다. `middleware.ts`가 보호 경로 접근 시 세션을 검증하고 비로그인 요청은 `/auth/login`으로 보낸다. `/auth/callback` Route Handler가 code를 session으로 교환하고 안전한 목적지로 리다이렉트한다.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Vitest, Supabase SSR (`@supabase/ssr`, `@supabase/supabase-js`).

---

### Task 1: Add Auth Guard Utilities (TDD)
- `tests/unit/auth/guard.test.ts`
- `src/lib/auth/guard.ts`

### Task 2: Add Supabase SSR Client Factories
- `tests/unit/auth/supabase-env.test.ts`
- `src/lib/supabase/env.ts`
- `src/lib/supabase/browser.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/middleware.ts`

### Task 3: Add OAuth Callback Route
- `tests/unit/auth/callback-route.test.ts`
- `src/app/auth/callback/route.ts`

### Task 4: Add Login Page + Auth Actions
- `tests/ui/auth-login-page.test.tsx`
- `src/app/auth/login/page.tsx`
- `src/app/auth/login/actions.ts`
- `src/components/common/HeaderRoleSwitch.tsx`

### Task 5: Protect Routes with Middleware
- `middleware.ts`
- Update `src/lib/auth/guard.ts` as needed

### Task 6: Docs + Verification
- `README.md`
- `docs/runbooks/foodsafeai-demo-runbook.md`
- verify: `pnpm test --run`, `pnpm lint`, `pnpm build`
