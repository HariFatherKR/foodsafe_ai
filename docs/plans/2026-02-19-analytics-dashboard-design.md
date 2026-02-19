# FoodSafeAI 분석 대시보드 설계

**날짜:** 2026-02-19
**상태:** 승인됨

## 1. 개요

영양사와 관리자가 메뉴/영양 데이터를 한눈에 파악할 수 있는 분석 대시보드를 `/analytics` 페이지로 추가한다.

### 1.1 요구사항 요약

| 항목 | 결정 |
|------|------|
| 핵심 데이터 | 메뉴/영양 분석 중심 |
| 사용자 | 영양사 + 관리자 |
| 차트 라이브러리 | Recharts |
| 데이터 전략 | 30일분 데모 데이터 생성 + store.json |
| 페이지 구성 | 단일 페이지 `/analytics` (KPI + 차트) |
| 아키텍처 | API Route 기반 클라이언트 렌더링 |

## 2. 데이터 모델 & API

### 2.1 store.json

기존 `DomainStore` 타입은 변경하지 않는다. 현재 `menuPlans`, `riskEvents`, `ingredients`, `parentNotices` 데이터를 그대로 집계한다.

### 2.2 API 엔드포인트

**`GET /api/analytics/summary`**

store.json을 읽어 통계를 계산하여 반환한다.

```typescript
interface AnalyticsSummary {
  kpi: {
    totalMenuPlans: number
    totalIngredients: number
    totalRiskEvents: number
    dangerRate: number              // 위험(danger) 비율 (%)
    avgBudgetPerPlan: number
    totalNotices: number
  }
  charts: {
    riskByLevel: { level: string; count: number }[]
    menusByDay: { day: string; count: number }[]
    allergyDistribution: { allergen: string; count: number }[]
    riskTimeline: { date: string; danger: number; caution: number; safe: number }[]
    budgetTrend: { date: string; budget: number }[]
    ingredientUsage: { name: string; frequency: number }[]
  }
}
```

## 3. UI 컴포넌트 구조

### 3.1 페이지 레이아웃

```
/analytics 페이지
├── 헤더 (제목 + 기간 필터)
├── KPI 카드 그리드 (6개, 2x3 또는 3x2)
│   ├── 총 메뉴 플랜 수
│   ├── 등록 식자재 수
│   ├── 위험 이벤트 수
│   ├── 위험(danger) 비율
│   ├── 평균 예산
│   └── 발행 공지 수
├── 차트 섹션 (2열 그리드)
│   ├── 위험 등급별 분포 (PieChart)
│   ├── 일별 위험 추이 (AreaChart)
│   ├── 알레르기 항목 분포 (BarChart - 수평)
│   ├── 예산 추이 (LineChart)
│   ├── 요일별 메뉴 아이템 수 (BarChart)
│   └── 식자재 사용 빈도 Top 10 (BarChart - 수평)
└── 푸터
```

### 3.2 컴포넌트 파일 구조

```
src/components/analytics/
├── KpiCardGrid.tsx          # 6개 KPI 카드 그리드
├── KpiCard.tsx              # 개별 KPI 카드 (아이콘 + 숫자 + 라벨)
├── RiskLevelPieChart.tsx    # 위험 등급 파이차트
├── RiskTimelineChart.tsx    # 일별 위험 추이 에어리어 차트
├── AllergyBarChart.tsx      # 알레르기 분포 수평 바차트
├── BudgetTrendChart.tsx     # 예산 추이 라인차트
├── MenuByDayChart.tsx       # 요일별 메뉴 바차트
├── IngredientUsageChart.tsx # 식자재 사용 빈도 바차트
└── types.ts                 # 분석 전용 타입 정의
```

### 3.3 스타일링

기존 프로젝트와 동일하게 CSS(globals.css)를 사용한다. Recharts 기본 색상 팔레트를 프로젝트 톤에 맞게 커스터마이징한다.

## 4. 데모 데이터

`scripts/seed-analytics-data.ts` 스크립트를 추가하여 30일분 현실적인 데이터를 생성한다.

- 식자재 20+개 (한글명, 다양한 공급업체)
- 위험 이벤트 15+개 (danger/caution/safe 분포, 날짜 분산)
- 메뉴 플랜 8+개 (다양한 인원/예산/알레르기 조합)
- 학부모 공지 10+개 (다양한 날짜)

`package.json`에 `"seed:analytics": "tsx scripts/seed-analytics-data.ts"` 추가.

## 5. 네비게이션

기존 `HeaderRoleSwitch.tsx`에 "분석" 링크를 추가하여 `/analytics`로 이동 가능하게 한다.

## 6. 에러 처리

- store.json 읽기 실패: 빈 통계 반환 (모든 값 0)
- 데이터 없을 때: "데이터가 없습니다" 빈 상태 표시
- API 호출 실패: `ErrorFallbackToast` 기존 컴포넌트 재활용

## 7. 테스트 전략

- `tests/unit/api/analytics-summary.test.ts` - API 집계 로직 검증
- `tests/unit/analytics/aggregator.test.ts` - 통계 계산 정확성
- `tests/ui/analytics-page.test.tsx` - 페이지 렌더링 + KPI 카드 표시 검증

## 8. 파일 변경 요약

### 신규 파일
- `src/app/analytics/page.tsx` - 분석 페이지
- `src/app/api/analytics/summary/route.ts` - 통계 API
- `src/lib/analytics/aggregator.ts` - 집계 로직
- `src/components/analytics/*.tsx` - 차트 컴포넌트 (8개)
- `scripts/seed-analytics-data.ts` - 데모 데이터 생성
- `tests/unit/api/analytics-summary.test.ts`
- `tests/unit/analytics/aggregator.test.ts`
- `tests/ui/analytics-page.test.tsx`

### 수정 파일
- `src/components/common/HeaderRoleSwitch.tsx` - 분석 링크 추가
- `src/app/globals.css` - 분석 페이지 스타일 추가
- `package.json` - recharts 의존성 + seed:analytics 스크립트
