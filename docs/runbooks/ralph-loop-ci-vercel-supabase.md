# Ralph Loop + CI + Vercel/Supabase Runbook

## 1) Scope

이 문서는 FoodSafeAI 개인용 전환 작업에서 아래를 운영 표준으로 고정한다.

1. Ralph Loop 기반 반복 개발
2. GitHub required checks 기반 품질 게이트
3. Vercel preview/production 배포 통제
4. Supabase 변경 검증 정책

## 2) Required Checks

`main` 브랜치 보호에서 아래 체크를 required로 사용한다.

1. `CI Fast / test-lint-typecheck`
2. `CI Build / build`
3. `CI Supabase / supabase-check`

추가 보호 정책:

1. strict status checks
2. 최소 1명 approving review 필수
3. required conversation resolution
4. force push/deletion 비허용

## 3) Ralph Loop Files

루트에 아래 파일을 유지한다.

1. `AGENTS.md`
2. `PROMPT_plan.md`
3. `PROMPT_build.md`
4. `IMPLEMENTATION_PLAN.md`
5. `loop.sh`

## 4) Ralph Loop Basic Commands

```bash
# 1) 먼저 계획 루프 1회
./loop.sh plan 1

# 2) 구현 루프 3~10회
./loop.sh 5
```

## 5) Local Backpressure

로컬에서 최소 아래를 통과하고 push 한다.

```bash
pnpm test --run
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

## 6) Supabase Workflow Notes

`ci-supabase.yml`은 모든 PR/`main` push에서 실행되며, 아래 경로 변경 여부를 내부에서 판별한다.

1. `supabase/**`
2. `src/lib/supabase/**`
3. `src/app/api/**`

경로 변경이 감지되면 실행 내용:

1. Supabase CLI 설치
2. `supabase/config.toml` 존재 확인
3. `supabase db lint`
4. 회귀 테스트 (`pnpm test --run`)

경로 변경이 없으면 skip 메시지를 남기고 성공 처리해 required check 컨텍스트를 항상 제공한다.

## 7) Vercel Release Control

1. PR마다 Preview Deployment 생성
2. required checks가 모두 통과해야 merge 가능
3. merge 후 main에서 production 승격

## 8) Branch Protection Update Command

필요 시 아래 명령으로 보호 정책을 갱신한다.

```bash
gh api --method PUT -H "Accept: application/vnd.github+json" \
  repos/HariFatherKR/foodsafe_ai/branches/main/protection \
  --input ./docs/runbooks/branch-protection.payload.json
```

## 9) Troubleshooting

1. `Branch not protected`:
   - 보호 정책이 없는 상태로 정상이며, PUT 요청으로 생성 가능
2. `supabase/config.toml missing`:
   - Supabase 프로젝트 초기화(`supabase init`) 후 파일 커밋
3. Next.js multiple lockfile warning(worktree):
   - 경고이며 빌드 실패 원인은 아님
