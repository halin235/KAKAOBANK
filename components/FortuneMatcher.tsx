"use client";

import { motion } from "framer-motion";
import { Shield, TrendingUp, X } from "lucide-react";
import type { CrossSellRecommendation } from "../constants/recommendations";

type FortuneMatcherProps = {
  recommendation: CrossSellRecommendation;
  onClose: () => void;
  onPrimaryAction: () => void;
};

export function FortuneMatcher({
  recommendation,
  onClose,
  onPrimaryAction,
}: FortuneMatcherProps) {
  const Icon =
    recommendation.partner === "kakaopay_insurance" ? Shield : TrendingUp;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cross-sell-title"
      className="fixed inset-0 z-[60] flex items-end bg-black/55 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.section
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 34, mass: 0.92 }}
        className="relative w-full rounded-t-[28px] bg-[#F7F8FA] pb-8 text-kakao-black shadow-[0_-12px_48px_rgba(0,0,0,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pb-2 pt-3">
          <div className="h-1 w-10 rounded-full bg-neutral-300" />
        </div>

        <div className="relative mx-5 rounded-[24px] bg-white p-5 shadow-soft ring-1 ring-black/[0.04]">
          <span className="absolute right-4 top-4 rounded-full bg-kakao-yellow px-3 py-1 text-[11px] font-black text-kakao-black shadow-sm">
            {recommendation.fortune_badge}
          </span>

          <div className="flex items-start gap-4 pr-16">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-kakao-yellow/90 text-kakao-black shadow-inner">
              <Icon size={28} strokeWidth={2.2} />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-neutral-400">
                오늘의 운세 맞춤 추천
              </p>
              <h2 id="cross-sell-title" className="mt-1 text-xl font-black leading-snug">
                {recommendation.productTitle}
              </h2>
              <p className="mt-1 text-xs font-bold text-neutral-500">{recommendation.subtitle}</p>
            </div>
          </div>

          <p className="mt-4 text-sm font-semibold leading-relaxed text-neutral-700">
            {recommendation.personalized_copy}
          </p>

          {recommendation.deposit_rate_bonus_p ? (
            <div className="mt-3 rounded-2xl border border-kakao-yellow/50 bg-[#FFFBE6] px-4 py-3 text-xs font-bold text-yellow-800 ring-1 ring-kakao-yellow/35">
              가입 시 적금 우대금리 최대{" "}
              <span className="font-black">
                +{(recommendation.deposit_rate_bonus_p * 100).toFixed(1)}%p
              </span>
              까지 받을 수 있어요
            </div>
          ) : null}
        </div>

        <div className="mx-5 mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={onPrimaryAction}
            className="w-full rounded-2xl bg-kakao-yellow py-4 text-base font-black text-kakao-black shadow-soft transition active:scale-[0.99]"
          >
            {recommendation.action_label}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 text-center text-sm font-bold text-neutral-400 transition hover:text-neutral-600"
          >
            다음에 할게요
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-6 rounded-full bg-white/90 p-2 shadow-sm ring-1 ring-black/5 transition hover:bg-white"
          aria-label="닫기"
        >
          <X size={18} />
        </button>
      </motion.section>
    </motion.div>
  );
}
