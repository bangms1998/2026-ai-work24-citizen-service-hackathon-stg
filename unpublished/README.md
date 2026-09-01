# 수상작 비공개 보관·공개 절차

현재 수상작은 **비공개** 상태다. `unpublished/winners.html`은 공개 빌드 대상인 `src/` 밖에 두므로 `docs/`와 TEST 서버에 포함되지 않는다.

## 현재 상태

- 공개 내비게이션: 수상작 링크 없음
- 공개 직접 경로 `/winners.html`: 404
- 관리자 페이지: 수상작 공개 제어 없음
- 수상작 공개: 민수가 고용24 공모전 봇에 명시적으로 요청했을 때만 새 배포로 진행

## 수상작 자료 계약

각 카드에는 승인된 정보만 사용한다.

- 썸네일
- 서비스 제목
- 서비스 정보
- 전달 유형: `link` 또는 `apk`
- 이동/다운로드 대상

### 링크형

- `https://` URL만 사용한다.
- 카드 전체를 누르면 해당 서비스로 즉시 이동한다.
- 새 창 이동에는 `target="_blank" rel="noopener noreferrer"`를 함께 쓴다.
- 배포 전 실제 HTTP 상태와 최종 리디렉션 도메인을 확인한다.

### APK형

- 원본 APK는 수신 즉시 공개 폴더에 넣지 않는다.
- 파일명·크기·SHA-256·MIME/magic bytes·악성코드 검사·배포 승인 범위를 먼저 확인한다.
- 승인 후 `src/assets/downloads/`에 보관하고 카드에는 `download` 속성을 사용한다.
- APK 설치 위험과 지원 Android 버전 등 승인된 안내문이 없으면 공개하지 않는다.

## 공개 절차

1. 실제 수상작 자료와 공개 승인 범위를 확인한다.
2. `unpublished/winners.html`의 fixture를 실제 썸네일·제목·정보·링크/APK로 교체한다.
3. 링크·파일·이미지·접근성·모바일·동일 카드 높이를 검증한다.
4. `unpublished/winners.html`을 `src/winners.html`로 복사한다.
5. 공개 6개 페이지 내비게이션에 `수상작` 링크를 추가한다.
6. build 후 `docs/winners.html` 포함과 모든 테스트를 확인한다.
7. canonical TEST에 배포하고 stable/unique URL을 read-back한다.
8. 민수 확인 뒤 production/domain 단계는 별도 승인으로 진행한다.

모든 내부 URL은 상대 경로를 사용하므로, 승인된 custom domain을 Cloudflare Pages에 연결할 때 페이지 소스의 도메인을 일괄 수정할 필요가 없다.
