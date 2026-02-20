# FoodSafeAI Admin Role Management Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Supabase `profiles.role` 기반으로 admin/user 등급을 관리하고 `/admin`에서 사용자 권한 변경 및 변경 이력 조회를 제공한다.

**Architecture:** Supabase RLS + RPC를 권한의 최종 보루로 사용한다. Next.js는 서버 측에서 현재 사용자 role을 확인해 `/admin` 접근을 제어하고, 권한 변경은 RPC 호출만 허용한다. 로그인 화면과 헤더에 현재 계정 role을 표시해 운영자가 즉시 권한 상태를 인지할 수 있게 한다.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase SSR, Supabase SQL (RLS + RPC), Vitest, Testing Library.

---

### Task 1: Add Domain Types and Role Utilities (TDD)

**Files:**
- Create: `src/lib/auth/roles.ts`
- Test: `tests/unit/auth/roles.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { canAccessAdminPage, isSelfDemotionBlocked } from "@/lib/auth/roles";

describe("auth roles", () => {
  it("allows only admin to access admin page", () => {
    expect(canAccessAdminPage("admin")).toBe(true);
    expect(canAccessAdminPage("user")).toBe(false);
    expect(canAccessAdminPage(null)).toBe(false);
  });

  it("blocks self demotion from admin to user", () => {
    expect(isSelfDemotionBlocked({
      actorId: "u1",
      targetId: "u1",
      actorRole: "admin",
      nextRole: "user",
    })).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/auth/roles.test.ts --run`
Expected: FAIL (module missing).

**Step 3: Write minimal implementation**

Create utility functions and shared `AppRole` type.

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/unit/auth/roles.test.ts --run`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/auth/roles.ts tests/unit/auth/roles.test.ts
git commit -m "feat(auth): add role utility helpers"
```

### Task 2: Add Supabase SQL Schema, RLS, RPC

**Files:**
- Create: `docs/sql/2026-02-20-admin-role-management.sql`

**Step 1: Write SQL migration script**

Include:
- `profiles` table
- `role_change_logs` table
- RLS enable + policies
- `admin_set_user_role` RPC
- optional helper trigger/update timestamp

**Step 2: Validate SQL syntax locally (if psql available)**

Run: `psql "$SUPABASE_DB_URL" -f docs/sql/2026-02-20-admin-role-management.sql` (optional local)
Expected: no SQL error.

**Step 3: Add bootstrap SQL snippet for first admin**

In same file, include commented block for manual admin promotion by email.

**Step 4: Commit**

```bash
git add docs/sql/2026-02-20-admin-role-management.sql
git commit -m "feat(db): add profiles role model with rls and rpc"
```

### Task 3: Add Auth Profile Server Access Layer (TDD)

**Files:**
- Create: `src/lib/auth/profile-server.ts`
- Test: `tests/unit/auth/profile-server.test.ts`

**Step 1: Write failing tests**

Cover:
- `getCurrentProfile()` returns null when unauthenticated
- `ensureCurrentProfile()` upserts default `user` row
- `setUserRoleAsAdmin()` calls RPC and maps errors

**Step 2: Run test to verify failure**

Run: `pnpm test tests/unit/auth/profile-server.test.ts --run`
Expected: FAIL.

**Step 3: Minimal implementation**

Implement server-only helpers using `createServerSupabaseClient()`:
- current user/profile fetch
- profile bootstrap
- admin-only role update through RPC
- recent role log fetch

**Step 4: Run test to verify pass**

Run: `pnpm test tests/unit/auth/profile-server.test.ts --run`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/auth/profile-server.ts tests/unit/auth/profile-server.test.ts
git commit -m "feat(auth): add server profile and role rpc layer"
```

### Task 4: Build `/admin` Page and Actions (TDD)

**Files:**
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/actions.ts`
- Create: `src/components/admin/UserRoleTable.tsx`
- Create: `src/components/admin/RoleChangeLogTable.tsx`
- Test: `tests/ui/admin-page.test.tsx`

**Step 1: Write failing UI test**

Cover:
- admin page headings/sections
- user row rendering
- self-demotion button disabled

**Step 2: Run test to verify failure**

Run: `pnpm test tests/ui/admin-page.test.tsx --run`
Expected: FAIL.

**Step 3: Minimal implementation**

- server-side role guard (non-admin -> `/`)
- user list and logs render
- server action for role update via RPC
- self-demotion UI block

**Step 4: Run test to verify pass**

Run: `pnpm test tests/ui/admin-page.test.tsx --run`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/admin/page.tsx src/app/admin/actions.ts src/components/admin/UserRoleTable.tsx src/components/admin/RoleChangeLogTable.tsx tests/ui/admin-page.test.tsx
git commit -m "feat(admin): add admin role management page"
```

### Task 5: Show Current Role on Login and Header (TDD)

**Files:**
- Modify: `src/app/auth/login/page.tsx`
- Modify: `src/components/common/HeaderRoleSwitch.tsx`
- Test: `tests/ui/auth-login-page.test.tsx`

**Step 1: Extend failing tests**

Add assertions for role badge display when profile exists.

**Step 2: Run test to verify failure**

Run: `pnpm test tests/ui/auth-login-page.test.tsx --run`
Expected: FAIL.

**Step 3: Minimal implementation**

- fetch current profile on server
- render `admin`/`user` badge in login and header

**Step 4: Run test to verify pass**

Run: `pnpm test tests/ui/auth-login-page.test.tsx --run`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/auth/login/page.tsx src/components/common/HeaderRoleSwitch.tsx tests/ui/auth-login-page.test.tsx
git commit -m "feat(auth): display current account role in ui"
```

### Task 6: Update Route Guard for Admin Path

**Files:**
- Modify: `middleware.ts`
- Modify: `src/lib/auth/guard.ts`
- Test: `tests/unit/auth/guard.test.ts`

**Step 1: Add failing tests for `/admin` redirection behavior helpers**

Run: `pnpm test tests/unit/auth/guard.test.ts --run`
Expected: FAIL.

**Step 2: Implement admin path handling**

- keep middleware auth redirect for non-login
- keep `/admin` role check in page server guard (defense in depth)

**Step 3: Re-run tests**

Run: `pnpm test tests/unit/auth/guard.test.ts --run`
Expected: PASS.

**Step 4: Commit**

```bash
git add middleware.ts src/lib/auth/guard.ts tests/unit/auth/guard.test.ts
git commit -m "feat(auth): enforce admin route role checks"
```

### Task 7: Docs and Final Verification

**Files:**
- Modify: `README.md`
- Modify: `docs/runbooks/foodsafeai-demo-runbook.md`
- Create: `docs/runbooks/supabase-admin-role-bootstrap.md`

**Step 1: Add setup docs**

Document SQL apply steps and first admin promotion flow.

**Step 2: Run full verification**

Run:
- `pnpm test --run`
- `pnpm lint`
- `pnpm build`

Expected: all PASS.

**Step 3: Commit**

```bash
git add README.md docs/runbooks/foodsafeai-demo-runbook.md docs/runbooks/supabase-admin-role-bootstrap.md
git commit -m "docs(admin): add role management setup and runbook"
```
