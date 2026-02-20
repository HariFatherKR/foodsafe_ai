# Supabase Admin Role Bootstrap

## 목적

`profiles.role` 기반 권한 모델(`admin|user`)과 RLS/RPC를 초기 세팅하고, 첫 admin 계정을 지정한다.

## 1) SQL 적용

1. Supabase 대시보드 > SQL Editor 진입
2. `docs/sql/2026-02-20-admin-role-management.sql` 내용을 실행

생성되는 핵심 리소스:
- `public.profiles`
- `public.role_change_logs`
- RLS 정책
- RPC `public.admin_set_user_role(target_user_id uuid, next_role app_role)`

## 2) 프로필 생성 확인

1. 대상 계정으로 Google 로그인 1회 수행
2. 아래 쿼리로 profile row 생성 확인

```sql
select id, email, role, updated_at
from public.profiles
order by updated_at desc;
```

## 3) 초기 admin 지정

```sql
update public.profiles
set role = 'admin'
where email = 'your-admin-email@example.com';
```

검증:

```sql
select email, role
from public.profiles
where email = 'your-admin-email@example.com';
```

## 4) 권한 변경 RPC 검증

1. admin 계정 로그인 후 앱 `/admin` 진입
2. 대상 사용자 role 변경 실행
3. 이력 확인

```sql
select target_user_id, old_role, new_role, changed_by, created_at
from public.role_change_logs
order by created_at desc
limit 20;
```

## 5) 운영 주의사항

- `admin_set_user_role`는 RLS + 함수 내부 검증으로 비관리자 호출을 차단한다.
- 자기 자신 `admin -> user` 강등은 RPC에서 차단된다.
- 관리자 계정 분실 대비로 SQL Editor에서 role 복구 절차를 문서화해 두는 것을 권장한다.
