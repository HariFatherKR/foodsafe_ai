# FoodSafeAI MVP

해커톤 시연용 학교 급식 안전관리 MVP입니다.

## 핵심 화면

- `/nutritionist`: 영양사 운영 화면 (리스크 검사, 메뉴 생성, 공지 발행)
- `/parent`: 학부모 조회 화면 (안전 배너, 공지, 메뉴 확인)
- `/docs`: Ralph Loop + CI + Vercel/Supabase 운영 문서 화면

## 로컬 실행

```bash
pnpm install
pnpm seed:demo
pnpm dev
```

## 주요 스크립트

```bash
pnpm test
pnpm lint
pnpm build
pnpm seed:demo
```

## 주요 API

- `GET /api/mfds/datasets` (식약처 공공데이터 상세 페이지 파싱)
- `GET /api/mfds/recalls` (동일 소스 alias)
- `POST /api/risk/check`
- `POST /api/menu/generate`
- `GET /api/parent/feed`
- `POST /api/parent/publish`

## MFDS 데이터 소스

- 포털 원본: `https://data.mfds.go.kr/OPCAA01F01/search?selectedTab=tab2&allChk=Y&taskDivsCd=2&taskDivsCd=3&taskDivsCd=8&taskDivsCd=4&taskDivsCd=9&srchSrvcSeCd=2&srchSortSection=NEW`

## 데이터 저장

- 기본 저장소: `data/store.json`
- 테스트/개발 오버라이드: `FOODSAFE_STORE_PATH`

## 문서

- 통합 문서: `docs/plans/2026-02-16-foodsafeai-mvp-unified-plan.md`
- 구현 플랜: `docs/plans/2026-02-16-foodsafeai-mvp-implementation.md`
- 데모 런북: `docs/runbooks/foodsafeai-demo-runbook.md`
- 운영 런북: `docs/runbooks/ralph-loop-ci-vercel-supabase.md`
