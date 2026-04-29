"use client";

import { FormEvent, forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import {
  BarChart3,
  ChevronDown,
  Download,
  Gift,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  WalletCards,
  X,
} from "lucide-react";
import { toPng } from "html-to-image";

const ROULETTE_MIN_AMOUNT = 3333;
const ROULETTE_MAX_AMOUNT = 100000;
const ROULETTE_GRID_CARDS = Array.from({ length: 8 }, (_, index) => {
  const rangeSize = (ROULETTE_MAX_AMOUNT - ROULETTE_MIN_AMOUNT + 1) / 8;
  const min = Math.round(ROULETTE_MIN_AMOUNT + rangeSize * index);
  const max =
    index === 7
      ? ROULETTE_MAX_AMOUNT
      : Math.round(ROULETTE_MIN_AMOUNT + rangeSize * (index + 1) - 1);

  return { id: index, min, max };
});

const INITIAL_SAVING_STEP = 1;

const REWARD_STAGE_MESSAGES = {
  1: "첫 별이 켜졌어요. 오늘의 작은 저축이 당신만의 우주를 시작했어요.",
  2: "좋아요! 두 번째 별이 이어지며 저축 리듬이 만들어지고 있어요.",
  3: "1개월 차 진입! 단순한 선이 입체적인 성좌로 자라났어요.",
  4: "와우! 벌써 달의 무게만큼 자산이 쌓였어요. 꾸준함이 반짝이고 있어요.",
  5: "3개월 차 달성! 오로라가 열리며 저축 별자리가 더 화려해졌어요.",
  6: "중반을 넘어섰어요. 별빛이 촘촘해질수록 목표도 가까워지고 있어요.",
  7: "거의 다 왔어요! 은하의 중심이 당신의 루틴을 향해 모이고 있어요.",
  8: "Grand Finale! 6개월의 별들이 하나의 거대한 은하계로 완성됐어요.",
} as const;

const CONSTELLATION_NODES = [
  { id: 1, x: 14, y: 66, size: 12 },
  { id: 2, x: 28, y: 45, size: 9 },
  { id: 3, x: 43, y: 57, size: 11 },
  { id: 4, x: 55, y: 32, size: 8 },
  { id: 5, x: 68, y: 48, size: 10 },
  { id: 6, x: 82, y: 28, size: 13 },
  { id: 7, x: 74, y: 72, size: 9 },
  { id: 8, x: 90, y: 58, size: 11 },
] as const;

const CONSTELLATION_EXTRA_EDGES = [
  [0, 2],
  [1, 3],
  [2, 4],
  [3, 5],
  [4, 7],
  [2, 6],
] as const;

const MILKY_WAY_PARTICLES = Array.from({ length: 42 }, (_, index) => ({
  id: index,
  left: (index * 29 + 11) % 100,
  top: (index * 47 + 7) % 100,
  delay: (index % 9) * 0.35,
  duration: 4 + (index % 6) * 0.5,
}));

const FORTUNE_KEYWORD = "작은 루틴이 큰 별이 되는 날";
const ANNUAL_INTEREST_RATE = 0.045;

const DEMO_PROFILE = {
  name: "하린",
  birthDate: "1995-07-07",
  birthTime: "07:30",
  gender: "not_specified",
  amount: 33333,
};

/**
 * 60甲子 배열 (index 0 = 갑자, index 59 = 계해)
 * 천간(갑을병정무기경신임계) × 지지(자축인묘진사오미신유술해)
 */
const SIXTY_GANJI = [
  "갑자", "을축", "병인", "정묘", "무진", "기사", "경오", "신미", "임신", "계유", // 0–9
  "갑술", "을해", "병자", "정축", "무인", "기묘", "경진", "신사", "임오", "계미", // 10–19
  "갑신", "을유", "병술", "정해", "무자", "기축", "경인", "신묘", "임진", "계사", // 20–29
  "갑오", "을미", "병신", "정유", "무술", "기해", "경자", "신축", "임인", "계묘", // 30–39
  "갑진", "을사", "병오", "정미", "무신", "기유", "경술", "신해", "임자", "계축", // 40–49
  "갑인", "을묘", "병진", "정사", "무오", "기미", "경신", "신유", "임술", "계해", // 50–59
] as const;

type GanjiName = typeof SIXTY_GANJI[number];
type CurationCase = "A" | "B" | "C";

/**
 * 3가지 큐레이션 케이스 기본 데이터
 * A: 재물운 상승  B: 지출 관리  C: 안정 지향
 */
const CURATION_CASES = {
  A: {
    label: "재물운 상승",
    description: "재물을 키우는",
    fortune: "기운이 좋습니다! 목돈을 굴릴 타이밍이에요. 적극적인 저축이 빛을 발하는 시기입니다.",
    monthly_flow: "재물 상승",
    risk_signal: "과도한 투자",
    productName: "공모주 적립 펀드",
    recommendation_code: "ipo-savings-fund",
    benefit: "첫 달 수수료 100% 면제 + 공모주 우선 배정",
    rate: "수익률 시장 연동",
    period: "6개월 이상",
  },
  B: {
    label: "지출 관리",
    description: "지출을 다스리는",
    fortune: "예상치 못한 지출(경조사·이동수)이 보입니다. 미리 비상금을 쌓아두는 것이 현명해요.",
    monthly_flow: "지출 변동",
    risk_signal: "경조사비",
    productName: "비상금 저금통",
    recommendation_code: "emergency-savings",
    benefit: "목표 달성 시 금리 우대 +0.5%",
    rate: "기본 연 2.0% + 우대 +0.5%",
    period: "목표 달성까지 자유",
  },
  C: {
    label: "안정 지향",
    description: "안정적인",
    fortune: "지금은 지키는 것이 이득입니다. 꾸준한 납입으로 안전하게 자산을 불려가세요.",
    monthly_flow: "재정 안정",
    risk_signal: "고정비 누수",
    productName: "6개월 정기예금",
    recommendation_code: "term-deposit-6m",
    benefit: "연 4.5% 확정금리 · 만기 시 자동 갱신",
    rate: "연 4.5% 확정",
    period: "6개월 고정",
  },
} as const;


/**
 * 60甲子 일주별 맞춤 큐레이션 (총 60개 완전 매핑)
 * Case 배정 근거: A=재성(財星) 강 · B=비겁(比劫) 강 · C=인성(印星) 강
 * message / product 는 일주별 커스텀값. 미입력 시 CURATION_CASES 기본값 사용.
 */
type IljuEntry = {
  case: CurationCase;
  fortune: string;
  message?: string;
  product?: string;
};
const ILJU_OVERRIDES: Record<GanjiName, IljuEntry> = {
  // ── 0번대 (갑자~계유) ──────────────────────────────────────────────────
  갑자: { case: "A", fortune: "갑목의 강한 생기가 자수를 만나 재물이 흘러듭니다. 지금이 저축을 시작할 최적기예요." },
  을축: { case: "B", fortune: "을목이 축토에 뿌리내리며 안정을 추구합니다. 예상 지출을 대비한 비상금 마련이 중요해요." },
  병인: { case: "A", fortune: "병화의 열정이 인목에 불을 지펴 강한 재물운이 흐릅니다. 목표를 크게 잡아도 좋은 시기예요." },
  정묘: { case: "C", fortune: "등불이 숲을 밝히니 지식이 재산이 되는 시기입니다. 꾸준한 기록과 학습이 미래 자산을 만들어요." },
  무진: { case: "A", fortune: "댐이 물을 가두듯 진토 속 수(水) 재성이 재물을 품습니다. 적극적 저축이 빛을 발할 시점이에요." },
  기사: { case: "C", fortune: "대지가 태양을 받아 서서히 익어가는 형국입니다. 인성(火)의 힘으로 꾸준히 쌓아가는 것이 답이에요." },
  경오: { case: "C", fortune: "강철이 용광로를 거쳐 새롭게 태어나는 기운입니다. 인성(土)을 바탕으로 내실을 다질 최적기예요." },
  신미: { case: "C", fortune: "가을 들녘에서 곡식을 갈무리하듯 미토(未土) 인성이 빛납니다. 차분히 모아가는 것이 최선이에요." },
  임신: { case: "C", fortune: "깊은 강이 금을 품듯 신금(申金) 인성이 내면의 자산을 키웁니다. 안정형 저축으로 기반을 다지세요." },
  계유: { case: "C", fortune: "고요한 물이 보석을 품듯 유금(酉金) 인성이 조용히 가치를 쌓아줍니다. 정기예금으로 지키세요." },

  // ── 10번대 (갑술~계미) ─────────────────────────────────────────────────
  갑술: { case: "A", fortune: "마른 땅에 단비가 내리듯 재물이 들어옵니다. 술토(戌土) 재성을 살려 적극적으로 저축을 시작하세요!" },
  을해: { case: "C", fortune: "바다 위에 뜬 나무처럼 유연한 흐름이 보입니다. 해수(亥水) 인성의 힘으로 꾸준한 기록이 자산이 돼요." },
  병자: { case: "B", fortune: "태양이 호수를 비추니 시선이 집중되는 날입니다. 자수(子水) 비겁이 지출을 부르니 세이프박스로 대비하세요." },
  정축: { case: "C", fortune: "따뜻한 등불이 창고를 비추는 격입니다. 축토 인성을 바탕으로 차곡차곡 모으는 재미를 느껴보세요." },
  무인: { case: "A", fortune: "산속의 호랑이가 기지개를 켜는 기운입니다. 인목(寅木) 재성이 왕성하니 과감한 목표 설정이 필요해요." },
  기묘: { case: "B", fortune: "들판의 토끼처럼 분주하게 움직이는 운입니다. 묘목(卯木) 관살이 지출을 부르니 비상금을 먼저 채우세요." },
  경진: { case: "A", fortune: "금색 용이 여의주를 얻는 강력한 운세입니다. 진토(辰土) 속 재성이 흘러드니 큰 자산을 굴릴 준비를 하세요." },
  신사: { case: "C", fortune: "보석이 불을 만나 빛나는 형국입니다. 사화(巳火)의 인성이 자기 계발의 동력이 되니 꾸준히 쌓아가세요." },
  임오: { case: "B", fortune: "강물이 말을 타고 달리는 격동의 기운입니다. 오화(午火) 재성도 있지만 비겁 기운이 강해 지출 관리가 먼저예요." },
  계미: { case: "C", fortune: "대지에 비가 내려 만물을 적시는 날입니다. 미토(未土)의 인성 기운으로 편안한 마음으로 적금액을 유지하세요." },

  // ── 20번대 (갑신~계사) ─────────────────────────────────────────────────
  갑신: { case: "C", fortune: "큰 나무가 맑은 샘물을 마시듯 지혜가 재산이 됩니다. 신금(申金) 인성을 살려 안정적 자산을 쌓아가세요." },
  을유: { case: "B", fortune: "유연한 덩굴이 날카로운 칼을 만난 형국입니다. 유금(酉金) 관살 기운이 강해 지출에 주의가 필요해요." },
  병술: { case: "A", fortune: "태양이 창고를 비추니 술토(戌土) 안의 재물이 빛을 발합니다. 숨겨진 재성을 적극적인 저축으로 살려내세요." },
  정해: { case: "C", fortune: "따뜻한 불꽃이 깊은 물을 만나 지혜가 싹트는 시기입니다. 해목(亥木) 인성으로 배움에 투자할 최적기예요." },
  무자: { case: "A", fortune: "산이 강물을 품으니 자수(子水) 재성이 자연스레 모여드는 기운입니다. 지금 저축을 늘릴 절호의 타이밍이에요." },
  기축: { case: "B", fortune: "부드러운 흙이 창고에 쌓이니 축토(丑土) 비겁 기운이 지출을 부릅니다. 지출 관리를 먼저 잡아야 해요." },
  경인: { case: "A", fortune: "도끼가 숲을 만나니 인목(寅木) 재성이 풍부한 왕성한 운세입니다. 과감하게 저축 목표를 높여보세요." },
  신묘: { case: "A", fortune: "빛나는 보석이 나무 숲에서 발견되는 재물의 기운입니다. 묘목(卯木) 재성을 살려 적극적으로 자산을 키우세요." },
  임진: { case: "B", fortune: "임수가 진토에 갇혀 이동과 변동의 기운이 강합니다. 예상치 못한 지출을 꼭 대비해두세요." },
  계사: { case: "A", fortune: "차가운 빗물이 따뜻한 연못을 만나 생기 넘치는 재물운입니다. 사화(巳火) 재성을 살려 적극 저축하세요." },

  // ── 30번대 (갑오~계묘) ─────────────────────────────────────────────────
  갑오: { case: "A", fortune: "갑목이 오화 위에 서서 강렬한 재물운을 뿜습니다. 적극적인 투자와 저축 모두 빛나는 시기예요." },
  을미: { case: "A", fortune: "유연한 덩굴이 비옥한 땅을 만나 재물이 뻗어납니다. 미토(未土) 재성을 살려 저축 목표를 높여보세요." },
  병신: { case: "A", fortune: "태양이 광산을 비추니 신금(申金) 재성이 드러납니다. 숨겨진 재물을 공격적인 저축으로 확보하세요." },
  정유: { case: "B", fortune: "관계 확장이 많아 경조사비를 조심해야 하네요.", message: "룰렛 당첨 기념으로 경조사 준비 저금통 혜택을 확인해보세요.", product: "경조사 준비 저금통" },
  무술: { case: "C", fortune: "무토가 술토와 만나 이중 방어막이 형성됩니다. 지키는 저축으로 탄탄한 기반을 쌓을 시기예요." },
  기해: { case: "C", fortune: "기토가 해수를 품어 내면에 에너지를 저장합니다. 안전한 정기예금으로 내실을 다질 때입니다." },
  경자: { case: "B", fortune: "날카로운 금이 물 위에 뜨니 유동성이 크고 지출이 잦습니다. 자수(子水) 식상 기운을 비상금으로 잡아두세요." },
  신축: { case: "C", fortune: "정제된 보석이 창고에 쌓이듯 꾸준한 축적이 빛납니다. 축토(丑土) 인성을 바탕으로 안정형 예금을 추천해요." },
  임인: { case: "A", fortune: "강물이 숲을 지나며 재물을 실어 나르는 왕성한 운세입니다. 인목(寅木) 식상에서 재성이 나오니 지금이 기회예요." },
  계묘: { case: "C", fortune: "계수가 묘목을 키워내며 조용한 성장을 이룹니다. 꾸준한 정기예금으로 장기 자산을 키워가세요." },

  // ── 40번대 (갑진~계축) ─────────────────────────────────────────────────
  갑진: { case: "A", fortune: "큰 나무가 용의 땅에 뿌리내리니 진토(辰土) 재성이 깊게 자리합니다. 지금 저축을 늘릴 최적 타이밍이에요." },
  을사: { case: "A", fortune: "부드러운 나무가 따뜻한 불빛 아래 재물을 탐하는 운세입니다. 사토(巳土) 재성을 살려 적극적으로 모아가세요." },
  병오: { case: "B", fortune: "두 태양이 만나니 에너지는 넘치나 지출이 과할 수 있습니다. 비겁(比劫)이 강하니 비상금 저금통이 필수예요." },
  정미: { case: "B", fortune: "작은 등불이 넓은 들에 서니 비겁(比劫)으로 지출이 사방으로 흩어집니다. 지출 통제를 먼저 실천하세요." },
  무신: { case: "A", fortune: "큰 산이 금맥을 품으니 신금(申金) 식상에서 재성(水)이 흐릅니다. 재물 운기가 가득한 저축의 시기예요." },
  기유: { case: "B", fortune: "부드러운 흙이 보석을 다듬으니 유금(酉金) 식상 기운이 강합니다. 쓸수록 줄어드니 비상금 저금통이 먼저예요." },
  경술: { case: "C", fortune: "강인한 금이 창고에 쌓이니 술토(戌土) 인성이 빛납니다. 인내하며 꾸준히 쌓는 정기예금이 가장 잘 맞아요." },
  신해: { case: "A", fortune: "빛나는 보석이 깊은 물속 나무를 만나 재물이 흘러듭니다. 해목(亥木) 재성을 살려 목표를 크게 잡아보세요." },
  임자: { case: "B", fortune: "강이 바다를 만나 흘러나가니 자수(子水) 비겁이 지출을 부릅니다. 나가는 돈을 비상금으로 먼저 잡아두세요." },
  계축: { case: "C", fortune: "빗물이 창고에 고이듯 축금(丑金) 인성이 조용히 자산을 쌓아줍니다. 꾸준한 정기예금으로 미래를 준비하세요." },

  // ── 50번대 (갑인~계해) ─────────────────────────────────────────────────
  갑인: { case: "B", fortune: "두 나무가 겹치는 형국, 비겁(比劫)이 강해 경쟁과 지출이 많아집니다. 비상금 저금통으로 먼저 방어하세요." },
  을묘: { case: "B", fortune: "부드러운 덩굴이 숲을 이루니 비겁(比劫) 기운으로 지출이 넓어집니다. 지출 관리를 최우선으로 하세요." },
  병진: { case: "C", fortune: "태양이 용의 창고를 비추니 진수(辰水) 인성 기운이 지식을 쌓아줍니다. 배움에 투자하는 것이 최고의 저축이에요." },
  정사: { case: "A", fortune: "등불이 뜨거운 연못을 비추니 사금(巳金) 재성이 드러납니다. 숨은 재물 기운을 공모주 펀드로 살려보세요." },
  무오: { case: "C", fortune: "산이 태양을 품으니 오화(午火) 인성 기운이 따뜻하게 성장을 돕습니다. 꾸준한 납입이 최고의 전략이에요." },
  기미: { case: "C", fortune: "기름진 땅이 여름 햇살을 받아 무르익는 성장의 시기입니다. 인성(火)의 힘으로 꾸준히 자산을 쌓아가세요." },
  경신: { case: "A", fortune: "경금이 신금을 만나 날카로운 결단력이 재물을 불러옵니다. 과감한 저축 결정을 내릴 시점이에요." },
  신유: { case: "B", fortune: "두 보석이 맞부딪히니 날카롭지만 비겁(比劫) 기운으로 지출이 쉽게 나갑니다. 비상금 저금통을 꼭 활용하세요." },
  임술: { case: "A", fortune: "강물이 창고를 비추니 술화(戌火) 재성이 감춰진 재물을 드러냅니다. 지금이 적극적 저축의 적기예요." },
  계해: { case: "B", fortune: "빗물이 바다로 돌아가니 해수(亥水) 비겁 기운으로 지출이 흘러나갑니다. 나가는 돈을 꼭 잡아두세요." },
};

const RETENTION_METRICS = [
  { label: "1개월", value: 82, color: "bg-cyan-300" },
  { label: "3개월", value: 64, color: "bg-violet-300" },
  { label: "6개월", value: 47, color: "bg-kakao-yellow" },
];

const VIRAL_CHANNELS = [
  { channel: "Instagram Story", clicks: 1280, conversion: 12.4 },
  { channel: "Instagram Feed", clicks: 860, conversion: 8.7 },
  { channel: "KakaoTalk", clicks: 640, conversion: 15.1 },
];

const ROULETTE_BURST_PARTICLES = Array.from({ length: 28 }, (_, index) => {
  const angle = (Math.PI * 2 * index) / 28;
  const distance = 54 + (index % 5) * 9;

  return {
    id: index,
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    color: ["#ffffff", "#fee500", "#f5d0fe", "#ddd6fe"][index % 4],
    size: 2 + (index % 3),
  };
});

// 가입 세레모니: 별이 흩어진 위치에서 성좌 노드로 수렴하는 애니메이션 초기 오프셋 (px)
const CEREMONY_SCATTER_OFFSETS = [
  { dx: -90, dy: -70 },
  { dx:  75, dy: -90 },
  { dx: -110, dy:  10 },
  { dx:  100, dy: -20 },
  { dx: -55,  dy:  80 },
  { dx:  95,  dy:  65 },
  { dx: -35,  dy:  95 },
  { dx:  60,  dy: -50 },
] as const;

// 금액 표기는 금융 서비스 신뢰도에 직접 영향을 주므로 전 화면에서 동일한 포맷을 사용합니다.
const formatWon = (amount: number) => `${amount.toLocaleString("ko-KR")}원`;

const getRouletteCardIndex = (amount: number) =>
  Math.min(
    ROULETTE_GRID_CARDS.length - 1,
    Math.max(
      0,
      Math.floor(
        ((amount - ROULETTE_MIN_AMOUNT) /
          (ROULETTE_MAX_AMOUNT - ROULETTE_MIN_AMOUNT + 1)) *
          ROULETTE_GRID_CARDS.length,
      ),
    ),
  );

/**
 * 일일 납입 적금 만기 수령액 계산 (연 복리 없이 단순 적금 이자식)
 * 이자 = 일납입액 × (연금리/365) × Σ(잔여일수) = 일납입액 × (연금리/365) × n(n-1)/2
 */
const calcDailySavings = (dailyAmount: number) => {
  const days = 180;
  const principal = dailyAmount * days;
  const interest = Math.round(
    dailyAmount * (ANNUAL_INTEREST_RATE / 365) * ((days * (days - 1)) / 2),
  );
  return { principal, interest };
};

function CountUp({ target, duration = 500 }: { target: number; duration?: number }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setCurrent(0);
      return;
    }
    let animId: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCurrent(Math.round(eased * target));
      if (t < 1) animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [target, duration]);

  return <>{current.toLocaleString("ko-KR")}원</>;
}

