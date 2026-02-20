# Personal Nutrition MVP Spec

## Product Goal

FoodSafeAI를 개인용 영양 관리 앱으로 전환해 아래를 제공한다.

1. 로그인: Google OAuth + 이메일
2. 입력: 바코드 스캔 + 수동 식단 기록
3. 분석: 일일 영양 목표 대비 점수/경고
4. 추천: 목표 기반 식단 추천
5. 안전: 알레르기/금기 식품 경고

## Platform Constraints

1. Runtime/Hosting: Vercel
2. Auth/DB/Storage: Supabase
3. Client UX target: Mobile web (PWA)

## Required CI/Release Gates

1. Required checks on `main`:
  - `CI Fast / test-lint-typecheck`
  - `CI Build / build`
  - `CI Supabase / supabase-check`
2. Branch protection:
  - strict status checks
  - required conversation resolution
  - no force push/deletion

## Quality Backpressure

1. Local loop iteration:
  - changed scope checks
2. Pre-merge:
  - `pnpm test --run`
  - `pnpm exec tsc --noEmit`
  - `pnpm lint`
  - `pnpm build`

## Acceptance Criteria

1. 사용자 1인이 로그인 후 하루 식단 기록/조회/수정 가능
2. 목표 대비 점수와 경고를 확인 가능
3. 추천 식단과 안전 경고를 확인 가능
4. PR은 required checks 통과 없이 merge 불가
