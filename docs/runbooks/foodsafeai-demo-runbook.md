# FoodSafeAI Demo Runbook

## 0) OAuth 준비 (최초 1회)

1. Supabase Auth > Providers에서 Google 활성화
2. Google OAuth Redirect URI 등록

```text
https://<project-ref>.supabase.co/auth/v1/callback
```

3. Supabase Auth URL 등록

- Site URL: `https://<your-vercel-domain>`
- Redirect URLs:
  - `https://<your-vercel-domain>/auth/callback`
  - `http://localhost:3000/auth/callback`

4. 환경변수 설정

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-or-publishable-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 1) 준비

```bash
pnpm install
pnpm seed:demo
pnpm dev
```

- 앱 주소: `http://localhost:3000`
- 로그인 화면: `http://localhost:3000/auth/login`
- 영양사 화면: `http://localhost:3000/nutritionist`
- 학부모 화면: `http://localhost:3000/parent`

## 2) 로그인 시연

1. 보호된 경로 접근 시 `/auth/login`으로 이동되는지 확인
2. `Google로 로그인` 버튼 클릭
3. 로그인 후 원래 페이지(`next`)로 복귀되는지 확인
4. 상단 `로그아웃` 버튼 클릭 시 `/auth/login`으로 돌아오는지 확인

## 3) 리스크 E2E 시연

1. 영양사 화면에서 식자재 등록 시나리오를 설명한다.
2. `POST /api/risk/check` 호출 흐름(식약처 정규화 + 매칭)을 설명한다.
3. 위험 이벤트 생성 후 학부모 공지 발행 시나리오를 설명한다.
4. 학부모 화면에서 공지 반영을 확인한다.

## 4) 메뉴 E2E 시연

1. 영양사 화면에서 인원/예산/알레르기 조건 기반 메뉴 생성 흐름을 설명한다.
2. AI 응답이 정상 JSON이면 생성 메뉴 사용.
3. AI 응답 실패 시 fallback 메뉴로 자동 전환됨을 설명한다.
4. 학부모 화면 메뉴 카드 반영을 확인한다.

## 5) 장애 대응 포인트

- OAuth 실패 시: 로그인 화면에서 오류 문구 표시 후 재시도
- MFDS 연동 실패 시: 캐시/로컬 데이터 기반 시연 지속
- LLM 파싱 실패 시: fallback 메뉴 사용
- 동기화 정보: `SyncStatusChip`로 표시

## 6) 품질 검증

```bash
pnpm test
pnpm lint
pnpm build
```
