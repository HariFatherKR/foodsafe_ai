# FoodSafeAI Admin Role Management Design

- Date: 2026-02-20
- Scope: 로그인 화면 계정 등급 표시 + `/admin` 권한 관리 페이지
- Role model: `admin | user`
- Storage: Supabase `profiles.role`
- Authorization strategy: RLS + RPC (service role key 미사용)

## 1. Goal

1. 로그인 계정의 현재 등급(`admin`/`user`)을 확인 가능하게 한다.
2. `/admin` 페이지에서 사용자 권한을 관리한다.
3. 권한 변경 정책을 DB(RLS + RPC)에서 강제한다.
4. 자기 자신 `admin -> user` 강등을 방지한다.
5. 권한 변경 이력을 추적한다.

## 2. Architecture

1. 인증: 기존 Supabase OAuth 세션 쿠키 재사용.
2. 권한 정보: `profiles` 테이블(`id = auth.users.id`)의 `role` 컬럼을 단일 소스로 사용.
3. 관리 기능: `admin_set_user_role` RPC가 권한 검증 + 변경 + 로그 기록을 원자적으로 처리.
4. UI/서버: Next.js Server Components/Server Actions로 목록 조회 및 역할 변경 요청 처리.
5. 라우팅: `/admin` 접근은 로그인 + `admin` role 둘 다 필요. 미충족 시 `/` 리다이렉트.

## 3. Database Design

### 3.1 `profiles`

- `id uuid primary key references auth.users(id) on delete cascade`
- `email text not null`
- `role text not null default 'user' check (role in ('admin', 'user'))`
- `updated_at timestamptz not null default now()`

### 3.2 `role_change_logs`

- `id uuid primary key default gen_random_uuid()`
- `target_user_id uuid not null references profiles(id) on delete cascade`
- `old_role text not null`
- `new_role text not null`
- `changed_by uuid not null references profiles(id) on delete cascade`
- `created_at timestamptz not null default now()`

### 3.3 RPC `admin_set_user_role(target_user_id uuid, next_role text)`

검증 및 동작:
1. `auth.uid()` 확인 (로그인 필수)
2. 호출자 role이 `admin`인지 확인
3. `next_role`이 `admin|user`인지 확인
4. 대상 사용자 존재 확인
5. 호출자가 자기 자신을 `user`로 강등하려 하면 예외
6. 대상 role 업데이트
7. 변경 이력 insert
8. 업데이트된 대상 프로필 반환

## 4. RLS Policy

### `profiles`

1. `select`: 본인 row는 본인 조회 가능
2. `select`: admin은 전체 조회 가능
3. `insert`: 본인 id로 자신의 row 생성 가능
4. `update`: 본인은 자신의 비권한 필드만 수정 가능(또는 앱에서 update 제한)
5. 일반 `user`는 타인 role 수정 불가

### `role_change_logs`

1. `select`: admin만 조회 가능
2. `insert/update/delete`: direct access 차단(변경은 RPC만 허용)

## 5. Route and UI

### 5.1 Login Page

- 로그인 화면에 현재 로그인 계정 정보(이메일 + role badge) 표시
- 비로그인 상태에서는 기존 Google 로그인 버튼만 표시

### 5.2 Admin Page `/admin`

구성:
1. 현재 계정 카드(이메일/role)
2. 사용자 목록 테이블(이메일, role, updated_at)
3. 권한 변경 액션(`user ↔ admin`)
4. 최근 변경 이력 테이블

행동:
1. `user`가 `/admin` 접근 시 `/` 리다이렉트
2. 자기 자신 `admin -> user` 변경 버튼 비활성화
3. 변경 실패 시 명확한 메시지 노출

## 6. Seed and Bootstrap

1. 로그인 후 `profiles` row가 없으면 기본 `user`로 upsert한다.
2. 초기 `admin`은 Supabase SQL에서 특정 계정을 수동 지정한다.

## 7. Error Handling

1. `profiles` row 누락: 서버에서 자동 생성 시도 후 재조회
2. RPC 권한 오류: “관리자 권한이 필요합니다”
3. 자기 강등 차단: “자기 계정은 user로 변경할 수 없습니다”
4. 대상 없음: “대상 사용자를 찾을 수 없습니다”

## 8. Testing Strategy

1. Unit
- role 판정 및 redirect 가드
- RPC 에러 매핑 유틸

2. API/Server Action
- admin 요청 성공
- non-admin 요청 실패
- self-demotion 실패

3. UI
- `/admin` 목록/이력 렌더
- self-demotion 버튼 비활성
- 로그인 페이지 role 표시

4. Regression
- `pnpm test --run`
- `pnpm lint`
- `pnpm build`
