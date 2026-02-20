# Menu Fallback Structured Logging Design

## Goal

`/api/menu/generate`에서 fallback이 발생할 때 원인을 구조화된 서버 로그로 남겨 운영 추적성을 높인다.

## Scope

- 포함:
  - OpenAI 실패 시 `attempts/status/retryable` 메타 포함 로그
  - 메뉴 파싱 실패 시 원인 로그
  - 출력 방식: `console.warn(JSON.stringify(...))`
- 제외:
  - 응답 바디에 `fallbackReason` 추가
  - DB/파일 저장소 적재

## Architecture

- `src/lib/llm/openai.ts`
  - `OpenAiRequestError` 커스텀 에러 도입
  - 필드: `code`, `attempts`, `status`, `retryable`, `phase`
  - OpenAI 요청 실패 최종 지점에서 커스텀 에러 throw
- `src/app/api/menu/generate/route.ts`
  - fallback 분기마다 구조화 로그 1회 출력
  - 파싱 실패, OpenAI 실패, unknown 에러를 구분

## Log Schema

- `event`: `"menu_generate_fallback"`
- `reason`: `"openai_request_failed" | "menu_parse_failed" | "unknown_error"`
- `attempts`: `number | null`
- `status`: `number | null`
- `retryable`: `boolean | null`
- `message`: `string`
- `timestamp`: `string` (ISO)

## Test Strategy

- `tests/unit/api/menu-generate.test.ts`에서 `console.warn` spy 검증:
  - OpenAI 실패 fallback 로그 검증
  - 파싱 실패 fallback 로그 검증
  - 로그 payload 필드 존재/값 검증

## Success Criteria

- fallback 시 구조화 로그가 일관되게 남는다.
- 기존 API 응답 계약(`menuPlan`, `fallbackUsed`)은 유지된다.
- 전체 품질 게이트(`test`, `tsc`, `lint`, `build`) 통과.
