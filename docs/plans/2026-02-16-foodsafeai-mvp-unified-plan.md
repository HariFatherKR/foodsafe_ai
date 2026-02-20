# FoodSafeAI 해커톤 MVP 통합 문서

- 날짜: 2026-02-16
- 문서 상태: 통합본 (기존 design/implementation 문서 병합)
- 대상: 해커톤 제출용 MVP

## 1. 통합 결정 사항

기존 문서에는 두 가지 방향이 혼재되어 있었다.

1. Supabase/Auth/Postgres 중심 확장형
2. 단일 Next.js 모노리스 + 로컬 저장 중심 초고속 MVP형

해커톤 우선순위와 사용자가 확정한 조건(1인, 최대한 빠른 구현, 리스크 E2E + 메뉴 E2E 동시 시연)에 맞춰 다음으로 통합한다.

1. 단일 Next.js 모노리스
2. 영양사 웹 + 학부모 모바일 웹
3. 식약처 OpenAPI 실연동
4. AI 메뉴 생성 + 리스크 교차검증
5. 최소 저장 계층(JSON/SQLite)

## 2. 목표와 성공 기준

### 목표

1. 리스크 E2E 완주
2. 메뉴 E2E 완주
3. 학부모 화면 즉시 반영 시연
4. 외부 API 실패 1회에도 데모 지속 가능

### 성공 기준 (Definition of Done)

1. `/nutritionist`에서 위험 검사와 메뉴 생성이 모두 동작
2. `/parent`에서 공지/메뉴 조회 가능
3. 식약처 실데이터 조회 근거(동기화 시각 + 원천 정보) 표시
4. `pnpm test`, `pnpm lint`, `pnpm build` 통과

## 3. 범위

### 포함 (In Scope)

1. 영양사 대시보드: 식자재 등록, 위험도 검사, 메뉴 생성, 공지 발행
2. 학부모 모바일 웹: 오늘 안전 배너, 위험 공지, 메뉴 확인
3. 서버 API: MFDS 프록시, 리스크 검사, 메뉴 생성, 피드 조회/발행
4. 위험 매칭: 정확 일치 + 부분 일치
5. AI 실패 fallback: 기본 규칙 메뉴 반환

### 제외 (Out of Scope)

1. 정식 인증/권한/RBAC
2. 멀티기관 분리/고급 운영기능
3. 푸시 인프라
4. 복잡한 분석 대시보드

## 4. 아키텍처

### 애플리케이션

1. Next.js App Router 단일 프로젝트
2. UI와 API Route를 같은 저장소에 통합
3. 배포 단위 1개(운영 복잡도 최소화)

### 페이지

1. `/nutritionist`: 영양사 운영 화면 (데스크톱 우선)
2. `/parent`: 학부모 조회 화면 (모바일 우선)

### API

1. `GET/POST /api/mfds/*`: 식약처 OpenAPI 프록시/정규화
2. `POST /api/risk/check`: 식자재 vs 리콜/처분 데이터 매칭
3. `POST /api/menu/generate`: 조건 기반 AI 메뉴 생성
4. `GET /api/parent/feed`: 학부모 피드 조회
5. `POST /api/parent/publish`: 공지 발행

### 저장소

1. MVP 저장: `data/store.json` 또는 SQLite
2. 저장 항목: 식자재, 리스크 이벤트, 생성 메뉴, 학부모 공지

## 5. 화면/컴포넌트

### `/nutritionist`

1. `IngredientInputPanel`
2. `RiskCheckPanel`
3. `RiskDetailCard`
4. `MenuGeneratorPanel`
5. `WeeklyMenuView`
6. `PublishNoticeButton`

### `/parent`

1. `TodaySafetyBanner`
2. `RiskNoticeList`
3. `AllergyInfoCard`
4. `MenuPreviewCard`

### 공통

1. `HeaderRoleSwitch` (데모용)
2. `SyncStatusChip`
3. `ErrorFallbackToast`

## 6. 데이터 모델 요약

```ts
type Ingredient = {
  id: string;
  name: string;
  supplier?: string;
  expiresAt?: string;
  createdAt: string;
};

type RiskEvent = {
  id: string;
  ingredientName: string;
  level: "safe" | "caution" | "danger";
  sourceType: "recall" | "administrative";
  sourceTitle: string;
  sourceDate?: string;
  sourceUrl?: string;
  autoMatched: boolean;
  suggestedSubstitute?: string;
  createdAt: string;
};

type MenuPlan = {
  id: string;
  constraints: {
    people: number;
    budget: number;
    allergies: string[];
  };
  days: Array<{
    day: string;
    items: string[];
    allergyWarnings: string[];
    substitutions?: string[];
  }>;
  createdAt: string;
};

type ParentNotice = {
  id: string;
  title: string;
  body: string;
  riskEventIds: string[];
  menuPlanId?: string;
  createdAt: string;
};
```

## 7. E2E 플로우

### 리스크 E2E

