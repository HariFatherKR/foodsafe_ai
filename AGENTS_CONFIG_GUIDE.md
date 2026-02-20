# Codex `AGENTS.md` + `config.toml` 운영 가이드

최종 업데이트: 2026-02-16  
기준: OpenAI Codex 공식 문서

## 1. 파일 역할과 기본 위치

- 전역 가이드(모든 프로젝트 공통): `~/.codex/AGENTS.md`
- 전역 임시 오버라이드: `~/.codex/AGENTS.override.md`
- 프로젝트 가이드(저장소 루트): `<repo>/AGENTS.md`
- 하위 디렉터리 전용 오버라이드: `<repo>/<subdir>/AGENTS.override.md`
- 전역 설정: `~/.codex/config.toml`
- 프로젝트별 설정: `<repo>/.codex/config.toml` (신뢰된 프로젝트에서만 로드)
- 실행 정책 rules: `~/.codex/rules/default.rules` 등

## 2. `AGENTS.md` 탐색/병합 규칙

Codex는 세션 시작 시(보통 실행 시작 1회) 지침 체인을 구성합니다.

1. 전역 스코프: `~/.codex/`에서 `AGENTS.override.md`가 있으면 우선, 없으면 `AGENTS.md` 사용
2. 프로젝트 스코프: 프로젝트 루트부터 현재 디렉터리까지 내려오며 디렉터리마다 아래 순서로 1개만 채택
   - `AGENTS.override.md`
   - `AGENTS.md`
   - `project_doc_fallback_filenames`에 등록된 파일명
3. 병합 순서: 루트 -> 하위 디렉터리 순으로 이어 붙임(현재 위치에 가까운 파일이 더 늦게 와서 사실상 우선)

추가 규칙:
- 빈 파일은 무시
- 전체 지침 크기는 `project_doc_max_bytes` 한도 내에서만 반영(기본 32 KiB)

## 3. `AGENTS.md` 작성 원칙

- 명령은 구체적으로 적기: 나쁜 예 `테스트 돌려라` / 좋은 예 `pnpm test:unit` 후 `pnpm lint`
- 경로 컨텍스트를 분리하기: 결제 모듈 규칙은 `services/payments/AGENTS.override.md`로 분리
- "해야 할 일" 중심으로 짧고 실행 가능하게 유지
- 팀 합의가 필요한 제약(보안, 배포, 키 회전 정책)은 명시

## 4. `AGENTS.md` 권장 템플릿

```md
# AGENTS.md instructions for /absolute/path/to/repo

## Build & Test
- Install: `pnpm install`
- Unit tests: `pnpm test:unit`
- Lint: `pnpm lint`

## Code Style
- Prefer existing utility functions over new helpers.
- Keep functions under ~60 lines unless justified.

## Safety
- Do not run destructive git commands without explicit approval.
- Never modify `.env` or production secrets.

## Change Policy
- For behavior changes, update `docs/` and add/adjust tests.
```

하위 디렉터리 오버라이드 예시:

```md
# services/payments/AGENTS.override.md

## Payments rules
- Use `make test-payments` instead of root test command.
- Any API-key rotation requires notice in security channel.
```

## 5. `config.toml` 우선순위(중요)

높은 우선순위 -> 낮은 우선순위:

1. CLI 플래그 및 `--config` 오버라이드
2. `--profile <name>`로 로드된 profile 값
3. 프로젝트 `.codex/config.toml` (루트 -> 현재 디렉터리, 가까운 쪽 우선 / trusted 프로젝트만)
4. 사용자 `~/.codex/config.toml`
5. 시스템 `/etc/codex/config.toml` (Unix)
6. 내장 기본값

## 6. `config.toml` 핵심 키 빠른 가이드

- `model`: 기본 모델
- `approval_policy`: 명령 승인 정책 (`untrusted`, `on-failure`, `on-request`, `never`)
- `sandbox_mode`: 샌드박스 수준 (`read-only`, `workspace-write`, `danger-full-access`)
- `[projects."<abs path>"].trust_level`: 프로젝트 신뢰도 (`trusted`/`untrusted`)
- `project_doc_fallback_filenames`: `AGENTS.md`가 없을 때 대체 파일명 목록
- `project_doc_max_bytes`: 지침 파일 반영 최대 바이트
- `project_root_markers`: 프로젝트 루트 판별 마커

권장 시작 예시:

```toml
model = "gpt-5.3-codex"
personality = "pragmatic"
model_reasoning_effort = "xhigh"
approval_policy = "on-request"
sandbox_mode = "workspace-write"
project_doc_fallback_filenames = ["TEAM_GUIDE.md", ".agents.md"]
project_doc_max_bytes = 32768
project_root_markers = [".git", ".hg", ".sl"]

[projects."/absolute/path/to/repo"]
trust_level = "trusted"

[tui]
notifications = true
```

## 7. 고급 설정 포인트

- Profiles: `[profiles.<name>]`로 프리셋 구성 가능(실험 기능, IDE 확장 미지원)
- Custom providers: `[model_providers.<id>]`로 `base_url`, `env_key`, `http_headers` 구성
- OTel: `[otel]`로 텔레메트리 내보내기 설정(기본 비활성)
- `experimental_instructions_file`는 deprecated, `model_instructions_file` 사용 권장

## 8. Rules(`.rules`) 최소 운영법

`rules`는 "샌드박스 밖 실행" 제어용입니다.

- 규칙 함수: `prefix_rule(...)`
- 필수/주요 필드:
  - `pattern`: 명령 prefix 매칭 배열
  - `decision`: `allow` | `prompt` | `forbidden`
  - `justification`: 사람이 읽을 이유(권장)
  - `match` / `not_match`: 인라인 테스트(권장)
- 다중 규칙 매칭 시 더 엄격한 결정 우선: `forbidden > prompt > allow`

검증 명령:

```bash
codex execpolicy check --pretty \
  --rules ~/.codex/rules/default.rules \
  -- gh pr view 7888 --json title,body,comments
```

참고:
- `bash -lc "cmd1 && cmd2"` 형태는 안전하게 분해 가능한 경우 명령별 평가
- 분해 불가한 복잡 스크립트는 전체를 단일 명령으로 보수적으로 평가

## 9. 운영 체크리스트

1. `~/.codex/AGENTS.md`에 전역 작업 규칙 정의
2. 각 저장소 루트 `AGENTS.md`에 빌드/테스트/배포 규칙 정의
3. 필요 시 서브디렉터리에 `AGENTS.override.md`로 팀별 분기
4. `~/.codex/config.toml`에 기본 모델/승인/샌드박스 정책 고정
5. 프로젝트를 `trust_level = "trusted"`로 명시해 `.codex/config.toml` 계층 적용
6. 고위험 외부 명령은 `.rules`로 `prompt` 또는 `forbidden`

## 10. 공식 문서 링크

- AGENTS.md: https://developers.openai.com/codex/guides/agents-md
- Config basics: https://developers.openai.com/codex/config-basic
- Advanced config: https://developers.openai.com/codex/config-advanced
- Config reference: https://developers.openai.com/codex/config-reference
- Sample config: https://developers.openai.com/codex/config-sample
- Rules: https://developers.openai.com/codex/rules