/**
 * 그레고리력 생년월일 → 일주(60갑자) 계산
 * Julian Day Number(JDN)를 이용한 전통 만세력 방식.
 * offset 49는 한국 전통 사주 기준 甲子 기준일 보정값입니다.
 */
const calcDayPillar = (birthDate: string): GanjiName => {
  const [y, m, d] = birthDate.split("-").map(Number);
  const a = Math.floor((14 - m) / 12);
  const yr = y + 4800 - a;
  const mo = m + 12 * a - 3;
  const jdn =
    d +
    Math.floor((153 * mo + 2) / 5) +
    365 * yr +
    Math.floor(yr / 4) -
    Math.floor(yr / 100) +
    Math.floor(yr / 400) -
    32045;
  return SIXTY_GANJI[(jdn + 49) % 60];
};

/** 일주에 해당하는 큐레이션 데이터를 반환 (60개 일주 전체 커버) */
const getIljuCuration = (dayPillar: GanjiName) => {
  const { case: caseKey, fortune, message, product } = ILJU_OVERRIDES[dayPillar];
  const base = CURATION_CASES[caseKey];
  return {
    curationCase: caseKey,
    fortune,
    customMessage: message,
    caseDescription: base.description,
    productName: product ?? base.productName,
    monthly_flow: base.monthly_flow,
    risk_signal: base.risk_signal,
    recommendation_code: base.recommendation_code,
    benefit: base.benefit,
    rate: base.rate,
    period: base.period,
  };
};

