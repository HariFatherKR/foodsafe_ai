# FoodSafeAI Clinical Trust Full Design System

- 날짜: 2026-02-20
- 상태: 승인됨
- 범위: Full DS (공통 접근성/디자인 시스템)

## 1. 전략 요약

- 우선순위: 브랜드 임팩트 우선
- 비주얼 방향: Clinical Trust
- 톤: 정확성, 안정감, 전문성
- 핵심 원칙: 위험 정보는 강하게, 일반 정보는 차분하게

## 2. 시스템 아키텍처

1. Brand Foundation
- 브랜드 원칙: 정확성, 안정감, 전문성

2. Design Tokens
- color, typography, spacing, radius, shadow, motion, focus를 토큰화
- 하드코딩 스타일 대신 토큰 우선

3. Core Components
- Button, Input/Field, Badge, Alert, StatusChip, Card, SectionHeader
- state: default/loading/disabled/success/error

4. Domain Patterns
- Risk Summary
- Action Panel
- Feed List
- Empty/Loading/Error/Success 상태 패턴

5. Page Composition
- `/`, `/nutritionist`, `/parent`에 동일한 정보 계층 규칙 적용
- 첫 화면 3초 내 핵심 상태 인지 가능하도록 구성

## 3. 비주얼 시스템

- Color Axis
  - brand-blue: 신뢰/공공성
  - care-green: 안정/보호
  - signal colors: danger/warning/safe
- Typography
  - 본문 가독성 중심 (Pretendard/Noto Sans KR)
  - KPI/숫자 강조는 보조 타이포 허용
- Shape/Motion
  - 둥근 카드 + 얕은 그림자
  - 160~220ms 마이크로 인터랙션
  - `prefers-reduced-motion` 준수

## 4. 컴포넌트 규약

- Button: `primary|secondary|danger|subtle`, loading 상태에서 중복 클릭 방지
- Field: visible label + hint + input + error 구조 고정
- Alert: `info|warning|error|success`, `role=alert`와 `role=status` 분리
- StatusChip: 색상만 의존 금지(아이콘/텍스트 병행)
- RiskBadge: danger/caution/safe 용어 및 스타일 통일

## 5. 추가 추천(반영)

1. TrustEvidenceBar
- 동기화 시각, 데이터 출처, 캐시 여부 노출

2. CriticalActionSheet
- 고위험 액션(공지 발행 등) 전 요약 확인

3. Risk First Fold
- 위험 건수/조치 필요 항목/다음 액션을 첫 폴드에서 우선 노출

4. State Copy System
- 상태 카피(성공/주의/오류) 템플릿 표준화

5. Focus & Keyboard Contract
- 고대비 포커스 링
- 일관된 탭 순서 및 키보드 조작 보장

6. Two-step Loading UX
- 짧은 로딩: 버튼 내 로딩
- 긴 로딩: 섹션 로딩 표시

7. Mobile Quick Actions
- 학부모 핵심 섹션 바로가기 제공

8. DS Governance
- 공통 컴포넌트 우선 정책
- 토큰 하드코딩 금지

## 6. 검증 지표

- 브랜드 임팩트: 첫 3초 핵심 상태 인지율
- UX: 액션 완료율, 오류 재시도율, 중복 클릭률
- 접근성: 포커스 가시성, 상태 시맨틱, 키보드 접근
- 릴리즈 게이트: test/lint/build + 핵심 사용자 플로우 확인
