# 별자리 적금 ✨
### Constellation Savings — Hyper-Context Finance, Powered by Saju

> 당신의 사주(四柱)가 오늘의 저축 금액을 결정합니다.  
> 생년월일로 계산한 **60갑자 일주**에 맞는 금융 상품을 실시간으로 큐레이션하는 카카오뱅크 스타일 적금 서비스입니다.

---

## 📌 Service Intro

**별자리 적금**은 전통 명리학의 일주(日柱) 계산 로직과 현대 금융 상품 추천을 결합한 **하이퍼-콘텍스트(Hyper-Context) 적금 서비스**입니다.

단순한 이율 비교를 넘어, 유저의 생년월일로 60갑자 일주를 산출하고  
그 일주의 재물운(재성·비겁·인성) 성향에 따라 맞춤형 저축 상품을 연결합니다.  
룰렛으로 '행운의 금액'을 뽑고, 가입이 완료되면 밤하늘에 나만의 성좌가 점등됩니다.

---

## ✨ Key Features

### 1. 만세력 기반 60갑자 일주 금융 큐레이션
- 율리우스 적일(Julian Day Number) 알고리즘으로 생년월일 → 60갑자 일주를 정밀 계산
- 갑자·을축·병인… 모든 60개 일주에 **재성(A) / 비겁(B) / 인성(C)** 케이스 매핑
- 케이스별 추천 상품: 공모주 적립 펀드 / 비상금 저금통 / 정기예금
- 개인화 메시지 + **사주 궁합 점수**가 포함된 바텀시트 상품 상세 카드

### 2. 룰렛 기반 행운 저축 금액 추천
- 룰렛 회전 → 금액 확정 시 **황금 파티클 버스트** 오버레이 애니메이션
- 확정 금액: `0원 → 목표금액`까지 **0.8초 카운팅(CountUp)** + Ease-Out 효과
- 카카오뱅크 시그니처 옐로우(`#FEE500`)로 금액 강조
- 연 4.5% 기준 **6개월 만기 예상 원금 + 이자(세전)** 자동 계산 및 표시

### 3. 가입 완료 성좌 점등 세레모니 (Delight UI)
- '가입하기' 클릭 시 즉각 대시보드로 이동하지 않고 **전환 축하 화면** 노출
- 어두운 우주 배경 위로 흩어진 별(Particle)들이 유저의 일주 성좌 모양으로 **수렴·점등**
- Framer Motion `scatter → converge → glow` 3단계 시퀀셜 애니메이션
- 화면 탭 또는 2.4초 경과 시 페이드아웃 → 대시보드 전환 (스킵 가능)

### 4. 대시보드 사주 큐레이션 섹션
- 일주 배지 + 케이스 배지 + 개인화 재물운 메시지 표시
- 추천 상품 카드: 금리 강조(옐로우) + '상품 상세 보기' → 바텀시트 슬라이드업
- 사주 궁합 점수, 가입 혜택, 적용 기간 한눈에 확인

### 5. 대시보드 보상 시스템
- 저축 진척도에 따라 별자리가 단계별로 점등
- 적립 현황, 연속 저축일, 다음 보상까지 남은 금액 실시간 표시
- 상단 배너 자동 4초 페이드아웃 (메모리 리크 방지 포함)

---

## 🛠 Tech Stack

| Category | Stack |
|----------|-------|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router) |
| **Language** | TypeScript |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) (커스텀 카카오뱅크 팔레트) |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) |
| **State** | React `useState` / `useEffect` / `useMemo` / `useRef` |
| **Algorithm** | Julian Day Number → 60갑자 일주 계산 |
| **Finance Logic** | 단리 적금 이자 계산 (연 4.5%, 180일 일납) |
| **Design System** | 카카오뱅크 브랜드 가이드라인 기반 커스텀 컴포넌트 |

---

## 🚀 Getting Started

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 열어 확인하세요.

---

## 📂 Project Structure

```
app/
├── page.tsx          # 전체 앱 로직 (온보딩 → 세레모니 → 대시보드)
├── globals.css       # 전역 스타일 / 카카오 팔레트
└── layout.tsx        # 루트 레이아웃
public/
└── ...               # 정적 에셋 (별자리 이미지 등)
```

---

## 💡 Design Principles

- **Hyper-Context**: 생년월일 하나로 금융 추천의 맥락을 완전히 개인화
- **Delight First**: 가입·결과 확인 등 모든 주요 순간에 감정적 보상 제공
- **Trust Through Data**: 이자·원금 수치를 즉시 계산해 신뢰감 부여
- **KakaoBank DNA**: 과하지 않으면서도 다정한 모션, 시그니처 옐로우 포인트

---

## 📄 License

MIT — made with ✨ by Constellation Team
