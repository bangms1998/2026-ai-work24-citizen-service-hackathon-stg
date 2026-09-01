# 고용24 Google Form형 테스트서버 운영 인계

- 로컬: `http://127.0.0.1:4184`
- canonical TEST: `https://stunning-work24-stg.pages.dev/`
- rollback TEST: `https://ai-work24-hackathon-2026.pages.dev/`
- 관리자 프로토타입: 로컬 `http://127.0.0.1:4184/admin.html`; 공개 빌드에는 포함하지 않음
- 제공자: Cloudflare Pages
- HTTPS: enforced
- Pages source: `main` branch `/docs`
- 공개 데이터: 미정·확인 필요 정보만
- 개인정보/접수: 없음
- 운영 Form: 미연결
- source of truth: `src/`
- deploy artifact: `docs/`
- 상태/Form adapter: `src/site-config.js`

현재 canonical TEST는 `PREOPEN + 빈 formUrl`로 fail-closed한다. 접수·문의 입력 폼은 공개하지 않고 문의는 운영 이메일로만 연결한다.

실제 Google Form 연결 시 `state: 'OPEN'`과 승인된 TEST Form URL을 함께 변경하고 contract/E2E/build/외부 read-back을 다시 수행한다. production Form은 staging 합성 제출에 사용하지 않는다. custom domain은 상대경로와 요청 host 기반 robots/sitemap을 사용하므로 사이트 소스의 hostname 교체 없이 연결할 수 있다.

공개 전 필수 명령: `npm run release:check`. 실제 운영 OPEN 전에는 `npm run release:check:production`이 PASS해야 한다.
