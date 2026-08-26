# CP3 사용자 피드백 UI 수정 — PASS

## 반영 범위

- 타이틀 위 장식용 영문 제거
- Hero 제목 행간 1.12 → 1.20, 모바일 1.22
- 서브페이지 제목 행간 1.22
- 공지사항·FAQ 등 연속 카드 사이 24px 간격
- 문의 전용 입력폼 및 synthetic-safe TEST 제출 확인
- 푸터 밝은 배경 + 공식 로고 투명 배경 유지
- 데스크톱·모바일 공통 로고-only 헤더
- 모바일 3선 햄버거 및 열림 시 닫기 모션
- `1|` 줄번호 노출 잔여 결함 제거 및 회귀 테스트 추가

## 문의 TEST 경계

- 이름·이메일·제목·내용·동의 UI와 validation은 작동함
- 제출 시 TEST 확인번호를 화면에 표시함
- 실제 서버 전송·저장·알림은 하지 않음
- 운영 문의 접수처와 개인정보 문구는 승인 후 연결 필요

## 직접 증거

- 계약 테스트: 5/5 PASS
- Playwright E2E: 13/13 PASS
- lint/build: PASS
- npm audit: 0 vulnerabilities
- 390px: 홈·공지·FAQ 픽셀 PASS
- 1440px: 문의폼 픽셀 PASS
- 공개파일 줄번호 artifact 검색: 0건

## 스크린샷

- `_reviews/screenshots-cp3/HOME_390.png`
- `_reviews/screenshots-cp3/NOTICE_390_FINAL.png`
- `_reviews/screenshots-cp3/FAQ_390_FINAL.png`
- `_reviews/screenshots-cp3/INQUIRY_1440.png`

## 판정

`PASS` for TEST STAGING. 실제 문의 전송은 production 승인 전 `BLOCKED`.
