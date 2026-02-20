import Link from "next/link";
import { HeaderRoleSwitch } from "@/components/common/HeaderRoleSwitch";

const REQUIRED_CHECKS = [
  "CI Fast / test-lint-typecheck",
  "CI Build / build",
  "CI Supabase / supabase-check",
];

const LOOP_FILES = [
  "AGENTS.md",
  "PROMPT_plan.md",
  "PROMPT_build.md",
  "IMPLEMENTATION_PLAN.md",
  "loop.sh",
];

export default function DocsPage() {
  return (
    <main className="page-shell">
      <div className="page-container">
        <HeaderRoleSwitch />

        <section className="docs-hero fade-up">
          <div className="docs-hero__content">
            <span className="docs-chip">운영 허브</span>
            <h1>Ralph Loop · CI 운영 문서</h1>
            <p>
              개인용 FoodSafeAI 전환 작업에서 사용하는 품질 게이트, 브랜치 보호,
              Vercel/Supabase 운영 규칙을 한 페이지에서 확인합니다.
            </p>
            <div className="docs-hero__actions">
              <a
                className="btn-primary"
                href="https://github.com/HariFatherKR/foodsafe_ai/blob/main/.github/pull_request_template.md"
                target="_blank"
                rel="noreferrer"
              >
                PR 템플릿 보기
              </a>
              <span className="docs-chip docs-chip--soft">Required checks + review gate</span>
            </div>
          </div>
          <div className="docs-hero__stats">
            <article className="docs-stat-card">
              <span>Required Checks</span>
              <strong>3개</strong>
            </article>
            <article className="docs-stat-card">
              <span>Required Review</span>
              <strong>1명</strong>
            </article>
            <article className="docs-stat-card">
              <span>Loop Mode</span>
              <strong>Plan → Build</strong>
            </article>
          </div>
        </section>

        <section className="docs-grid">
          <article className="story-panel fade-up">
            <h2>빠른 시작 3단계</h2>
            <ul className="list">
              <li>
                1) <code>pnpm install</code> 후 <code>pnpm test --run</code>으로 베이스라인 확인
              </li>
              <li>
                2) <code>./loop.sh plan 1</code> 실행 후 <code>./loop.sh 5</code>로 구현 루프 진행
              </li>
              <li>
                3) PR 생성 전 <code>pnpm lint</code>, <code>pnpm build</code> 포함 전체 검증 수행
              </li>
            </ul>
          </article>

          <article className="story-panel fade-up">
            <h2>운영 체크리스트</h2>
            <ul className="list">
              <li>PR에는 Vercel Preview 링크를 반드시 첨부</li>
              <li>Supabase 영향 여부를 템플릿에서 명시</li>
              <li>체크 실패 상태에서는 merge 금지</li>
            </ul>
          </article>
        </section>

        <section className="story-grid">
          <article className="story-panel fade-up">
            <h2>필수 GitHub Checks</h2>
            <p>
              <strong>main</strong> 브랜치 보호 정책에 아래 상태 체크를 required로
              등록합니다.
            </p>
            <ul className="list">
              {REQUIRED_CHECKS.map((check) => (
                <li key={check}>{check}</li>
              ))}
            </ul>
          </article>

          <article className="story-panel fade-up">
            <h2>Ralph Loop 실행 순서</h2>
            <p>루프는 계획 1회 후 구현 루프를 짧게 반복하는 방식으로 운영합니다.</p>
            <ul className="list">
              <li>
                1) <code>./loop.sh plan 1</code>
              </li>
              <li>
                2) <code>./loop.sh 5</code>
              </li>
              <li>
                3) 드리프트 발생 시 다시 <code>./loop.sh plan 1</code>
              </li>
            </ul>
            <p>운영 필수 파일:</p>
            <ul className="list">
              {LOOP_FILES.map((file) => (
                <li key={file}>
                  <code>{file}</code>
                </li>
              ))}
            </ul>
          </article>

          <article className="story-panel story-panel--soft fade-up">
            <h2>Vercel + Supabase 게이트</h2>
            <p>
              <code>ci-supabase</code>는 모든 PR에서 실행되며, Supabase 관련 변경(
              <code>supabase/**</code>, <code>src/lib/supabase/**</code>,{" "}
              <code>src/app/api/**</code>)이 있을 때만 검증 단계를 수행합니다.
            </p>
            <p>모든 PR은 Vercel Preview 검증 후 병합하고 main에서 production으로 승격합니다.</p>
          </article>

          <article className="story-panel fade-up">
            <h2>참고 문서</h2>
            <div className="flow-guide">
              <article className="flow-step">
                <h3>Runbook</h3>
                <p>
                  <code>docs/runbooks/ralph-loop-ci-vercel-supabase.md</code>
                </p>
              </article>
              <article className="flow-step">
                <h3>Branch Protection Payload</h3>
                <p>
                  <code>docs/runbooks/branch-protection.payload.json</code>
                </p>
              </article>
              <article className="flow-step">
                <h3>개발 화면으로 이동</h3>
                <p>
                  <Link className="role-switch__link" href="/nutritionist">
                    영양사 대시보드
                  </Link>
                </p>
              </article>
            </div>
          </article>
        </section>

        <section className="story-panel fade-up">
          <h2>문서 경로</h2>
          <p>
            상세 운영 가이드는{" "}
            <code>docs/runbooks/ralph-loop-ci-vercel-supabase.md</code>에서 확인할 수
            있습니다.
          </p>
        </section>
      </div>
    </main>
  );
}