const getSajuData = (birthDate: string): NonNullable<UserProfile["birth_info"]["saju"]> => {
  const dayPillar = calcDayPillar(birthDate);
  const { monthly_flow, risk_signal, recommendation_code } = getIljuCuration(dayPillar);
  return { day_pillar: dayPillar, monthly_flow, risk_signal, recommendation_code };
};

const getFortuneCuration = (birthInfo: UserProfile["birth_info"]) => {
  const saju = birthInfo.saju ?? getSajuData(birthInfo.birth_date);
  const dayPillar = saju.day_pillar as GanjiName;
  const { curationCase, fortune, productName, benefit, customMessage, caseDescription, rate, period } =
    getIljuCuration(dayPillar);
  const sajuScore = 85 + (SIXTY_GANJI.indexOf(dayPillar) * 7 + 13) % 15;
  return {
    title: productName,
    benefit,
    fortune,
    curationCase,
    dayPillar,
    rate,
    period,
    sajuScore,
    message:
      customMessage ??
      `${birthInfo.name}님(${dayPillar} 일주), 이번 달은 ${saju.monthly_flow}가 많아 ${saju.risk_signal}를 조심해야 하네요. 그래서 ${dayPillar} 일주의 ${caseDescription} 기운을 지켜줄 ${productName}을 준비했어요.`,
  };
};

