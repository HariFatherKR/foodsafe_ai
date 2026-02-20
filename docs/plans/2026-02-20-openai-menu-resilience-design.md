# OpenAI Menu Resilience Design

## Goal

`src/lib/llm/openai.ts`에 timeout/retry를 추가해 OpenAI 일시 장애(429/5xx/네트워크)에서도 메뉴 생성 성공률을 높인다.

## Scope

- 포함:
  - 요청당 timeout `8s`
  - 최대 `2`회 재시도(총 `3`회 시도)
  - 재시도 대상: `429`, `5xx`, 네트워크 오류/timeout
- 제외:
  - 외부 retry 라이브러리 도입
  - 다중 provider/큐 시스템

## Design

- `generateOpenAiMenuJson` 내부에 retry loop를 직접 구현한다.
- 각 시도는 `AbortController` 기반 timeout을 적용한다.
- 재시도 간 짧은 backoff(300ms, 600ms)를 둔다.
- `400/401/403/404` 등 비재시도 오류는 즉시 실패한다.
- 최종 실패는 현재 계약대로 throw하고, 상위 `menu/generate` 라우트의 fallback 로직이 처리한다.

## Test Strategy

- `tests/unit/llm/openai.test.ts` 확장:
  - `429 -> 200`이면 재시도 후 성공
  - `500` 연속 실패면 최종 throw
  - `400`은 재시도 없이 즉시 실패
  - timeout/네트워크 오류 후 성공 응답 복구

## Success Criteria

- retry/timeout 동작을 테스트로 증명
- 기존 fallback 계약 회귀 없음
- `pnpm test -- --run`, `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build` 통과
