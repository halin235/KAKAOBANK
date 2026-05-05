"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, CircleHelp } from "lucide-react";
import {
  BASE_ANNUAL_RATE,
  CALCULATION_DISCLOSURE_SUBTITLE,
  FOUR_WEEK_STREAK_BONUS_RATE,
  LUCKY_DAY_BONUS_RATE,
  PRODUCT_TERM_DAYS,
  computeRealtimeMaturityPrediction,
} from "../utils/financeCalculator";
import { formatAppliedAnnualRateLine } from "../utils/stringHelper";
import { CountUpWon } from "./CountUpWon";

type SimulatorResult = ReturnType<typeof computeRealtimeMaturityPrediction>;

function DetailBonusList({ luckyWeekdayLabel }: { luckyWeekdayLabel: string }) {
  const items = [
    `행운 요일(${luckyWeekdayLabel}요일) 입금 시 +${(LUCKY_DAY_BONUS_RATE * 100).toFixed(1)}%p`,
    `4주 연속 저축 성공 시 +${(FOUR_WEEK_STREAK_BONUS_RATE * 100).toFixed(1)}%p`,
  ];

  return (
    <ul className="space-y-2">
      {items.map((title) => (
        <li key={title} className="flex items-start gap-2 text-xs font-bold leading-snug text-white/80">
          <span
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-kakao-yellow bg-kakao-yellow text-kakao-black"
            aria-hidden
          >
            <Check className="h-3.5 w-3.5 stroke-[3]" />
          </span>
          <span>{title}</span>
        </li>
      ))}
    </ul>
  );
}

type MaturitySimulatorProps = {
  maturitySimulator: SimulatorResult;
  predictorProgressPct: number;
  meetsFloorPositive: boolean;
  dailyForProjection: number;
  maturityPrincipal: number;
  maturityInterest: number;
  luckyWeekdayLabel: string;
  firstRoundDepositAmount: number | null;
  minDepositLimit: number;
  todayInputWon: number;
  formatWon: (amount: number) => string;
};

export function MaturitySimulator({
  maturitySimulator,
  predictorProgressPct,
  meetsFloorPositive,
  dailyForProjection,
  maturityPrincipal,
  maturityInterest,
  luckyWeekdayLabel,
  firstRoundDepositAmount,
  minDepositLimit,
  todayInputWon,
  formatWon,
}: MaturitySimulatorProps) {
  const [showDetail, setShowDetail] = useState(false);

  const rateLine = formatAppliedAnnualRateLine(
    maturitySimulator.effectiveAnnualRate,
    BASE_ANNUAL_RATE,
    maturitySimulator.accruedPreferredBonusRate,
  );

  const maturityKey = maturitySimulator.projectedMaturityTotalPretax;

  return (
    <section
      className={`rounded-[28px] border border-white/15 p-5 backdrop-blur transition duration-700 ${
        meetsFloorPositive ? "ring-1 ring-emerald-400/25" : ""
      } bg-white/[0.07]`}
    >
      <p className="text-[10px] font-black uppercase tracking-widest text-kakao-yellow/90">
        만기 달성 예측 · 실시간
      </p>
      <p className="mt-2 text-xs font-semibold text-white/70">{rateLine}</p>

      <div className="mt-6 flex flex-col items-center text-center">
        <div className="flex items-center justify-center gap-1.5">
          <p className="text-[11px] font-bold text-white/45">예상 만기 수령액 · 세전</p>
          <button
            type="button"
            aria-expanded={showDetail}
            aria-label="예상 수령액 계산 안내"
            onClick={() => setShowDetail((v) => !v)}
            className="rounded-full p-0.5 text-kakao-yellow transition hover:bg-white/10"
          >
            <CircleHelp size={16} strokeWidth={2.2} />
          </button>
        </div>
        <p
          className={[
            "mt-2 text-4xl font-black tabular-nums tracking-tight sm:text-[2.65rem]",
            meetsFloorPositive
              ? "text-emerald-300 drop-shadow-[0_0_24px_rgba(110,231,183,0.35)]"
              : "text-kakao-yellow",
          ].join(" ")}
        >
          <CountUpWon key={maturityKey} target={maturityKey} duration={580} />
        </p>
      </div>

      <div className="mt-6">
        <div className="mb-1.5 flex justify-between text-[10px] font-bold text-white/40">
          <span>하한선만 넣을 때</span>
          <span>목표 가속</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-kakao-yellow via-emerald-300 to-cyan-300"
            initial={false}
            animate={{ width: `${predictorProgressPct}%` }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          />
        </div>
      </div>

      {showDetail ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0 }}
          className="mt-5 space-y-4 overflow-hidden rounded-2xl border border-white/10 bg-black/25 px-4 py-4 text-left"
        >
          <p className="text-[11px] leading-relaxed text-white/55">{CALCULATION_DISCLOSURE_SUBTITLE}</p>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">원금 구성</p>
            <ul className="mt-2 space-y-1 text-[11px] leading-relaxed text-white/65">
              <li>· 과거 납입 추정: {formatWon(maturitySimulator.pastPrincipal)}</li>
              <li>· 오늘 입력: {formatWon(Math.max(0, todayInputWon))}</li>
              <li>· 남은 회차 × 하한선: {formatWon(maturitySimulator.futurePrincipal)}</li>
            </ul>
          </div>
          <div className="border-t border-white/10 pt-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">균등 적립 참고</p>
            <p className="mt-1 text-[11px] font-semibold text-white/55">
              매일 {formatWon(dailyForProjection)} × {PRODUCT_TERM_DAYS}일 · 우대 충족 가정
            </p>
            <div className="mt-2">
              <DetailBonusList luckyWeekdayLabel={luckyWeekdayLabel} />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-center text-[11px]">
              <span className="font-bold text-white/45">예상 원금</span>
              <span className="font-black text-white">{formatWon(maturityPrincipal)}</span>
              <span className="text-white/25">+</span>
              <span className="font-bold text-kakao-yellow/70">이자</span>
              <span className="font-black text-kakao-yellow">{formatWon(maturityInterest)}</span>
            </div>
            <p className="mt-3 text-center text-[10px] font-bold text-white/35">
              매회 최소 {(firstRoundDepositAmount ?? minDepositLimit).toLocaleString("ko-KR")}원 이상 저축 기준
            </p>
          </div>
        </motion.div>
      ) : null}
    </section>
  );
}
