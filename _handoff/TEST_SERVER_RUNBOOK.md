# 고용24 Google Form형 테스트서버 운영 인계

- 로컬: `http://127.0.0.1:4173`
- 외부: GitHub Pages TEST STAGING
- 공개 데이터: 샘플·미정 정보만
- 개인정보/접수: 없음
- 운영 Form: 미연결
- source of truth: `src/`
- deploy artifact: `docs/`
- 상태/Form adapter: `src/site-config.js`

실제 Google Form 연결 시 `state: 'OPEN'`과 승인된 TEST Form URL을 함께 변경하고 contract/E2E/build/외부 read-back을 다시 수행한다. production Form은 staging 합성 제출에 사용하지 않는다.
