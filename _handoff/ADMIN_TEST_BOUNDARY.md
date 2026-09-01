# 관리자 TEST 프로토타입 운영 경계

## 주소

- 로컬 TEST: `http://127.0.0.1:4184/admin.html`
- 공개 랜딩: `/`
- canonical TEST의 `/admin.html`: 404

## 현재 작동 기능

1. 공모전 제목, Hero 제목·설명 수정
2. 접수 상태 PREOPEN / OPEN / CLOSED 선택
3. 승인된 TEST Google Form URL 입력
4. 상단 안내문 수정
5. dirty state 표시
6. 임시저장
7. 미리보기
8. 변경 취소
9. 변경사항 적용 및 브라우저 로컬 버전 생성
10. 이전 버전 롤백

## 중요한 제한

현재는 정적 staging의 localStorage UX 프로토타입이다.

인증·공유 저장·감사 로그가 없으므로 build에서 `admin.html`과 `admin.js`를 제외한다. custom domain을 연결해도 공개되지 않는다.

- 관리자 인증 없음
- 다른 직원과 공유 저장되지 않음
- 공개 랜딩 source를 실제 변경하지 않음
- 서버 DB·immutable audit 없음
- production Form 연결 금지
- 개인정보 저장 금지

## 운영 관리자 전환 시 필요한 승인

1. 인증: 회사 Google Workspace SSO + MFA
2. 역할: content editor / publisher / auditor 분리
3. 저장: contest-scoped DB와 immutable content version
4. publish: validation → diff → 승인 → 배포 → production read-back → rollback
5. 비밀값: provider secret store
6. 로그: actor, timestamp, before/after, publish result
7. 인프라: Cloudflare Access/Workers/D1 또는 승인된 회사 backend 결정

이 단계는 계정·권한·공유 데이터·production 변경이므로 민수와 야야/default 승인 후 진행한다.
