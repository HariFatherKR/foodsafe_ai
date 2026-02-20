# FoodSafeAI OpenAI Menu LLM Integration Design

## 1. Goal

`/api/menu/generate`의 현재 mock 기반 메뉴 생성을 OpenAI 실연동으로 전환한다.  
기존 API 응답 계약(`menuPlan`, `fallbackUsed`)과 UI 동작은 유지한다.

## 2. Scope

- 포함:
  - OpenAI API 호출 기반 메뉴 생성
  - 모델 고정: `gpt-5.2` (기본값)
  - JSON Schema 기반 구조 강제
  - 실패 시 fallback 메뉴 유지
- 제외:
  - 다중 LLM provider 지원
  - 프론트 UI 변경
  - 데이터 저장 구조 변경

## 3. Architecture

### 3.1 Module split

- `src/lib/menu/prompt.ts`
  - 메뉴 프롬프트/도메인 타입 정의 유지
  - 응답 파싱 보조(`parseGeneratedMenu`) 유지
- `src/lib/llm/openai.ts` (신규)
  - OpenAI Responses API 호출 전담
  - JSON Schema 강제 응답 처리
  - 환경변수(`OPENAI_API_KEY`, `OPENAI_MODEL`) 처리
- `src/app/api/menu/generate/route.ts`
  - 기존 제약조건 정규화/저장소 저장/폴백 흐름 유지
  - 내부 호출만 mock -> OpenAI로 교체

### 3.2 Runtime data flow

1. 클라이언트가 `POST /api/menu/generate` 호출
2. 서버가 `constraints` 정규화
3. `buildMenuPrompt(constraints)` 생성
4. `generateMenuFromAi(prompt)`가 OpenAI 호출
5. JSON Schema + `parseGeneratedMenu` 통과 시 `menuPlan` 저장
6. 실패 시 `buildFallbackMenuPlan` 사용 + `fallbackUsed: true`

## 4. Response Contract

OpenAI 응답은 아래 스키마를 만족해야 한다.

- root: `{ days: Day[] }`
- `Day`:
  - `day: string`
  - `items: string[]` (최소 1)
  - `allergyWarnings: string[]`
  - `substitutions?: string[]`

스키마 검증에 실패하면 API는 실패를 노출하지 않고 fallback 메뉴로 전환한다.

## 5. Error Handling and Security

### 5.1 Error handling

- `OPENAI_API_KEY` 미설정: OpenAI 호출 실패로 간주, fallback 사용
- OpenAI 네트워크/권한/쿼터 오류: fallback 사용
- 응답 파싱 실패: fallback 사용

API는 기존과 동일하게 `200` 응답으로 `menuPlan`을 반환하며 `fallbackUsed`로 상태를 전달한다.

### 5.2 Security

- API 키는 서버 환경변수로만 사용
- 키/민감정보는 로그에 남기지 않음
- 클라이언트에는 메뉴 결과만 반환

## 6. Testing Strategy

## 6.1 TDD strategy

- 단위 테스트 우선:
  - OpenAI 클라이언트 응답 파싱/실패 케이스
  - 메뉴 API fallback 분기 유지
- 기존 `tests/unit/api/menu-generate.test.ts`를 확장하고, 필요 시 `tests/unit/llm/openai.test.ts` 추가

## 6.2 Ralph Loop integration

Ralph Loop를 테스트 실행 백프레셔(backpressure)로 사용한다.

1. 루프 초기화
   - `bash ~/.codex/skills/ralph-loop/scripts/bootstrap-ralph-loop.sh --target .`
2. `AGENTS.md`에 검증 게이트 고정
   - Tests: `pnpm test -- --run`
   - Typecheck: `pnpm exec tsc --noEmit`
   - Lint: `pnpm lint`
   - Build: `pnpm build`
3. 계획 1회: `./loop.sh plan 1`
4. 구현 루프(작은 단위): `./loop.sh 1` 반복
   - 루프당 1작업(TDD red-green-refactor)
5. 종료 기준
   - 관련 테스트 + 전체 게이트 통과
   - `fallbackUsed` 회귀 없음

## 7. Success Criteria

- OpenAI 연동 상태에서 유효 JSON을 받으면 `fallbackUsed: false`
- OpenAI 실패/무효 응답이면 `fallbackUsed: true`
- 기존 테스트 스위트, lint, build 모두 통과
