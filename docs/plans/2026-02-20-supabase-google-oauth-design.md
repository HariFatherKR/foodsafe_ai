# FoodSafeAI Supabase Google OAuth Design

- Date: 2026-02-20
- Scope: 전체 앱(`/`, `/nutritionist`, `/parent`, API 포함) 로그인 보호
- Auth Provider: Google OAuth via Supabase Auth
- Deploy target: Vercel

## 1. Goal

1. Supabase Auth + Google OAuth로 로그인/로그아웃을 제공한다.
2. 로그인하지 않은 사용자는 앱 진입 시 로그인 화면으로 보낸다.
3. 서버 렌더/라우트 보호를 `middleware`에서 일관 처리한다.
4. Vercel 배포 시 환경변수만으로 동작하도록 구성한다.

## 2. Architecture

1. `@supabase/ssr` 기반으로 브라우저/서버 클라이언트를 분리한다.
2. `middleware.ts`에서 세션을 갱신하고 비로그인 접근을 `/auth/login`으로 리다이렉트한다.
3. OAuth 시작은 `/auth/login` 페이지에서 `signInWithOAuth({ provider: 'google' })`를 호출한다.
4. 콜백은 `/auth/callback` Route Handler에서 `exchangeCodeForSession`으로 세션 쿠키를 생성한다.
5. 로그아웃은 Server Action 또는 Route Handler에서 `signOut` 후 `/auth/login`으로 이동한다.

## 3. Route Policy

1. Public route
- `/auth/login`
- `/auth/callback`
- `/_next/*`, `/favicon.ico`, 정적 파일

2. Protected route
- `/`
- `/nutritionist`
- `/parent`
- `/api/*` (필요 시 예외 추가)

## 4. Data/Session Flow

1. 비로그인 사용자가 보호 경로 접근
2. `middleware`가 세션 확인 후 `/auth/login?next=<path>`로 리다이렉트
3. 로그인 버튼 클릭 시 Google OAuth 시작
4. Google 인증 후 Supabase callback으로 복귀
5. Supabase가 code를 앱의 `/auth/callback`으로 전달
6. `/auth/callback`이 세션 교환 후 `next` 또는 `/`로 리다이렉트
7. 이후 요청부터 쿠키 기반 세션 유지

## 5. Security and Error Handling

1. 환경변수 누락 시 로그인 페이지에서 명확한 안내 문구를 표시한다.
2. 콜백 실패 시 `/auth/login?error=oauth_callback_failed`로 복귀한다.
3. OAuth redirect URL은 Supabase 대시보드 + Google Console에 정확히 등록한다.
4. 보호 경로 우회 방지를 위해 클라이언트 가드가 아닌 `middleware`를 기준으로 강제한다.

## 6. Testing Strategy

1. Unit test
- public/protected 경로 판별 로직
- OAuth callback redirect 안전 처리(next 파라미터 정규화)

2. Route test
- `/auth/callback` 성공/실패 리다이렉트

3. Regression check
- `pnpm test --run`
- `pnpm lint`
- `pnpm build`

## 7. Vercel/Supabase Configuration

1. Vercel env
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (예: `https://<your-vercel-domain>`)

2. Supabase Auth URL config
- Site URL: `https://<your-vercel-domain>`
- Redirect URLs:
  - `https://<your-vercel-domain>/auth/callback`
  - `http://localhost:3000/auth/callback`

3. Google OAuth console
- Authorized redirect URI:
  - `https://<project-ref>.supabase.co/auth/v1/callback`

## 8. Rollout Plan

1. OAuth 코드/테스트 추가
2. 로컬에서 로그인 플로우 검증
3. Vercel env 설정 및 배포
4. Supabase/Google redirect URL 반영
5. 배포 URL에서 실로그인 검증
