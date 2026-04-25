# 별자리 적금

> 나의 운세가 쌓이는 만큼, 나의 자산도 쌓인다.

별자리 적금은 저축을 단순한 금융 행동이 아니라 매일 확인하고 싶은 성장 경험으로 바꾸는 모바일 금융 MVP입니다. 사용자가 행운 금액을 정하고 저축할 때마다 밤하늘에 별이 생기며, 6개월 동안의 유지 행동이 하나의 은하계로 완성됩니다.

## Service Concept

이 프로젝트는 적금 상품의 핵심 문제를 "가입"이 아니라 "유지"로 정의했습니다. 기존 적금은 금리, 만기, 납입 조건 중심으로 설명되지만, 사용자가 매일 저축을 반복하게 만드는 감정적 보상은 부족합니다.

별자리 적금은 운세, 별자리, 단계별 보상, 공유 카드라는 익숙한 소비자 경험을 금융 유지 행동에 결합했습니다. 사용자는 돈을 모으는 동시에 자신의 성좌를 완성하며, 만기에는 최종 리포트와 전설의 황금 스킨을 받습니다.

## Key Features

- Onboarding: 이름, 생년월일, 태어난 시간, 성별, 저축 금액을 입력받고 PRD 기준 8가지 행운 금액을 선택합니다.
- Lucky Amount Roulette: 랜덤 추천 버튼으로 7,777원부터 99,999원까지의 금액 중 하나를 애니메이션으로 추천합니다.
- Constellation System: Framer Motion으로 별 생성 Pop, 선 Drawing, Ambient Sparkle을 구현했습니다.
- Reward Evolution: 3단계에는 입체 성좌, 5단계에는 오로라와 파스텔 UI, 8단계에는 Grand Finale 화이트아웃과 은하계 완성을 제공합니다.
- Daily Fortune: 오늘의 재물운 키워드를 노출하고 상세 풀이는 토글로 열리게 설계했습니다.
- Share Card System: 현재 성좌, 운세 키워드, 저축 회차를 조합한 9:16 스토리와 1:1 피드용 카드를 이미지로 저장할 수 있습니다.
- Maturity Report: 6개월 총 저축액, 예상 이자, 완성 은하계, 전설의 황금 스킨, 개인화 소액 투자 오퍼를 제공합니다.
- Portfolio Time Machine: 제출용 데모에서 1단계부터 8단계까지 즉시 이동해 전체 보상 구조를 빠르게 확인할 수 있습니다.
- Admin View: PM 관점의 성공 지표를 Mock Data로 시각화해 서비스화 이후의 운영 구조까지 보여줍니다.

## Tech Stack & Architecture

- Framework: Next.js App Router
- Language: TypeScript
- UI: React, Tailwind CSS
- Animation: Framer Motion, CSS Keyframes
- Icons: Lucide React
- Image Export: html-to-image
- Deployment Target: Vercel 또는 Netlify

데이터 구조는 실제 서비스 확장을 고려해 `UserProfile.birth_info`를 JSONB 저장이 가능한 형태로 구성했습니다. 유저의 기본 정보와 운세 계산에 필요한 입력값을 하나의 structured object로 유지해, 향후 Supabase나 PostgreSQL 기반 저장소로 자연스럽게 확장할 수 있습니다.

핵심 상태는 온보딩, 대시보드, 만기 리포트, Admin View로 나뉩니다. MVP 단계에서는 단일 페이지 상태 전환으로 빠르게 검증하되, 화면 경계는 컴포넌트 단위로 분리해 추후 라우팅 전환이 쉽도록 설계했습니다.

## Data-Driven Insight

이 MVP의 North Star Metric은 "가입 기간별 상품 유지율"입니다. 금융 상품의 성패는 가입 직후 전환보다 1개월, 3개월, 6개월 동안 얼마나 유지되는지에 달려 있기 때문입니다.

- Retention: 1개월, 3개월, 6개월 유지율을 추적해 단계별 보상 플랜이 실제 유지 행동을 만드는지 검증합니다.
- K-Factor: 공유 카드 클릭 수, 유입 채널별 전환율, 신규 가입 기여도를 함께 추적해 바이럴 루프의 효율을 확인합니다.
- CTR: 만기 리포트 하단의 "재물운 상승세 기반 소액 투자 제안" 클릭률을 측정해 교차 판매 가능성을 판단합니다.
- Counter Metric: 중도 해지 의도와 해지 방어 팝업 노출 이후 잔존율을 추적해 과도한 게임화가 이탈을 유발하지 않는지 점검합니다.

## Demo Flow

포트폴리오 제출 환경에서는 첫 진입 시 데모 데이터가 자동으로 입력되어 있습니다.

1. 온보딩에서 기본 정보와 행운 금액이 채워진 상태를 확인합니다.
2. `가입하기`를 눌러 별자리 대시보드로 진입합니다.
3. 우측 상단 `Time Machine`으로 1단계부터 8단계까지 시각적 진화를 빠르게 확인합니다.
4. 8단계 진입 후 Grand Finale와 최종 행운 리포트를 확인합니다.
5. 공유 카드 섹션에서 9:16, 1:1 포맷을 전환하고 이미지 저장 흐름을 확인합니다.
6. 온보딩의 `PM 데이터 대시보드 보기`에서 성공 지표 설계를 확인합니다.

## Deployment Guide

### Local

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

### Production Build

```bash
npm run build
npm run start
```

### Vercel

1. GitHub 저장소를 Vercel에 연결합니다.
2. Framework Preset은 `Next.js`를 선택합니다.
3. Build Command는 `npm run build`, Output 설정은 기본값을 사용합니다.
4. 별도 환경 변수 없이 배포 가능합니다.

### Netlify

1. GitHub 저장소를 Netlify에 연결합니다.
2. Build Command는 `npm run build`를 사용합니다.
3. Next.js 런타임은 Netlify의 Next.js 지원 설정을 사용합니다.

## PM Takeaway

이 프로젝트는 기능 구현보다 "왜 이 기능이 유지율, 바이럴, 교차 판매에 기여하는가"를 보여주기 위해 설계했습니다. 별자리 진화 시스템은 유지율을, 공유 카드는 유입을, 만기 리포트는 교차 판매 전환을 검증하는 실험 장치입니다.
