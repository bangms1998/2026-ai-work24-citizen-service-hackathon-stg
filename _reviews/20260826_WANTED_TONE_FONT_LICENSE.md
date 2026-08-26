# Wanted Gigs Experts 디자인 참고 분석 — 2026-08-26

- 참고 의도: **visual quality / tone-and-manner benchmark**
- 직접 확인: 민수 Mac Chrome에서 `https://www.wanted.co.kr/gigs/experts` 정상 렌더링 확인
- 자동 브라우저: CloudFront 403으로 DOM 수치 추출 제한

| 관찰 항목 | 증거 | 결정 | 고용24 적용 |
|---|---|---|---|
| 큰 Hero 제목 + 짧은 설명 + 단일 CTA | Chrome 실제 화면 | ADAPT | 46–72px Hero, 19px lead, primary CTA 1개 |
| 넓은 흰 여백과 절제된 정보량 | Chrome 실제 화면 | ADAPT | 섹션 88–128px, 한 섹션 한 역할 |
| 교차형 이미지·설명 리듬 | Chrome 실제 화면 | ADAPT | 자체 도형·텍스트 기반 3단계 및 split section |
| Wanted 로고·사진·일러스트 | 실제 화면 | REJECT | 복제/다운로드하지 않음 |
| 정확한 브랜드 색상·카드 기하 | 실제 화면 | REJECT | 고용24 파랑 기반 독자 token 사용 |
| Wanted Sans | 공식 GitHub `wanteddev/wanted-sans` | ADOPT | self-host variable WOFF2, fallback 포함 |

## 타이포그래피

Wanted Sans 공식 배포본은 7개 기본 굵기와 variable font를 제공한다. 본 사이트는 variable font의 400–1000 범위를 self-host하되 실제 UI에서는 400/650/700/720/800 중심으로 제한한다.

| 용도 | Desktop | Mobile | Weight | Line-height |
|---|---:|---:|---:|---:|
| Hero H1 | clamp 46–72px | 42px | 720 | 1.12 |
| Section H2 | clamp 34–54px | 36px | inherited heading bold | 1.18 |
| Hero lead | 19px | 17px | 400 | 1.65 |
| Navigation | 15px | 15px | 650 | normal |
| Body | 16px | 15px | 400 | 1.62 |
| Label/kicker | 12px | 12px | 800 | normal |

## 라이선스 직접 증거

- 공식 저장소: `https://github.com/wanteddev/wanted-sans`
- package license: `OFL-1.1`
- 공식 README: 글꼴 단독 판매 및 라이선스 변경을 제외한 상업적 사용·수정·재배포 가능
- `OFL.txt`: SIL Open Font License Version 1.1
- 로컬 보존: `src/assets/fonts/OFL.txt`
- 글꼴 SHA-256: `4259e7e9a172e634c2cb419d793b84148990316341e910443e5d10965b2c8f16`

판정: **PASS — 폰트 사용 가능 / Wanted 시각 자산 복제 없음**
