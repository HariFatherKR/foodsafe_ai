# FoodSafeAI Demo Runbook

## 1) 준비

```bash
pnpm install
export OPENAI_API_KEY=your_openai_api_key
export OPENAI_MODEL=gpt-5.2
pnpm seed:demo
pnpm dev
```

- 앱 주소: `http://localhost:3000`
- 영양사 화면: `http://localhost:3000/nutritionist`
- 학부모 화면: `http://localhost:3000/parent`

## 2) 리스크 E2E 시연

1. 영양사 화면에서 식자재 등록 시나리오를 설명한다.
2. `POST /api/risk/check` 호출 흐름(식약처 정규화 + 매칭)을 설명한다.
3. 위험 이벤트 생성 후 학부모 공지 발행 시나리오를 설명한다.
4. 학부모 화면에서 공지 반영을 확인한다.

## 3) 메뉴 E2E 시연

1. 영양사 화면에서 인원/예산/알레르기 조건 기반 메뉴 생성 흐름을 설명한다.
2. AI 응답이 정상 JSON이면 생성 메뉴 사용.
3. AI 응답 실패 시 fallback 메뉴로 자동 전환됨을 설명한다.
4. 학부모 화면 메뉴 카드 반영을 확인한다.

## 4) 장애 대응 포인트

- MFDS 연동 실패 시: 캐시/로컬 데이터 기반 시연 지속
- `OPENAI_API_KEY` 누락/쿼터 초과/LLM 파싱 실패 시: fallback 메뉴 사용
- 동기화 정보: `SyncStatusChip`로 표시

## 5) 품질 검증

```bash
pnpm test
pnpm lint
pnpm build
```
