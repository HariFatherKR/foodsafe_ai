# FoodSafeAI Full Brutal Re-Skin Design

- 날짜: 2026-02-20
- 상태: 승인됨
- 적용 범위: `/`, `/nutritionist`, `/parent` 전체
- 우선순위: 스타일 최우선 (접근성 기준 일부 완화 허용)

## 1. 확정 의사결정

1. 레퍼런스 무드와 유사한 강도 높은 비주얼 적용
2. 단일 홈 페이지만이 아닌 전체 페이지 확장
3. 브랜드 톤은 Clinical Trust에서 Brutal Logistics 톤으로 전환

## 2. 아키텍처

### 2.1 Layout Skeleton

- `Top Marquee Bar`: 강한 카피/상태 문구
- `Vertical Mega Type Hero`: 초대형 세로 타이포 중심 히어로
- `Segment Rail`: 운영 단계 트랙/칩
- `Hard Grid Sections`: 굵은 경계선 기반 카드 그리드

### 2.2 Composition Rules

- 타이포가 그래픽 역할을 수행한다.
- 이미지는 보조 장치(모노톤/오버레이)로 제한한다.
- 정보 블록은 비대칭 배치(규칙적 카드열 금지)
- 모든 페이지에서 동일한 시각 언어를 공유한다.

## 3. 비주얼 시스템

### 3.1 Color Tokens

- `--bg`: `#050505`
- `--surface`: `#0d0d0d`
- `--ink`: `#f2f2ea`
- `--accent`: `#ff3b00`
- `--line`: `#1f1f1f`
- 상태색(danger/warning/safe)은 semantic 유지 + 채도 상향

### 3.2 Typography

- Display: `Anton` (초대형 헤드라인/세로 타이포)
- Body/UI: `Epilogue`
- Headline scale: `clamp(3rem, 9vw, 10rem)`
- 헤드라인 letter-spacing은 타이트하게 설정

### 3.3 Form & Controls

- 버튼: 평면 고대비, 라운드 최소
- 칩/배지: 블록형 강한 대비 스타일
- 폼: 메타 스타일 라벨 + 다크 플레인 입력 박스

### 3.4 Motion

- 전환 시간: `120ms~180ms`
- 대형 타이포 reveal은 첫 진입 1회만 적용
- hover는 빠르고 짧은 변화만 허용

## 4. 페이지별 적용

### 4.1 Home (`/`)

- 상단: 빨간 marquee + 세로형 mega type
- 중단: 대형 오버랩 타이포로 서비스 메시지 구성
- 하단: MFDS 카드도 동일 Brutal 카드 톤으로 통일
- CTA는 블록형 고대비 버튼으로 구성

### 4.2 Nutritionist (`/nutritionist`)

- 첫 폴드: `RISK / MENU / NOTICE` 대형 지표 우선 노출
- 기존 기능 패널(등록/검사/생성/공지)은 로직 유지, 스킨 전환
- TrustEvidenceBar는 트랙형 상단 스트립으로 유지

### 4.3 Parent (`/parent`)

- 첫 폴드: 안전 상태 문구를 대형 헤드라인화
- 최근 공지/메뉴를 비대칭 블록으로 재배치
- 모바일에서는 안전 공지 -> 메뉴 -> 알레르기 순서 유지

## 5. 구현 원칙

1. 동작 로직/API 계약은 변경하지 않는다.
2. 컴포넌트 계층은 유지하고 스타일과 계층만 교체한다.
3. 공통 시각 규칙은 `globals.css` + 공통 컴포넌트로 통일한다.
4. 페이지별 임의 스타일 분기를 최소화한다.

## 6. 리스크

- 가독성/접근성 기준이 기존보다 낮아질 수 있다.
- 강한 비주얼 톤으로 인해 정보 탐색 효율이 낮아질 수 있다.
- 기존 브랜드 톤(Clinical Trust)과의 불연속성이 발생한다.

## 7. 완료 기준

1. `/`, `/nutritionist`, `/parent` 모두 동일 Brutal 톤으로 통일
2. 기존 E2E 동작(위해도 검사/메뉴 생성/공지 발행/피드 조회) 유지
3. `pnpm test --run`, `pnpm lint`, `pnpm build` 통과
4. 모바일(375px)과 데스크톱(1440px)에서 레이아웃 붕괴 없음
