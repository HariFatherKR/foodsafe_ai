# FoodSafeAI Ralph Loop Test Strategy Design (Vercel + Supabase)

- Date: 2026-02-20
- Scope: 개인용 FoodSafeAI 전환 과정에서 Ralph Loop를 테스트 전략에 통합
- Infra constraint: Vercel + Supabase only

## 1. Current Baseline

현재 브랜치(`chore/ralph-loop-test-strategy`) 기준:

1. 테스트 명령은 `pnpm test --run`이며 단위/UI 테스트는 통과 상태다.
2. CI 워크플로우 파일(`.github/workflows/*`)은 아직 없다.
3. Ralph Loop 실행 파일(`loop.sh`, `PROMPT_plan.md`, `PROMPT_build.md`, `IMPLEMENTATION_PLAN.md`, `AGENTS.md`)은 리포지토리에 아직 없다.

## 2. Research Findings

아래는 공식 문서/원문에서 확인된 사실:

1. Ralph workflow 핵심은 계획/구현 루프를 짧은 단위로 반복하고, 각 루프에서 검증 후 커밋하는 운영 방식이다.
2. Ralph 템플릿은 `AGENTS.md`의 tests/typecheck/lint/build를 품질 백프레셔로 강제한다.
3. GitHub branch protection은 required status checks를 강제할 수 있고, strict 설정으로 최신 base 반영을 요구할 수 있다.
4. Vercel은 Git push마다 Preview Deployment를 자동 생성하며, 커스텀 deployment checks 및 deployment protection 옵션을 제공한다.
5. Supabase는 CLI 기반 local development/testing 흐름을 권장하며, 환경 분리 및 CI/CD 기반 변경 검증을 강조한다.

## 3. Integration Approaches

### Approach A: Local-only Ralph Loop

1. 개발자가 로컬에서 `loop.sh`를 돌리고 로컬 테스트만 수행.
2. 장점: 가장 빠른 시작.
3. 단점: 팀/브랜치 단위 품질 일관성 보장이 약함.

### Approach B: Ralph Loop + Required CI Checks (Recommended)

1. 로컬 루프(빠른 반복) + PR 필수 체크(일관성 보장) 결합.
2. 장점: 속도와 신뢰성 균형이 가장 좋음.
3. 단점: CI 셋업 초기 비용이 필요.

### Approach C: Full Autonomous Loop + Deployment Gating

1. Ralph 루프, CI, Vercel deployment protection, Supabase preview/branch workflow를 모두 강하게 결합.
2. 장점: 운영 안전성이 가장 높음.
3. 단점: 1차 MVP 단계에서는 과도한 복잡도 가능.

## 4. Recommended Strategy (Approach B)

### 4.1 Loop Layer (Developer Runtime)

리포지토리 루트에 Ralph 템플릿을 설치한다.

1. `AGENTS.md`에 FoodSafeAI 검증 명령을 명시:
- Tests: `pnpm test --run`
- Typecheck: `pnpm exec tsc --noEmit`
- Lint: `pnpm lint`
- Build: `pnpm build`

2. `PROMPT_build.md` 규칙:
- 변경 범위 대상 테스트 먼저 실행
- 커밋 직전에는 전체 검증 실행

3. `IMPLEMENTATION_PLAN.md` 규칙:
- 태스크별 완료 기준에 “어떤 테스트를 통과했는지”를 반드시 기록

### 4.2 CI Layer (PR Gate)

GitHub Actions 최소 2개 워크플로우:

1. `ci-fast.yml`
- Trigger: pull_request, push
- Jobs: install + unit/ui tests + lint + typecheck

2. `ci-build.yml`
- Trigger: pull_request, push
- Jobs: production build (`pnpm build`)

Branch protection(required checks):

1. `ci-fast / test-lint-typecheck`
2. `ci-build / build`
3. `vercel` preview status(optional required)

### 4.3 Supabase Verification Layer

Supabase 변경이 포함된 PR에만 실행되는 추가 워크플로우:

1. `ci-supabase.yml`
- Trigger path filter: `supabase/**`, `src/lib/supabase/**`, `src/app/api/**`
- Steps:
  - `supabase start` (or linked test project)
  - schema/migration apply
  - db smoke queries
  - auth policy/RLS regression checks

