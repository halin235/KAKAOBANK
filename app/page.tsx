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
const ANNUAL_INTEREST_RATE = 0.018;

const DEMO_PROFILE = {
  name: "하린",
  birthDate: "1995-07-07",
  birthTime: "07:30",
  gender: "not_specified",
  amount: 33333,
};

const SAJU_CURATION_RULES = [
  {
    day_pillar: "임진",
    monthly_flow: "이동수",
    risk_signal: "사고",
    recommendation_code: "oneday-insurance",
    productName: "원데이 안심 보험",
    benefit: "룰렛 당첨 기념 첫날 보험료 50% 캐시백",
  },
  {
    day_pillar: "갑오",
    monthly_flow: "지출 변동",
    risk_signal: "충동 소비",
    recommendation_code: "spending-guard",
    productName: "소비 알림 세이프박스",
    benefit: "이번 달 변동 지출 리포트 무료 제공",
  },
  {
    day_pillar: "정유",
    monthly_flow: "관계 확장",
    risk_signal: "경조사비",
    recommendation_code: "event-savings",
    productName: "경조사 준비 저금통",
    benefit: "목표 금액 자동 쪼개기 설정 제공",
  },
  {
    day_pillar: "계묘",
    monthly_flow: "재정 정리",
    risk_signal: "고정비 누수",
    recommendation_code: "fixed-cost-check",
    productName: "고정비 점검 리포트",
    benefit: "구독료/통신비 절감 항목 자동 분석",
  },
];

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

const getSajuSeed = (birthDate: string) =>
  birthDate
    .replaceAll("-", "")
    .split("")
    .reduce((sum, value) => sum + Number(value), 0);

const getSajuData = (birthDate: string): NonNullable<UserProfile["birth_info"]["saju"]> => {
  const rule = SAJU_CURATION_RULES[getSajuSeed(birthDate) % SAJU_CURATION_RULES.length];

  return {
    day_pillar: rule.day_pillar,
    monthly_flow: rule.monthly_flow,
    risk_signal: rule.risk_signal,
    recommendation_code: rule.recommendation_code,
  };
};

const getFortuneCuration = (birthInfo: UserProfile["birth_info"]) => {
  const saju = birthInfo.saju ?? getSajuData(birthInfo.birth_date);
  const rule =
    SAJU_CURATION_RULES.find((item) => item.recommendation_code === saju.recommendation_code) ??
    SAJU_CURATION_RULES[0];

  return {
    title: rule.productName,
    benefit: rule.benefit,
    message: `${birthInfo.name}님(${saju.day_pillar} 일주), 이번 달은 ${saju.monthly_flow}가 많아 ${saju.risk_signal}를 조심해야 하네요. 룰렛 당첨 기념으로 ${rule.productName} 혜택을 확인해보세요.`,
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

    setProfile(joinedProfile);
  };

  if (showAdmin) {
    return <AdminDashboard onBack={() => setShowAdmin(false)} />;
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
                      <p className="mt-1 text-2xl font-black">{formatWon(selectedAmount)}</p>
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
            <p className="mt-3 text-center text-sm font-semibold text-white/65">
              {fortuneMessage || (selectedAmount ? `하린님의 오늘 행운 금액: ${formatWon(selectedAmount)}` : "룰렛을 돌려보세요")}
            </p>
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

// 실제 이동 대신 팝업으로 처리해 포트폴리오 데모 안에서 금융 상품 연결 의도를 보여줍니다.
function ProductDetailModal({
  curation,
  onClose,
}: {
  curation: ReturnType<typeof getFortuneCuration>;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-5 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.section
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-sm overflow-hidden rounded-[32px] bg-white text-kakao-black shadow-2xl"
      >
        <div className="bg-[#070B1E] p-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-kakao-yellow">
                Demo Product Detail
              </p>
              <h2 className="mt-2 text-2xl font-black">{curation.title}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/10 p-2 transition active:scale-95"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-5">
          <p className="text-sm leading-6 text-neutral-600">{curation.message}</p>
          <div className="mt-4 rounded-3xl bg-kakao-gray p-4">
            <p className="text-xs font-black text-neutral-500">포트폴리오 데모 혜택</p>
            <p className="mt-2 text-lg font-black">{curation.benefit}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full rounded-2xl bg-kakao-yellow px-4 py-4 font-black transition active:scale-[0.99]"
          >
            데모 확인 완료
          </button>
        </div>
      </motion.section>
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
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.46, ease: "easeOut" }}
          className="relative mt-5 overflow-hidden rounded-[28px] border border-white/20 bg-white/10 p-5 text-white shadow-[0_18px_45px_rgba(7,11,30,0.22)] backdrop-blur-xl"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(254,229,0,0.22),transparent_28%),radial-gradient(circle_at_90%_20%,rgba(165,243,252,0.2),transparent_30%)]" />
          <div className="relative">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-kakao-yellow">
                  Fortune-Based Curation
                </p>
                <h3 className="mt-1 text-xl font-black">사주 기반 금융 큐레이션</h3>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white/70">
                {profile.birth_info.saju?.day_pillar ?? getSajuData(profile.birth_info.birth_date).day_pillar} 일주
              </span>
            </div>

            <p className="text-sm leading-6 text-white/75">{curation.message}</p>

            <div className="mt-4 rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs font-bold text-white/55">추천 상품</p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <div>
                  <p className="text-2xl font-black">{curation.title}</p>
                  <p className="mt-1 text-sm font-semibold text-kakao-yellow">
                    {curation.benefit}
                  </p>
                </div>
                <ShieldCheck className="shrink-0 text-kakao-yellow" size={30} />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowProductModal(true)}
              className="mt-4 w-full rounded-2xl bg-kakao-yellow px-4 py-4 font-black text-kakao-black transition active:scale-[0.99]"
            >
              상품 상세 보기
            </button>
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

      <AnimatePresence mode="wait">
        <motion.div
          key={toastMessage}
          initial={{ opacity: 0, y: -16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.28 }}
          className="fixed inset-x-5 top-5 z-40 mx-auto max-w-md rounded-3xl border border-white/20 bg-white/90 p-4 text-sm font-bold leading-6 text-kakao-black shadow-2xl backdrop-blur"
        >
          {toastMessage}
        </motion.div>
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
          <ProductDetailModal curation={curation} onClose={() => setShowProductModal(false)} />
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
