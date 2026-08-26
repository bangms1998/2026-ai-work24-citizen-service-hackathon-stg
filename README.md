# 고용24 공모전 Google Form형 랜딩 — TEST STAGING

고용24 공모전의 기능·디자인 검수용 L1 정적 랜딩입니다. 실제 접수와 개인정보를 받지 않습니다.

- 공개 테스트 주소: `https://bangms1998.github.io/2026-ai-work24-citizen-service-hackathon-stg/`
- GitHub 저장소: `https://github.com/bangms1998/2026-ai-work24-citizen-service-hackathon-stg`

## 로컬 실행

```bash
npm ci
npm run dev
```

- URL: `http://127.0.0.1:4173`
- 접수 상태와 Form URL: `src/site-config.js`
- `PREOPEN`: 접수 버튼 비활성
- `OPEN` + 승인된 `formUrl`: 새 창으로 Google Form 이동
- `CLOSED`: 접수 마감 표시

## 페이지

- 홈 `index.html`
- 공모안내 `guide.html`
- 공지사항 `notice.html`
- FAQ `faq.html`
- 문의 `inquiry.html`
- 수상작 `winners.html`

## 검증

```bash
npm test
npm run lint
npm run build
npm run test:e2e
npm audit --audit-level=high
```

## 금지

- production Google Form/Sheet 연결
- 실제 개인정보·출품파일 입력
- 승인 전 DNS/domain/production 배포
- 공모요강·일정·시상·문의처 임의 작성