2. RLS 검증 실패 시 PR merge 금지(required check 포함).

### 4.4 Vercel Release Layer

1. Vercel Preview는 모든 PR에서 생성.
2. Production 승격은 GitHub 보호 브랜치 merge 후에만 허용.
3. 필요 시 deployment protection을 적용해 운영 승격 전 수동 승인 단계 추가.

## 5. Test Backpressure Matrix

속도와 안정성을 분리해 운영:

1. Loop per iteration (개발자 로컬):
- changed-scope test + lint of changed files
- 목표: 2~5분 이내 피드백

2. Pre-push (로컬):
- `pnpm test --run && pnpm lint && pnpm exec tsc --noEmit`

3. PR gate (CI required):
- fast suite + build + (조건부 supabase)

4. Main merge/post-merge:
- full suite + Vercel preview/production verification

## 6. Rollout Plan

### Phase 1 (Day 1-2): Ralph baseline

1. Ralph 템플릿 설치
2. `AGENTS.md` 검증 명령 확정
3. `PROMPT_plan.md`, `PROMPT_build.md` 프로젝트 목표로 치환

### Phase 2 (Day 3-4): CI required checks

1. `ci-fast.yml`, `ci-build.yml` 추가
2. branch protection required checks 연결

### Phase 3 (Day 5-6): Supabase test gate

1. `ci-supabase.yml` 추가
2. RLS/정책 회귀 테스트 포함

### Phase 4 (Day 7): Vercel release control

1. Preview 상태를 PR 승인 체크 항목에 반영
2. 필요 시 deployment protection 활성화

## 7. Operational Rules

1. Ralph 루프 1회 = 1개 의미 있는 작업 + 검증 + 커밋.
2. 테스트 실패 상태에서 루프를 강행하지 않는다.
3. PR 설명에 “local/CI 검증 결과”를 의무 기입한다.
4. Supabase schema/RLS 변경은 반드시 `ci-supabase` 통과 후 merge.

## 8. Risks and Mitigations

1. 루프 속도 저하
- 대응: loop 단계는 changed-scope 우선, full suite는 PR gate에서 보장

2. 거짓 안정성(로컬 통과/CI 실패)
- 대응: required checks + strict branch protection

3. Supabase drift(환경별 스키마 차이)
- 대응: migration source-of-truth 고정 + CI에서 매번 clean apply

4. Vercel preview와 실제 production 차이
- 대응: build check + 환경변수 검증 체크리스트 + 보호 배포

## 9. Immediate Checklist

1. Ralph 템플릿을 현재 워크트리에 설치한다.
2. `AGENTS.md` 검증 명령을 실제 명령으로 채운다.
3. `ci-fast.yml` 추가.
4. `ci-build.yml` 추가.
5. branch protection required checks 설정.
6. Supabase CLI 검증 워크플로우 초안 작성.
7. Vercel preview 상태를 PR 리뷰 규칙에 연결.

## 10. Notes on Inference

아래 항목은 문서 근거를 바탕으로 한 설계 추론이다:

1. “Approach B가 현재 MVP 단계 최적”이라는 판단
2. “Supabase workflow를 path-filter 기반 조건부 실행” 구성
3. “Loop 단계와 PR gate 단계를 분리한 백프레셔 매트릭스”

## 11. References

1. Ralph 원문/운영 방식: https://github.com/ghuntley/how-to-ralph-wiggum
2. Ralph 루프 템플릿 구조(본 환경): `~/.codex/skills/ralph-loop/assets/templates/*`
3. GitHub branch protection / required status checks: https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
4. Vercel GitHub integration: https://vercel.com/docs/deployments/git/vercel-for-github
5. Vercel deployment checks: https://vercel.com/docs/deployments/deployment-checks
6. Vercel deployment protection: https://vercel.com/docs/deployment-protection
7. Supabase local development/testing: https://supabase.com/docs/guides/local-development
8. Supabase environments/CI 권장: https://supabase.com/docs/guides/deployment/managing-environments
9. Supabase CLI branch references: https://supabase.com/docs/reference/cli/supabase-branches-create