// 포트폴리오 평가자가 별도 입력 없이 핵심 흐름을 확인하도록 데모 데이터를 기본 주입합니다.
export default function Home() {
  const [name, setName] = useState(DEMO_PROFILE.name);
  const [birthDate, setBirthDate] = useState(DEMO_PROFILE.birthDate);
  const [birthTime, setBirthTime] = useState(DEMO_PROFILE.birthTime);
  const [gender, setGender] = useState(DEMO_PROFILE.gender);
  const [unknownBirthTime, setUnknownBirthTime] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(DEMO_PROFILE.amount);
  const [hasResult, setHasResult] = useState(false);
  const [pendingProfile, setPendingProfile] = useState<UserProfile | null>(null);
  const [showCeremony, setShowCeremony] = useState(false);
  const [isRecommending, setIsRecommending] = useState(false);
  const [fortuneMessage, setFortuneMessage] = useState("");
  const [resultBurstKey, setResultBurstKey] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const rouletteControls = useAnimationControls();
  const rouletteRotationRef = useRef(0);

  const isReadyToJoin = useMemo(() => {
    const hasBirthTime = unknownBirthTime || birthTime.length > 0;

    return (
      name.trim().length > 0 &&
      birthDate.length > 0 &&
      gender.length > 0 &&
      hasBirthTime &&
      selectedAmount !== null
    );
  }, [birthDate, birthTime, gender, name, selectedAmount, unknownBirthTime]);

  // 룰렛은 선택 피로를 줄이는 동시에 "운명이 금액을 골라준다"는 감정적 명분을 만듭니다.
  const recommendAmount = async () => {
    if (isRecommending) {
      return;
    }

    setIsRecommending(true);
    setHasResult(false);
    setFortuneMessage("");

    const generatedAmount =
      Math.floor(Math.random() * (ROULETTE_MAX_AMOUNT - ROULETTE_MIN_AMOUNT + 1)) +
      ROULETTE_MIN_AMOUNT;
    const targetIndex = getRouletteCardIndex(generatedAmount);
    const segmentAngle = 360 / ROULETTE_GRID_CARDS.length;
    const targetAngle =
      Math.random() * 360 + 360 * 8 + targetIndex * segmentAngle + segmentAngle / 2;
    const overshootAngle = targetAngle + 12;

    await rouletteControls.start({
      rotate: rouletteRotationRef.current + 360 * 2,
      transition: { duration: 0.5, ease: "easeIn" },
    });
    await rouletteControls.start({
      rotate: rouletteRotationRef.current + 360 * 7 + Math.random() * 360,
      transition: { duration: 2, ease: "linear" },
    });
    await rouletteControls.start({
      rotate: overshootAngle,
      transition: { duration: 0.28, ease: "easeOut" },
    });
    await rouletteControls.start({
      rotate: targetAngle,
      transition: { type: "spring", stiffness: 200, damping: 20 },
    });

    rouletteRotationRef.current = targetAngle;
    setSelectedAmount(generatedAmount);
    setFortuneMessage(`${name.trim() || "하린"}님의 오늘 행운 금액: ${formatWon(generatedAmount)}`);
    setResultBurstKey((current) => current + 1);
    setHasResult(true);
    setIsRecommending(false);
  };

  // 가입 완료 시점에 JSONB 저장을 가정한 birth_info 구조로 사용자 데이터를 정규화합니다.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isReadyToJoin) {
      return;
    }

    const joinedProfile: UserProfile = {
      user_id: name.trim(),
      birth_info: {
        name: name.trim(),
        birth_date: birthDate,
        gender,
        saju: getSajuData(birthDate),
      },
    };

    if (!unknownBirthTime) {
      joinedProfile.birth_info.birth_time = birthTime;
    }

    // 세레모니 화면을 먼저 보여주고, 완료 후 대시보드로 이동합니다.
    setPendingProfile(joinedProfile);
    setShowCeremony(true);
  };

  if (showAdmin) {
    return <AdminDashboard onBack={() => setShowAdmin(false)} />;
  }

  if (showCeremony && pendingProfile) {
    return (
      <JoinCeremony
        name={pendingProfile.birth_info.name}
        dayPillar={pendingProfile.birth_info.saju?.day_pillar ?? "갑자"}
        onDismiss={() => {
          setProfile(pendingProfile);
          setPendingProfile(null);
          setShowCeremony(false);
        }}
      />
    );
  }

  if (profile) {
    return (
      <Dashboard profile={profile} selectedAmount={selectedAmount} />
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      className="min-h-screen bg-white px-5 py-6 text-kakao-black"
    >
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex w-full max-w-md flex-col gap-7"
      >
        <header className="rounded-[32px] bg-kakao-gray p-6 shadow-soft">
          <div className="mb-7 flex items-center justify-between">
            <span className="rounded-full bg-kakao-yellow px-4 py-2 text-sm font-extrabold">
              Step 1
            </span>
            <span className="text-sm font-semibold text-neutral-500">
              Portfolio Demo
            </span>
          </div>
          <h1 className="text-3xl font-extrabold leading-tight">
            내 별자리에 맞춘
            <br />
            행운 저축을 시작해요
          </h1>
          <p className="mt-4 text-base leading-7 text-neutral-600">
            기본 정보를 입력하고, 오늘의 행운 금액을 골라 가입을 완료해보세요.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <div className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-extrabold">
              6개월 만기, 자유적립식
            </div>
            <div className="inline-flex rounded-full bg-kakao-yellow px-4 py-2 text-sm font-extrabold">
              데모 데이터 로드됨
            </div>
          </div>
        </header>

        <section className="rounded-[28px] border border-neutral-100 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-extrabold">정보 입력</h2>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-bold text-neutral-700">이름</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="홍길동"
                className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-4 outline-none transition focus:border-kakao-yellow focus:ring-4 focus:ring-yellow-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-neutral-700">
                생년월일
              </span>
              <input
                type="date"
                value={birthDate}
                onChange={(event) => setBirthDate(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-4 outline-none transition focus:border-kakao-yellow focus:ring-4 focus:ring-yellow-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-neutral-700">성별</span>
              <select
                value={gender}
                onChange={(event) => setGender(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-4 outline-none transition focus:border-kakao-yellow focus:ring-4 focus:ring-yellow-100"
              >
                <option value="">선택해주세요</option>
                <option value="female">여성</option>
                <option value="male">남성</option>
                <option value="not_specified">선택 안 함</option>
              </select>
            </label>

            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-neutral-700">
                  태어난 시간
                </span>
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-600">
                  <input
                    type="checkbox"
                    checked={unknownBirthTime}
                    onChange={(event) => {
                      setUnknownBirthTime(event.target.checked);
                      if (event.target.checked) {
                        setBirthTime("");
                      }
                    }}
                    className="h-4 w-4 accent-kakao-yellow"
                  />
                  모름
                </label>
              </div>
              <input
                type="time"
                value={birthTime}
                disabled={unknownBirthTime}
                onChange={(event) => setBirthTime(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-4 outline-none transition focus:border-kakao-yellow focus:ring-4 focus:ring-yellow-100 disabled:bg-neutral-100 disabled:text-neutral-400"
              />
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-neutral-100 bg-white p-5 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold">행운의 저축 금액</h2>
              <p className="mt-1 text-sm text-neutral-500">
                룰렛이 오늘의 재물운 금액을 찾아줘요.
              </p>
            </div>
            <button
              type="button"
              onClick={recommendAmount}
              disabled={isRecommending}
              className="shrink-0 rounded-full bg-kakao-yellow px-4 py-2 text-sm font-extrabold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isRecommending ? "운명을 읽는 중..." : "행운의 금액 추천받기"}
            </button>
          </div>

          <AnimatePresence>
            {fortuneMessage ? (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-5 rounded-2xl bg-yellow-50 px-4 py-3 text-sm font-black text-kakao-black"
              >
                {fortuneMessage}
              </motion.p>
            ) : null}
          </AnimatePresence>

          <div className="mt-5 rounded-[28px] bg-[#070B1E] p-5 text-white">
            <div className="relative mx-auto flex h-56 w-56 items-center justify-center">
              <motion.div
                animate={rouletteControls}
                className="roulette-wheel relative h-48 w-48 overflow-hidden rounded-full border-4 border-kakao-yellow shadow-[0_0_32px_rgba(254,229,0,0.45)]"
              >
                <img
                  src="/image_f00ef5.png"
                  alt=""
                  className="absolute inset-0 z-10 h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#fee500,#f59e0b,#a5f3fc,#c084fc,#fee500,#f97316,#e0f2fe,#fee500)] opacity-80" />
                <div className="absolute inset-5 z-20 rounded-full border border-white/40 bg-slate-950/40" />
              </motion.div>
              <AnimatePresence>
                {resultBurstKey > 0 && selectedAmount ? (
                  <motion.div
                    key={`roulette-result-${resultBurstKey}`}
                    className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      className="absolute h-48 w-48 rounded-full border-4 border-kakao-yellow"
                      initial={{ opacity: 0, scale: 0.92, boxShadow: "0 0 0 rgba(254,229,0,0)" }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0.92, 1.08, 1],
                        boxShadow: [
                          "0 0 0 rgba(254,229,0,0)",
                          "0 0 52px rgba(254,229,0,0.95)",
                          "0 0 18px rgba(254,229,0,0)",
                        ],
                      }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                    {ROULETTE_BURST_PARTICLES.map((particle) => (
                      <motion.span
                        key={particle.id}
                        className="absolute rounded-full"
                        style={{
                          width: particle.size,
                          height: particle.size,
                          backgroundColor: particle.color,
                          boxShadow: `0 0 10px ${particle.color}`,
                        }}
                        initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
                        animate={{
                          x: particle.x,
                          y: particle.y,
                          opacity: [0, 1, 0],
                          scale: [0.4, 1.4, 0.2],
                        }}
                        transition={{ duration: 0.72, ease: "easeOut", delay: 0.16 }}
                      />
                    ))}
                    <motion.div
                      className="rounded-3xl bg-slate-950/80 px-5 py-3 text-center shadow-[0_0_34px_rgba(254,229,0,0.45)] backdrop-blur"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      transition={{
                        scale: {
                          type: "spring",
                          stiffness: 420,
                          damping: 10,
                          mass: 0.65,
                        },
                        opacity: { duration: 0.14 },
                      }}
                    >
                      <p className="text-xs font-black text-kakao-yellow">행운 금액</p>
                      <p className="mt-1 text-2xl font-black text-kakao-yellow">
                        <CountUp key={`burst-${resultBurstKey}`} target={selectedAmount} duration={800} />
                      </p>
                    </motion.div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
              <div className="absolute -top-1 h-0 w-0 border-x-[12px] border-t-[24px] border-x-transparent border-t-kakao-yellow drop-shadow" />
              <div className="pointer-events-none absolute inset-0">
                {Array.from({ length: 16 }, (_, index) => (
                  <motion.span
                    key={index}
                    className="absolute h-1 w-1 rounded-full bg-kakao-yellow"
                    style={{
                      left: `${(index * 23 + 9) % 100}%`,
                      top: `${(index * 31 + 17) % 100}%`,
                    }}
                    animate={
                      isRecommending
                        ? {
                            opacity: [0.2, 1, 0.25],
                            scale: [0.7, 1.6, 0.8],
                            y: [0, -12, 0],
                          }
                        : { opacity: 0.2, scale: 1 }
                    }
                    transition={{
                      duration: 0.8,
                      repeat: isRecommending ? Infinity : 0,
                      delay: index * 0.04,
                    }}
                  />
                ))}
              </div>
            </div>
            <AnimatePresence mode="wait">
              {hasResult && selectedAmount ? (
                <motion.p
                  key="result-label"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.35 }}
                  className="mt-3 text-center text-sm text-white/65"
                >
                  {name.trim() || "하린"}님의 오늘 행운 금액:{" "}
                  <span className="font-black text-kakao-yellow">
                    <CountUp key={`label-${resultBurstKey}`} target={selectedAmount} duration={800} />
                  </span>
                </motion.p>
              ) : (
                <motion.p
                  key="idle-label"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="mt-3 text-center text-sm font-semibold text-white/30"
                >
                  {isRecommending ? "운명을 읽는 중..." : "룰렛을 돌려보세요"}
                </motion.p>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {hasResult && selectedAmount ? (() => {
                const { principal, interest } = calcDailySavings(selectedAmount);
                return (
                  <motion.div
                    key={`savings-${selectedAmount}`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.45, delay: 0.3, ease: "easeOut" }}
                    className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4"
                  >
                    <p className="mb-3 text-center text-[11px] font-medium text-white/45">
                      매일 {formatWon(selectedAmount)} × 180일 납입 시 (연 4.5%, 세전)
                    </p>
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-center">
                        <p className="text-[10px] uppercase tracking-widest text-white/35">예상 원금</p>
                        <p className="mt-1 text-base font-black text-white">
                          <CountUp key={`principal-${selectedAmount}`} target={principal} />
                        </p>
                      </div>
                      <div className="text-xl font-light text-white/25">+</div>
                      <div className="text-center">
                        <p className="text-[10px] uppercase tracking-widest text-kakao-yellow/60">이자 (세전)</p>
                        <p className="mt-1 text-base font-black text-kakao-yellow">
                          <CountUp key={`interest-${selectedAmount}`} target={interest} />
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-center text-[10px] text-white/25">
                      6개월 만기 예상 수령액 · 세전 · 단리 기준
                    </p>
                  </motion.div>
                );
              })() : null}
            </AnimatePresence>
          </div>

        </section>

        <button
          type="submit"
          disabled={!isReadyToJoin}
          className="sticky bottom-5 rounded-2xl bg-kakao-yellow px-5 py-5 text-lg font-black shadow-soft transition active:scale-[0.99] disabled:bg-neutral-200 disabled:text-neutral-400"
        >
          가입하기
        </button>
        <button
          type="button"
          onClick={() => setShowAdmin(true)}
          className="rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-sm font-black text-neutral-600 transition active:scale-[0.99]"
        >
          PM 데이터 대시보드 보기
        </button>
      </form>
    </motion.main>
  );
}

// 상품 핵심 요약 바텀 시트 — 아래서 위로 슬라이드하며 사주 궁합 점수를 위트 있게 노출합니다.
function ProductBottomSheet({
  curation,
  onClose,
}: {
  curation: ReturnType<typeof getFortuneCuration>;
  onClose: () => void;
}) {
  const caseColor =
    curation.curationCase === "A"
      ? { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-200" }
      : curation.curationCase === "B"
        ? { bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-200" }
        : { bg: "bg-violet-50", text: "text-violet-600", ring: "ring-violet-200" };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.section
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32, mass: 0.9 }}
        className="w-full rounded-t-[32px] bg-white pb-8 text-kakao-black shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 드래그 핸들 */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-neutral-200" />
        </div>

        {/* 헤더 */}
        <div className="flex items-start justify-between gap-4 px-6 pt-3 pb-4 border-b border-neutral-100">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
              상품 핵심 요약
            </p>
            <h2 className="mt-1 text-2xl font-black">{curation.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-1 rounded-full bg-neutral-100 p-2 transition active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 pt-5 space-y-4">
          {/* 핵심 스펙 3종 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-kakao-gray p-3 text-center">
              <p className="text-[10px] font-bold text-neutral-400">금리</p>
              <p className="mt-1 text-sm font-black leading-tight text-kakao-black">{curation.rate}</p>
            </div>
            <div className="rounded-2xl bg-kakao-gray p-3 text-center">
              <p className="text-[10px] font-bold text-neutral-400">기간</p>
              <p className="mt-1 text-sm font-black leading-tight text-kakao-black">{curation.period}</p>
            </div>
            {/* 사주 궁합 점수 */}
            <div className={`rounded-2xl p-3 text-center ring-1 ${caseColor.bg} ${caseColor.ring}`}>
              <p className="text-[10px] font-bold text-neutral-400">사주 궁합</p>
              <p className={`mt-1 text-sm font-black leading-tight ${caseColor.text}`}>
                {curation.sajuScore}점 ✨
              </p>
            </div>
          </div>

          {/* 혜택 강조 */}
          <div className="rounded-2xl bg-[#FFFBE6] px-4 py-3 ring-1 ring-kakao-yellow/40">
            <p className="text-[10px] font-bold text-yellow-600">가입 혜택</p>
            <p className="mt-1 font-black text-kakao-black">{curation.benefit}</p>
          </div>

          {/* 개인화 설명 */}
          <p className="text-sm leading-6 text-neutral-500">{curation.message}</p>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl bg-kakao-yellow px-4 py-4 font-black transition active:scale-[0.99]"
          >
            확인했어요
          </button>
        </div>
      </motion.section>
    </motion.div>
  );
}

// 가입 완료 축하 세레모니: 흩어진 별이 유저의 일주 성좌로 수렴하며 점등됩니다.
function JoinCeremony({
  name,
  dayPillar,
  onDismiss,
}: {
  name: string;
  dayPillar: string;
  onDismiss: () => void;
}) {
  const [phase, setPhase] = useState<"enter" | "exit">("enter");

  const dismiss = () => {
    if (phase === "enter") setPhase("exit");
  };

  useEffect(() => {
    const t = window.setTimeout(dismiss, 2400);
    return () => window.clearTimeout(t);
  // dismiss는 렌더마다 새로 만들어지지 않도록 phase만 의존
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const W = 224, H = 160;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#070B1E] cursor-pointer select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: phase === "exit" ? 0 : 1 }}
      transition={{ duration: phase === "exit" ? 0.55 : 0.42 }}
      onAnimationComplete={() => { if (phase === "exit") onDismiss(); }}
      onClick={dismiss}
    >
      {/* 배경 환경 별 */}
      <div className="pointer-events-none absolute inset-0">
        {MILKY_WAY_PARTICLES.slice(0, 24).map((p) => (
          <motion.span
            key={p.id}
            className="absolute rounded-full bg-white"
            style={{ left: `${p.left}%`, top: `${p.top}%`, width: 2, height: 2 }}
            animate={{ opacity: [0.08, 0.45, 0.08] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-7 px-8 text-center">
        {/* 축하 메시지 */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48, delay: 0.18 }}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-kakao-yellow/70">
            ✨ 가입 완료
          </p>
          <h2 className="mt-2 text-2xl font-black leading-snug text-white">
            {name}님만의 별자리가<br />생성되었습니다!
          </h2>
          <p className="mt-1.5 text-sm text-white/40">{dayPillar} 일주의 성좌가 빛납니다</p>
        </motion.div>

        {/* 성좌 애니메이션: scatter → converge → glow */}
        <div className="relative" style={{ width: W, height: H }}>
          {/* 선 레이어 */}
          <svg className="absolute inset-0" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
            {CONSTELLATION_NODES.slice(1).map((node, i) => {
              const prev = CONSTELLATION_NODES[i];
              return (
                <motion.line
                  key={`seq-${i}`}
                  x1={(prev.x / 100) * W} y1={(prev.y / 100) * H}
                  x2={(node.x / 100) * W} y2={(node.y / 100) * H}
                  stroke="rgba(254,229,0,0.5)" strokeWidth="0.8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.22, delay: 0.95 + i * 0.08 }}
                />
              );
            })}
            {CONSTELLATION_EXTRA_EDGES.map(([a, b], i) => {
              const nA = CONSTELLATION_NODES[a], nB = CONSTELLATION_NODES[b];
              return (
                <motion.line
                  key={`ex-${i}`}
                  x1={(nA.x / 100) * W} y1={(nA.y / 100) * H}
                  x2={(nB.x / 100) * W} y2={(nB.y / 100) * H}
                  stroke="rgba(254,229,0,0.25)" strokeWidth="0.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: 1.45 + i * 0.06 }}
                />
              );
            })}
          </svg>

          {/* 별 레이어: 흩어진 위치에서 각 노드로 수렴 */}
          {CONSTELLATION_NODES.map((node, i) => {
            const scatter = CEREMONY_SCATTER_OFFSETS[i];
            const finalLeft = (node.x / 100) * W - node.size / 2;
            const finalTop  = (node.y / 100) * H - node.size / 2;
            return (
              <motion.div
                key={node.id}
                className="absolute rounded-full"
                style={{
                  width: node.size,
                  height: node.size,
                  left: finalLeft,
                  top: finalTop,
                  background: "radial-gradient(circle, #fee500 30%, #f59e0b)",
                  boxShadow: "0 0 8px 2px rgba(254,229,0,0.65)",
                }}
                initial={{ x: scatter.dx, y: scatter.dy, scale: 0, opacity: 0 }}
                animate={{
                  x: 0, y: 0,
                  scale: [0, 0.7, 1.35, 1],
                  opacity: 1,
                }}
                transition={{ duration: 0.52, delay: 0.28 + i * 0.09, ease: "easeOut" }}
              />
            );
          })}
        </div>

        {/* 스킵 힌트 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.9 }}
          className="text-xs text-white/22"
        >
          화면을 탭하면 바로 시작할 수 있어요
        </motion.p>
      </div>
    </motion.div>
  );
}

// 저축 여정을 매일 보고 싶은 화면으로 만들기 위해 상품 상태와 감성 보상을 한 화면에 결합합니다.
function Dashboard({
  profile,
  selectedAmount,
}: {
  profile: UserProfile;
  selectedAmount: number | null;
}) {
  const [isFortuneOpen, setIsFortuneOpen] = useState(false);
  const [rewardStage, setRewardStage] = useState(INITIAL_SAVING_STEP);
  const [toastMessage, setToastMessage] = useState<string>(
    REWARD_STAGE_MESSAGES[INITIAL_SAVING_STEP],
  );
  const [showBanner, setShowBanner] = useState(true);
  const [showFinale, setShowFinale] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [shareFormat, setShareFormat] = useState<"story" | "feed">("story");
  const [showCancelDefense, setShowCancelDefense] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const activeNodes = CONSTELLATION_NODES.slice(0, rewardStage);
  const isConstellationStage = rewardStage >= 3;
  const isAuroraStage = rewardStage >= 5;
  const isGrandFinale = rewardStage >= 8;
  const curation = getFortuneCuration(profile.birth_info);
  const particleDensity = isConstellationStage ? MILKY_WAY_PARTICLES : MILKY_WAY_PARTICLES.slice(0, 28);
  const cardSurfaceClass = isAuroraStage
    ? "border-white/20 bg-gradient-to-br from-white/20 via-purple-200/15 to-cyan-200/10"
    : "border-white/10 bg-white/10";

  useEffect(() => {
    setToastMessage(REWARD_STAGE_MESSAGES[rewardStage as keyof typeof REWARD_STAGE_MESSAGES]);

    if (rewardStage === 8) {
      setShowFinale(true);
      const finaleTimer = window.setTimeout(() => setShowFinale(false), 1700);
      const reportTimer = window.setTimeout(() => setShowReport(true), 1850);

      return () => {
        window.clearTimeout(finaleTimer);
        window.clearTimeout(reportTimer);
      };
    }

    setShowFinale(false);
  }, [rewardStage]);

  useEffect(() => {
    setShowBanner(true);
    const bannerTimer = window.setTimeout(() => setShowBanner(false), 4000);
    return () => window.clearTimeout(bannerTimer);
  }, [toastMessage]);

  // 유저의 심리적 보상을 극대화하기 위해 저축 행동을 즉시 별 생성 애니메이션으로 연결합니다.
  const handleSave = () => {
    setRewardStage((currentStage) => Math.min(currentStage + 1, CONSTELLATION_NODES.length));
  };

  // 공유 이미지는 획득한 성취를 외부 유입 자산으로 전환하기 위한 장치입니다.
  const handleSaveShareCard = async () => {
    if (!shareCardRef.current) {
      return;
    }

    const dataUrl = await toPng(shareCardRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#070B1E",
    });
    const link = document.createElement("a");

    link.download = `constellation-savings-${shareFormat}.png`;
    link.href = dataUrl;
    link.click();
  };

  const maturityPrincipal = (selectedAmount ?? 0) * 180;
  const maturityInterest = Math.round(maturityPrincipal * ANNUAL_INTEREST_RATE * 0.5);

  // 만기 리포트는 Grand Finale 직후 노출해 감정적 피크에서 교차 판매 제안을 연결합니다.
  if (showReport) {
    return (
      <MaturityReport
        profile={profile}
        totalPrincipal={maturityPrincipal}
        interest={maturityInterest}
      />
    );
  }

  // 대시보드는 저축 행동을 별 생성 보상으로 변환해 유지율을 끌어올리는 핵심 화면입니다.
  return (
    <motion.main
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.34, ease: "easeOut" }}
      className={[
        "relative min-h-screen overflow-hidden px-5 py-6 text-white transition-colors duration-700",
        isAuroraStage
          ? "bg-[radial-gradient(circle_at_50%_-10%,rgba(160,231,229,0.22),transparent_34%),linear-gradient(180deg,#100A2D_0%,#071229_52%,#050816_100%)]"
          : "bg-[#070B1E]",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute right-[-96px] top-1/3 h-80 w-80 rounded-full bg-fuchsia-400/20 blur-3xl" />
        <div
          className={[
            "absolute inset-x-[-40%] top-28 h-40 rotate-[-18deg] bg-gradient-to-r from-transparent via-white/15 to-transparent blur-2xl",
            isConstellationStage ? "milky-way-rich" : "",
          ].join(" ")}
        />
        {isAuroraStage ? (
          <div className="aurora-ribbon absolute inset-x-[-25%] top-0 h-44 opacity-80" />
        ) : null}
        {particleDensity.map((particle) => (
          <motion.span
            key={particle.id}
            className={[
              "absolute rounded-full bg-white/70",
              isConstellationStage ? "h-1.5 w-1.5" : "h-1 w-1",
            ].join(" ")}
            style={{ left: `${particle.left}%`, top: `${particle.top}%` }}
            animate={{
              opacity: isConstellationStage ? [0.2, 1, 0.35] : [0.15, 0.95, 0.2],
              x: isConstellationStage ? [0, 24, 44] : [0, 16, 30],
              y: isConstellationStage ? [0, -14, -26] : [0, -8, -18],
              scale: isConstellationStage ? [0.7, 1.65, 0.9] : [0.7, 1.25, 0.8],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
        {isGrandFinale ? (
          <div className="grand-galaxy absolute left-1/2 top-[38%] h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80" />
        ) : null}
      </div>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-md flex-col gap-5">
        <header className={`rounded-[32px] p-5 shadow-2xl backdrop-blur transition duration-700 ${cardSurfaceClass}`}>
          <div className="mb-5 flex items-center justify-between">
            <span className="rounded-full bg-kakao-yellow px-4 py-2 text-sm font-black text-kakao-black">
              Step 2 · {rewardStage}단계
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/70">
              <Sparkles size={16} />
              별자리 대시보드
            </span>
          </div>
          <h1 className="text-3xl font-extrabold leading-tight">
            {profile.birth_info.name}님의
            <br />
            저축 별자리가 자라고 있어요
          </h1>
          <p className="mt-3 text-sm leading-6 text-white/65">
            {isGrandFinale
              ? "6개월의 별들이 하나의 거대한 은하계로 완성됐습니다."
              : "성공한 저축 회차가 별이 되고, 별들은 빛의 선으로 이어집니다."}
          </p>
        </header>

        <section
          className={[
            "relative h-[360px] overflow-hidden rounded-[32px] border p-4 shadow-2xl transition duration-700",
            isAuroraStage
              ? "border-cyan-200/20 bg-gradient-to-br from-slate-950/70 via-violet-950/50 to-cyan-950/30"
              : "border-white/10 bg-slate-950/55",
          ].join(" ")}
        >
          <div className="absolute left-5 top-5 z-10 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white/75 backdrop-blur">
            저축 성공 {rewardStage}회
          </div>

          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            {activeNodes.slice(1).map((node, index) => {
              const previousNode = activeNodes[index];

              return (
                <g key={`${previousNode.id}-${node.id}`}>
                  <motion.line
                    x1={previousNode.x}
                    y1={previousNode.y}
                    x2={node.x}
                    y2={node.y}
                    stroke="rgba(254, 229, 0, 0.7)"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                      duration: 0.9,
                      delay: 0.25 + index * 0.22,
                      ease: "easeOut",
                    }}
                  />
                  <motion.line
                    x1={previousNode.x}
                    y1={previousNode.y}
                    x2={node.x}
                    y2={node.y}
                    stroke="rgba(255, 255, 255, 0.85)"
                    strokeWidth="0.55"
                    strokeLinecap="round"
                    strokeDasharray="3 12"
                    animate={{ strokeDashoffset: [15, 0] }}
                    transition={{
                      duration: 1.4,
                      delay: index * 0.12,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </g>
              );
            })}
            {isConstellationStage
              ? CONSTELLATION_EXTRA_EDGES.map(([from, to]) => {
                  const fromNode = activeNodes[from];
                  const toNode = activeNodes[to];

                  if (!fromNode || !toNode) {
                    return null;
                  }

                  return (
                    <motion.line
                      key={`extra-${fromNode.id}-${toNode.id}`}
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke="rgba(165, 243, 252, 0.45)"
                      strokeWidth="0.45"
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{
                        duration: 1.1,
                        delay: 0.45 + from * 0.12,
                        ease: "easeOut",
                      }}
                    />
                  );
                })
              : null}
          </svg>

          {activeNodes.map((node, index) => {
            const isLatestNode = index === activeNodes.length - 1;

            return (
              <motion.div
                key={node.id}
                className={[
                  "absolute flex items-center justify-center rounded-full shadow-[0_0_22px_rgba(254,229,0,0.9)]",
                  isAuroraStage
                    ? "bg-gradient-to-br from-kakao-yellow via-pink-200 to-cyan-200"
                    : "bg-kakao-yellow",
                ].join(" ")}
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  width: node.size,
                  height: node.size,
                  marginLeft: -node.size / 2,
                  marginTop: -node.size / 2,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  boxShadow: [
                    "0 0 12px rgba(254,229,0,0.55)",
                    isAuroraStage
                      ? "0 0 38px rgba(165,243,252,1)"
                      : "0 0 30px rgba(254,229,0,1)",
                    "0 0 18px rgba(254,229,0,0.8)",
                  ],
                }}
                transition={{
                  scale: {
                    type: "spring",
                    stiffness: isLatestNode ? 520 : 420,
                    damping: isLatestNode ? 10 : 14,
                    mass: 0.7,
                    delay: index * 0.18,
                  },
                  opacity: { duration: 0.2, delay: index * 0.18 },
                  boxShadow: {
                    duration: 2.4,
                    repeat: Infinity,
                    repeatType: "mirror",
                    delay: index * 0.2,
                  },
                }}
              >
                <motion.span
                  className="absolute h-5 w-5 rounded-full border border-kakao-yellow/60"
                  animate={{ scale: [1, 1.8], opacity: [0.65, 0] }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    delay: index * 0.2,
                  }}
                />
              </motion.div>
            );
          })}
        </section>

        <motion.button
          type="button"
          onClick={handleSave}
          disabled={rewardStage >= CONSTELLATION_NODES.length}
          whileTap={{ scale: 0.97 }}
          className="rounded-[26px] bg-kakao-yellow px-5 py-4 text-lg font-black text-kakao-black shadow-[0_18px_45px_rgba(254,229,0,0.25)] transition disabled:bg-white/15 disabled:text-white/45"
        >
          {rewardStage >= CONSTELLATION_NODES.length
            ? "6개월 저축 여정 완료"
            : `${selectedAmount ? formatWon(selectedAmount) : "오늘 금액"} 저축하기`}
        </motion.button>

        <section className="grid grid-cols-2 gap-3">
          <div className={`rounded-3xl p-4 backdrop-blur transition duration-700 ${cardSurfaceClass}`}>
            <p className="text-xs font-bold text-white/55">오늘 저축 금액</p>
            <p className="mt-2 text-2xl font-black">
              {selectedAmount ? formatWon(selectedAmount) : "-"}
            </p>
          </div>
          <div className={`rounded-3xl p-4 backdrop-blur transition duration-700 ${cardSurfaceClass}`}>
            <p className="text-xs font-bold text-white/55">상품 조건</p>
            <p className="mt-2 flex items-center gap-2 text-lg font-black">
              <WalletCards size={20} />
              6개월 만기
            </p>
            <p className="mt-1 text-sm font-semibold text-kakao-yellow">
              자유적립식
            </p>
          </div>
        </section>

        <section
          className={[
            "mt-auto rounded-[28px] border p-5 text-kakao-black shadow-2xl transition duration-700",
            isAuroraStage
              ? "border-white/40 bg-gradient-to-br from-white via-pink-50 to-cyan-50"
              : "border-white/10 bg-white/95",
          ].join(" ")}
        >
          <button
            type="button"
            onClick={() => setIsFortuneOpen((current) => !current)}
            className="flex w-full items-center justify-between text-left"
          >
            <div>
              <p className="text-xs font-black text-neutral-500">
                오늘의 재물운 키워드
              </p>
              <p className="mt-1 text-xl font-black">{FORTUNE_KEYWORD}</p>
            </div>
            <motion.span
              animate={{ rotate: isFortuneOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="rounded-full bg-kakao-yellow p-2"
            >
              <ChevronDown size={20} />
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {isFortuneOpen ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <p className="mt-4 border-t border-neutral-100 pt-4 text-sm leading-6 text-neutral-600">
                  오늘은 큰 결정보다 반복 가능한 작은 저축이 재물운을 끌어올립니다.
                  정한 금액을 지키면 다음 별이 더 밝게 연결될 거예요.
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </section>

        <section className={`rounded-[32px] p-5 shadow-2xl backdrop-blur transition duration-700 ${cardSurfaceClass}`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-white/55">공유 카드</p>
              <h2 className="mt-1 text-xl font-black">오늘의 성좌 카드</h2>
            </div>
            <div className="flex rounded-full bg-white/10 p-1 text-xs font-black">
              <button
                type="button"
                onClick={() => setShareFormat("story")}
                className={`rounded-full px-3 py-2 transition ${shareFormat === "story" ? "bg-kakao-yellow text-kakao-black" : "text-white/65"}`}
              >
                9:16
              </button>
              <button
                type="button"
                onClick={() => setShareFormat("feed")}
                className={`rounded-full px-3 py-2 transition ${shareFormat === "feed" ? "bg-kakao-yellow text-kakao-black" : "text-white/65"}`}
              >
                1:1
              </button>
            </div>
          </div>

          <ShareCard
            ref={shareCardRef}
            format={shareFormat}
            name={profile.birth_info.name}
            rewardStage={rewardStage}
            selectedAmount={selectedAmount}
          />

          <button
            type="button"
            onClick={handleSaveShareCard}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-4 font-black text-kakao-black transition active:scale-[0.99]"
          >
            <Download size={19} />
            이미지로 저장하기
          </button>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 42 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.46, ease: "easeOut" }}
          className="relative mt-5 overflow-hidden rounded-[28px] border border-white/20 bg-white/10 p-5 text-white shadow-[0_18px_45px_rgba(7,11,30,0.22)] backdrop-blur-xl"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(254,229,0,0.22),transparent_28%),radial-gradient(circle_at_90%_20%,rgba(165,243,252,0.2),transparent_30%)]" />
          <div className="relative">
            {/* 헤더: 섹션 레이블 + 배지 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="mb-4 flex items-start justify-between gap-3"
            >
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-kakao-yellow/80">
                  Fortune-Based Curation
                </p>
                <h3 className="mt-1 text-xl font-black leading-tight">오늘의 기운에 딱 맞는 저축 추천</h3>
              </div>
              <div className="flex flex-col items-end gap-2">
                {/* 일주 배지 — KakaoBank pill 스타일 */}
                <span className="rounded-full border border-white/20 bg-white/[0.08] px-3 py-1 text-[13px] font-extrabold tracking-tight text-white">
                  {curation.dayPillar} 일주
                </span>
                {/* 케이스 배지 */}
                <span
                  className={[
                    "rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide",
                    curation.curationCase === "A"
                      ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25"
                      : curation.curationCase === "B"
                        ? "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/25"
                        : "bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/25",
                  ].join(" ")}
                >
                  {CURATION_CASES[curation.curationCase].label}
                </span>
              </div>
            </motion.div>

            {/* 재물운 문구 */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.38, delay: 0.22 }}
              className="mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-white/35">
                오늘의 재물운
              </p>
              <p className="text-sm font-semibold leading-6 text-white/85">
                {curation.fortune}
              </p>
            </motion.div>

            {/* 큐레이션 메시지 */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.32 }}
              className="mb-4 text-sm leading-6 text-white/55"
            >
              {curation.message}
            </motion.p>

            {/* 추천 상품 카드 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.38, delay: 0.42 }}
              className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">추천 상품</p>
              <div className="mt-2 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-xl font-black leading-tight">{curation.title}</p>
                  {/* 금리 — 카카오 시그니처 옐로우 강조 */}
                  <p className="mt-1.5 text-base font-black text-kakao-yellow">
                    {curation.rate}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-white/45">
                    {curation.benefit}
                  </p>
                </div>
                <ShieldCheck className="mt-0.5 shrink-0 text-kakao-yellow" size={28} />
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.52 }}
              type="button"
              onClick={() => setShowProductModal(true)}
              className="mt-4 w-full rounded-2xl bg-kakao-yellow px-4 py-4 font-black text-kakao-black transition active:scale-[0.99]"
            >
              상품 상세 보기
            </motion.button>
          </div>
        </motion.section>

        <button
          type="button"
          onClick={() => setShowCancelDefense(true)}
          className="pb-4 pt-1 text-center text-xs font-bold text-white/30 underline-offset-4 transition hover:text-white/55 active:scale-[0.99]"
        >
          그래도 중도 해지를 검토할래요
        </button>
      </section>

      <PortfolioTimeMachine
        rewardStage={rewardStage}
        onSelectStage={(stage) => {
          setShowReport(false);
          setRewardStage(stage);
        }}
      />

      <AnimatePresence>
        {showBanner ? (
          <motion.div
            key={toastMessage}
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.5 } }}
            transition={{ duration: 0.28 }}
            className="fixed inset-x-5 top-5 z-40 mx-auto max-w-md rounded-3xl border border-white/20 bg-white/90 p-4 text-sm font-bold leading-6 text-kakao-black shadow-2xl backdrop-blur"
          >
            {toastMessage}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showFinale ? (
          <motion.div
            className="pointer-events-none fixed inset-0 z-50 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showCancelDefense ? (
          <CancelDefenseModal
            rewardStage={rewardStage}
            onClose={() => setShowCancelDefense(false)}
          />
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {showProductModal ? (
          <ProductBottomSheet curation={curation} onClose={() => setShowProductModal(false)} />
        ) : null}
      </AnimatePresence>
    </motion.main>
  );
}

// 면접관이 전체 보상 플랜을 30초 안에 훑어볼 수 있도록 배포 환경에서도 데모 컨트롤을 유지합니다.
function PortfolioTimeMachine({
  rewardStage,
  onSelectStage,
}: {
  rewardStage: number;
  onSelectStage: (stage: number) => void;
}) {
  return (
    <aside className="fixed right-3 top-3 z-30 rounded-[24px] border border-white/15 bg-slate-950/75 p-3 shadow-2xl backdrop-blur-xl">
      <div className="mb-2 flex items-center gap-2 px-1">
        <Sparkles size={14} className="text-kakao-yellow" />
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/70">
          Time Machine
        </p>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {Array.from({ length: 8 }, (_, index) => index + 1).map((stage) => (
          <button
            key={stage}
            type="button"
            onClick={() => onSelectStage(stage)}
            className={[
              "h-9 w-9 rounded-2xl text-xs font-black transition active:scale-95",
              rewardStage === stage
                ? "bg-kakao-yellow text-kakao-black shadow-[0_0_20px_rgba(254,229,0,0.45)]"
                : "bg-white/10 text-white/75 hover:bg-white/20",
            ].join(" ")}
          >
            {stage}
          </button>
        ))}
      </div>
    </aside>
  );
}

const ShareCard = forwardRef<
  HTMLDivElement,
  {
    format: "story" | "feed";
    name: string;
    rewardStage: number;
    selectedAmount: number | null;
  }
>(function ShareCard({ format, name, rewardStage, selectedAmount }, ref) {
  const activeNodes = CONSTELLATION_NODES.slice(0, rewardStage);

  // 공유 카드는 유저 성취를 외부 확산 가능한 카드 뉴스 자산으로 바꾸는 바이럴 장치입니다.
  return (
    <div
      ref={ref}
      className={[
        "relative mx-auto overflow-hidden rounded-[32px] bg-[#070B1E] p-6 text-white shadow-2xl",
        format === "story" ? "aspect-[9/16] w-full max-w-[260px]" : "aspect-square w-full",
      ].join(" ")}
    >
      <div className="absolute inset-0">
        <div className="absolute -left-10 top-10 h-44 w-44 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute bottom-10 right-[-40px] h-52 w-52 rounded-full bg-fuchsia-400/25 blur-3xl" />
        <div className="absolute inset-x-[-30%] top-1/3 h-28 rotate-[-18deg] bg-gradient-to-r from-transparent via-white/20 to-transparent blur-2xl" />
      </div>

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-center justify-between text-xs font-black">
          <span className="rounded-full bg-kakao-yellow px-3 py-1.5 text-kakao-black">
            별자리 적금
          </span>
          <span>{rewardStage}/8 단계</span>
        </div>

        <div className="relative my-auto h-48">
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
            {activeNodes.slice(1).map((node, index) => {
              const previousNode = activeNodes[index];

              return (
                <line
                  key={`${previousNode.id}-${node.id}`}
                  x1={previousNode.x}
                  y1={previousNode.y}
                  x2={node.x}
                  y2={node.y}
                  stroke="rgba(254, 229, 0, 0.75)"
                  strokeWidth="0.9"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
          {activeNodes.map((node) => (
            <span
              key={node.id}
              className="absolute rounded-full bg-kakao-yellow shadow-[0_0_22px_rgba(254,229,0,0.9)]"
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                width: node.size + 4,
                height: node.size + 4,
                marginLeft: -(node.size + 4) / 2,
                marginTop: -(node.size + 4) / 2,
              }}
            />
          ))}
        </div>

        <div>
          <p className="text-sm font-bold text-white/60">오늘의 재물운 키워드</p>
          <h3 className="mt-2 text-2xl font-black leading-tight">{FORTUNE_KEYWORD}</h3>
          <div className="mt-5 rounded-3xl bg-white/12 p-4 backdrop-blur">
            <p className="text-xs font-bold text-white/55">{name}님의 오늘 저축</p>
            <p className="mt-1 text-2xl font-black">
              {selectedAmount ? formatWon(selectedAmount) : "행운 금액 진행 중"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

function CancelDefenseModal({
  rewardStage,
  onClose,
}: {
  rewardStage: number;
  onClose: () => void;
}) {
  const activeNodes = CONSTELLATION_NODES.slice(0, rewardStage);
  const nextStage = Math.min(rewardStage + 1, CONSTELLATION_NODES.length);

  // 해지 방어 팝업은 완성 직전의 손실 회피 심리를 활용해 이탈 의도를 낮춥니다.
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.section
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-sm rounded-[32px] bg-white p-5 text-kakao-black shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black text-neutral-500">해지 전 확인</p>
            <h2 className="mt-1 text-2xl font-black leading-tight">
              조금만 더 힘내면
              <br />
              다음 성좌가 완성돼요!
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-neutral-100 p-2 transition active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative my-5 h-52 overflow-hidden rounded-[28px] bg-[#070B1E]">
          <div className="absolute inset-x-[-30%] top-1/3 h-24 rotate-[-18deg] bg-gradient-to-r from-transparent via-white/20 to-transparent blur-2xl" />
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
            {activeNodes.slice(1).map((node, index) => {
              const previousNode = activeNodes[index];

              return (
                <line
                  key={`${previousNode.id}-${node.id}`}
                  x1={previousNode.x}
                  y1={previousNode.y}
                  x2={node.x}
                  y2={node.y}
                  stroke="rgba(254, 229, 0, 0.7)"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
          {activeNodes.map((node) => (
            <span
              key={node.id}
              className="absolute rounded-full bg-kakao-yellow shadow-[0_0_22px_rgba(254,229,0,0.9)]"
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                width: node.size + 4,
                height: node.size + 4,
                marginLeft: -(node.size + 4) / 2,
                marginTop: -(node.size + 4) / 2,
              }}
            />
          ))}
        </div>

        <p className="text-sm leading-6 text-neutral-600">
          현재 {rewardStage}단계까지 별자리가 완성됐어요. 다음 저축 한 번이면
          {nextStage}단계 보상이 열리고, 유지율 보상 그래프에도 긍정적인 기록이 남습니다.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-2xl bg-kakao-yellow px-4 py-4 font-black transition active:scale-[0.99]"
        >
          계속 이어가기
        </button>
      </motion.section>
    </motion.div>
  );
}

function AdminDashboard({ onBack }: { onBack: () => void }) {
  const totalShareClicks = VIRAL_CHANNELS.reduce((sum, channel) => sum + channel.clicks, 0);
  const weightedConversion =
    VIRAL_CHANNELS.reduce((sum, channel) => sum + channel.clicks * channel.conversion, 0) /
    totalShareClicks;
  const kFactor = 1.32;
  const crossSellCtr = 18.6;

  // Admin View는 MVP 이후 PM이 추적해야 할 유지율, 바이럴, 교차 판매 지표를 한 화면에 모읍니다.
  return (
    <motion.main
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      className="min-h-screen bg-[#F7F8FA] px-5 py-6 text-kakao-black"
    >
      <section className="mx-auto flex w-full max-w-md flex-col gap-5">
        <header className="rounded-[32px] bg-kakao-black p-6 text-white shadow-soft">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-kakao-yellow px-4 py-2 text-sm font-black text-kakao-black">
              Admin View
            </span>
            <button
              type="button"
              onClick={onBack}
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold transition active:scale-95"
            >
              돌아가기
            </button>
          </div>
          <h1 className="mt-5 text-3xl font-black leading-tight">
            별자리 적금
            <br />
            성공 지표 대시보드
          </h1>
          <p className="mt-3 text-sm leading-6 text-white/65">
            유지율, 바이럴 확산, 교차 판매 전환을 MVP 단계에서 한눈에 검증합니다.
          </p>
        </header>

        <section className="rounded-[28px] bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <BarChart3 size={20} />
            <h2 className="text-lg font-black">North Star Metric</h2>
          </div>
          <p className="mt-1 text-sm text-neutral-500">가입 기간별 상품 유지율</p>
          <div className="mt-5 space-y-4">
            {RETENTION_METRICS.map((metric) => (
              <div key={metric.label}>
                <div className="mb-2 flex justify-between text-sm font-bold">
                  <span>{metric.label} 유지율</span>
                  <span>{metric.value}%</span>
                </div>
                <div className="h-4 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className={`h-full rounded-full ${metric.color}`}
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black">K-Factor</h2>
              <p className="mt-1 text-sm text-neutral-500">공유 카드 기반 바이럴 지표</p>
            </div>
            <div className="rounded-2xl bg-kakao-yellow px-4 py-3 text-right">
              <p className="text-xs font-black">K</p>
              <p className="text-2xl font-black">{kFactor}</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-kakao-gray p-4">
              <p className="text-xs font-bold text-neutral-500">공유 클릭</p>
              <p className="mt-1 text-2xl font-black">{totalShareClicks.toLocaleString("ko-KR")}</p>
            </div>
            <div className="rounded-2xl bg-kakao-gray p-4">
              <p className="text-xs font-bold text-neutral-500">가중 전환율</p>
              <p className="mt-1 text-2xl font-black">{weightedConversion.toFixed(1)}%</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {VIRAL_CHANNELS.map((channel) => (
              <div key={channel.channel} className="rounded-2xl border border-neutral-100 p-3">
                <div className="flex justify-between text-sm font-bold">
                  <span>{channel.channel}</span>
                  <span>{channel.conversion}% CVR</span>
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  {channel.clicks.toLocaleString("ko-KR")} clicks
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-kakao-yellow p-3">
              <TrendingUp size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black">교차 판매 전환율</h2>
              <p className="mt-1 text-sm text-neutral-500">소액 투자 제안 CTR</p>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-5">
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-conic-gradient">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-2xl font-black">
                {crossSellCtr}%
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm leading-6 text-neutral-600">
                만기 리포트 하단의 운세 맥락형 오퍼가 일반 배너 대비 높은 의도 신호를 만듭니다.
              </p>
              <div className="mt-3 rounded-2xl bg-kakao-gray p-3 text-sm font-bold">
                목표 CTR 15% 대비 +3.6%p
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 text-amber-600" size={22} />
            <div>
              <h2 className="text-lg font-black">Counter Metric</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-700">
                중도 해지 의도 발생 시 별자리 진행 상태를 보여주는 해지 방어 팝업으로
                이탈률과 불완전판매 리스크를 함께 모니터링합니다.
              </p>
            </div>
          </div>
        </section>
      </section>
    </motion.main>
  );
}

function MaturityReport({
  profile,
  totalPrincipal,
  interest,
}: {
  profile: UserProfile;
  totalPrincipal: number;
  interest: number;
}) {
  const totalAmount = totalPrincipal + interest;

  // 만기 리포트는 6개월 성취를 숫자와 스킨 보상으로 동시에 증명하는 포트폴리오 엔딩입니다.
  return (
    <motion.main
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.34, ease: "easeOut" }}
      className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_50%_0%,rgba(254,229,0,0.24),transparent_32%),linear-gradient(180deg,#120B2E_0%,#070B1E_48%,#03040B_100%)] px-5 py-6 text-white"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="grand-galaxy absolute left-1/2 top-[20%] h-96 w-96 -translate-x-1/2 rounded-full opacity-85" />
        <div className="aurora-ribbon absolute inset-x-[-25%] top-0 h-44 opacity-80" />
      </div>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-md flex-col gap-5">
        <header className="rounded-[32px] border border-kakao-yellow/30 bg-white/10 p-6 shadow-2xl backdrop-blur">
          <span className="inline-flex rounded-full bg-kakao-yellow px-4 py-2 text-sm font-black text-kakao-black">
            최종 행운 리포트
          </span>
          <h1 className="mt-5 text-3xl font-black leading-tight">
            {profile.birth_info.name}님,
            <br />
            당신은 정말 대단한 사람이에요!
          </h1>
          <p className="mt-3 text-sm leading-6 text-white/65">
            6개월 동안 이어온 저축의 별들이 하나의 은하계로 완성됐습니다.
          </p>
        </header>

        <section className="rounded-[32px] border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur">
          <div className="relative h-64 overflow-hidden rounded-[28px] bg-slate-950/70">
            <div className="grand-galaxy absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full" />
            {CONSTELLATION_NODES.map((node) => (
              <span
                key={node.id}
                className="absolute rounded-full bg-kakao-yellow shadow-[0_0_24px_rgba(254,229,0,0.95)]"
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  width: node.size + 5,
                  height: node.size + 5,
                  marginLeft: -(node.size + 5) / 2,
                  marginTop: -(node.size + 5) / 2,
                }}
              />
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-xs font-bold text-white/55">6개월 총 저축</p>
            <p className="mt-2 text-2xl font-black">{formatWon(totalPrincipal)}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-xs font-bold text-white/55">예상 이자</p>
            <p className="mt-2 text-2xl font-black">{formatWon(interest)}</p>
          </div>
        </section>

        <section className="rounded-[32px] border border-kakao-yellow/35 bg-gradient-to-br from-kakao-yellow via-yellow-200 to-amber-500 p-5 text-kakao-black shadow-[0_24px_70px_rgba(254,229,0,0.28)]">
          <div className="flex items-center gap-4">
            <div className="legendary-skin flex h-20 w-20 shrink-0 items-center justify-center rounded-full">
              <Gift size={34} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em]">Legendary Skin</p>
              <h2 className="mt-1 text-2xl font-black">전설의 황금 스킨</h2>
              <p className="mt-1 text-sm font-bold">총 {formatWon(totalAmount)}의 행운을 완성했어요.</p>
            </div>
          </div>
        </section>

        <section className="mt-auto rounded-[32px] border border-white/10 bg-white/95 p-5 text-kakao-black shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-kakao-yellow p-3">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-xs font-black text-neutral-500">개인화 오퍼</p>
              <h2 className="mt-1 text-xl font-black">
                재물운이 상승세인 당신을 위한 소액 투자 제안
              </h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600">
                완성한 저축 루틴을 바탕으로, 매일 1천원부터 시작하는 분산 투자 포트폴리오를 추천해요.
              </p>
            </div>
          </div>
        </section>
      </section>
    </motion.main>
  );
}
