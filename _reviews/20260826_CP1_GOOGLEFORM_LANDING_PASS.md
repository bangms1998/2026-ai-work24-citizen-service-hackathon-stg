# Google Form형 랜딩 CP1 검수

- 일시: 2026-08-26 KST
- 저장소: `03_운영자료/work24-googleform-landing`
- 원본 donor 수정: 아니오
- 배포 성격: 공개 TEST STAGING, 실제 접수 없음
- 배포 URL: `https://bangms1998.github.io/2026-ai-work24-citizen-service-hackathon-stg/`

## 구현

- L1 정적 랜딩: 홈, 공모안내, 공지, FAQ, 문의, 수상작
- Google Form adapter: `src/site-config.js`
- 현재 상태: `PREOPEN`, `formUrl: ''`
- 공모요강·KV 미수신 값: `[미정]`, `[확인 필요]`, `샘플`
- 섹션형 semantic placeholder Hero
- 390/768/1440 responsive
- keyboard focus, skip link, reduced motion

## 직접 검증

- contract tests: 3/3 PASS
- lint: PASS
- build: PASS (`docs/`)
- browser E2E: 4/4 PASS
- npm audit: 0 vulnerabilities
- screenshots:
  - `_reviews/screenshots/HOME_390.png` — 390×3806
  - `_reviews/screenshots/HOME_768.png` — 768×3328
  - `_reviews/screenshots/HOME_1440.png` — 1440×2485
- visual read-back: 겹침·잘림·가로 overflow 없음
- external read-back: Pages `built`, 핵심 6개 경로 HTTP 200, 공개 브라우저 홈·공모안내 렌더링 PASS

## Google Form 경계

현재 운영 Form URL은 연결하지 않았다. 실제 연결 전 TEST Form/TEST Sheet, 파일 업로드와 Google 로그인 필요 여부, 영수증, 응답 수정, 마감 차단, Sheet read-back을 별도 승인·검증한다.

## 판정

- 랜딩 구현·TEST STAGING: PASS
- 디자인 placeholder: PASS_FOR_STAGING / 최종 KV 수신 후 REVISE 예정
- TEST Form 연결: BLOCKED_BY_FORM_INPUT
- production: BLOCKED_BY_APPROVAL