1. 영양사 식자재 등록
2. `/api/risk/check` 호출
3. 식약처 데이터 조회/정규화
4. 매칭 결과 저장 및 경고 표시
5. 공지 발행
6. 학부모 화면 반영

### 메뉴 E2E

1. 영양사 조건 입력(인원/예산/알레르기)
2. `/api/menu/generate` 호출
3. LLM JSON 응답 파싱/검증
4. 리스크 교차검증 후 대체안 표시
5. 메뉴 저장
6. 학부모 화면 조회

## 8. 오류 처리 및 신뢰성

1. MFDS 실패: 최근 캐시 반환 + 지연 배지 + 재시도 버튼
2. 응답 누락: 정규화 기본값 + UI에서 "정보 미확인" 표시
3. LLM 포맷 오류: 1회 재시도 후 fallback 메뉴 반환
4. 오탐/미탐: 자동판정 표시, 위험도 색상 차등화
5. 보안 최소선: API 키 서버 보관, 클라이언트 직접 호출 금지

## 9. 구현 태스크 (TDD 기준)

### Task 1. 프로젝트 부트스트랩 및 테스트 하네스

1. 실패 테스트 작성 (`tests/unit/health.test.ts`)
2. RED 확인
3. 최소 구현 (`src/lib/health.ts`)
4. GREEN 확인

### Task 2. 도메인 타입 및 로컬 스토리지

1. 실패 테스트 (`tests/unit/storage/store.test.ts`)
2. RED 확인
3. 구현 (`src/types/domain.ts`, `src/lib/storage/store.ts`, `data/store.json`)
4. GREEN 확인

### Task 3. MFDS 클라이언트/정규화

1. 실패 테스트 (`tests/unit/mfds/normalize.test.ts`)
2. RED 확인
3. 구현 (`src/lib/mfds/client.ts`, `src/lib/mfds/normalize.ts`)
4. GREEN 확인

### Task 4. 리스크 매칭 + API

1. 실패 테스트 (`tests/unit/risk/matcher.test.ts`, `tests/unit/api/risk-check.test.ts`)
2. RED 확인
3. 구현 (`src/lib/risk/matcher.ts`, `src/app/api/risk/check/route.ts`)
4. GREEN 확인

### Task 5. 메뉴 생성 API + fallback

1. 실패 테스트 (`tests/unit/api/menu-generate.test.ts`)
2. RED 확인
3. 구현 (`src/lib/menu/prompt.ts`, `src/lib/menu/fallback.ts`, `src/app/api/menu/generate/route.ts`)
4. GREEN 확인

### Task 6. 학부모 피드 API

1. 실패 테스트 (`tests/unit/api/parent-feed.test.ts`)
2. RED 확인
3. 구현 (`src/app/api/parent/feed/route.ts`, `src/app/api/parent/publish/route.ts`)
4. GREEN 확인

### Task 7. 영양사 페이지

1. 실패 테스트 (`tests/ui/nutritionist-page.test.tsx`)
2. RED 확인
3. 구현 (`src/app/nutritionist/page.tsx`, 관련 컴포넌트)
4. GREEN 확인

### Task 8. 학부모 페이지

1. 실패 테스트 (`tests/ui/parent-page.test.tsx`)
2. RED 확인
3. 구현 (`src/app/parent/page.tsx`, 관련 컴포넌트)
4. GREEN 확인

### Task 9. 신뢰성 UI 및 데모 시드

1. 실패 테스트 (`tests/unit/scripts/seed-demo-data.test.ts`)
2. RED 확인
3. 구현 (`SyncStatusChip`, `ErrorFallbackToast`, `scripts/seed-demo-data.ts`)
4. GREEN 확인

### Task 10. 런북/검증

1. `docs/runbooks/foodsafeai-demo-runbook.md` 작성
2. `README.md` 실행 방법 업데이트
3. 최종 검증: `pnpm test`, `pnpm lint`, `pnpm build`

## 10. 2시간 타임박스

1. 0:00-0:15 Task 1-2
2. 0:15-0:45 Task 3-4
3. 0:45-1:10 Task 5-6
4. 1:10-1:40 Task 7-8
5. 1:40-2:00 Task 9-10

## 11. 환경 변수

```bash
MFDS_API_KEY=your_mfds_key
OPENAI_API_KEY=your_openai_key
```

## 12. 검증 체크리스트

1. 식자재 등록 후 위험 결과 5초 내 표시
2. 공지 발행 후 학부모 화면 반영
3. 메뉴 생성 시 알레르기 경고 표시
4. 위험 식자재 포함 시 대체안 라벨 표시
5. 테스트/린트/빌드 통과

## 13. 문서 정리 규칙

1. 본 문서를 단일 기준 문서(single source of truth)로 사용한다.
2. 신규 변경사항은 본 파일에만 반영한다.
3. 세부 실행 중 생성되는 임시 메모는 `docs/plans/` 하위 별도 파일로 만들 수 있으나, 최종 확정 내용은 본 문서로 합친다.
