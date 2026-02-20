# FoodSafeAI MVP

해커톤 시연용 학교 급식 안전관리 MVP입니다.

## 핵심 화면

- `/nutritionist`: 영양사 운영 화면 (리스크 검사, 메뉴 생성, 공지 발행)
- `/parent`: 학부모 조회 화면 (안전 배너, 공지, 메뉴 확인)
- `/auth/login`: Google OAuth 로그인 화면
- `/admin`: 계정 등급 관리 화면 (`admin`만 접근)

## Supabase Google OAuth 설정

1. Supabase 프로젝트 생성 후 Auth > Providers에서 Google OAuth를 활성화합니다.
2. Google Cloud Console에서 OAuth Client를 만들고, Redirect URI를 다음으로 설정합니다.

```text
https://<project-ref>.supabase.co/auth/v1/callback
```

3. Supabase Auth URL 설정

- Site URL
  - `https://<your-vercel-domain>`
- Redirect URLs
  - `https://<your-vercel-domain>/auth/callback`
  - `http://localhost:3000/auth/callback`

4. Vercel / 로컬 환경변수

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-or-publishable-key>
NEXT_PUBLIC_SITE_URL=https://<your-vercel-domain>
```

- 로컬 개발 시 `NEXT_PUBLIC_SITE_URL=http://localhost:3000` 권장
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 대신 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`도 허용

## Admin 등급 관리 DB 설정 (RLS + RPC)

1. Supabase SQL Editor에서 아래 파일 내용을 실행합니다.

- `docs/sql/2026-02-20-admin-role-management.sql`

2. 초기 admin 계정은 SQL로 수동 지정합니다.

```sql
update public.profiles
set role = 'admin'
where email = 'your-admin-email@example.com';
```

3. 상세 절차는 전용 런북을 참고합니다.

- `docs/runbooks/supabase-admin-role-bootstrap.md`

## 로컬 실행

```bash
pnpm install
pnpm seed:demo
pnpm dev
```

## 주요 스크립트

```bash
pnpm test
pnpm lint
pnpm build
pnpm seed:demo
```

## 주요 API

- `GET /api/auth/profile` (현재 로그인 계정의 profile/role 조회)
- `GET /api/mfds/datasets` (식약처 공공데이터 상세 페이지 파싱)
- `GET /api/mfds/recalls` (동일 소스 alias)
- `POST /api/risk/check`
- `POST /api/menu/generate`
- `GET /api/parent/feed`
- `POST /api/parent/publish`

## MFDS 데이터 소스

- 포털 원본: `https://data.mfds.go.kr/OPCAA01F01/search?selectedTab=tab2&allChk=Y&taskDivsCd=2&taskDivsCd=3&taskDivsCd=8&taskDivsCd=4&taskDivsCd=9&srchSrvcSeCd=2&srchSortSection=NEW`

## 데이터 저장

- 기본 저장소: `data/store.json`
- 테스트/개발 오버라이드: `FOODSAFE_STORE_PATH`

## 문서

- 통합 문서: `docs/plans/2026-02-16-foodsafeai-mvp-unified-plan.md`
- 구현 플랜: `docs/plans/2026-02-16-foodsafeai-mvp-implementation.md`
- 데모 런북: `docs/runbooks/foodsafeai-demo-runbook.md`
- Admin bootstrap 런북: `docs/runbooks/supabase-admin-role-bootstrap.md`
- OAuth 설계: `docs/plans/2026-02-20-supabase-google-oauth-design.md`
- OAuth 구현 계획: `docs/plans/2026-02-20-supabase-google-oauth-implementation.md`
- Admin role 설계: `docs/plans/2026-02-20-admin-role-management-design.md`
- Admin role 구현 계획: `docs/plans/2026-02-20-admin-role-management-implementation.md`
