/**
 * 별자리 적금 — 금융 연산 레이어 (PRD 핵심)
 *
 * - 적립: 매영업일 동일 금액 적립 가정, 만기 일수 `PRODUCT_TERM_DAYS`(183일).
 * - 금리: 기본금리 `BASE_ANNUAL_RATE` + 성좌 진행 단계에 따른 우대 구간 `achievedPreferredBonusRate`
 *   (게이미피케이션과 연동된 「사주 기반 우대」 UX의 수치 표현).
 * - 만기 예측 `computeRealtimeMaturityPrediction`: 과거·오늘·미래 원금 시나리오 후 단리 이자 합산.
 * - 세전 금액만 계산; 세후는 UI에서 별도 안내.
 */

/** 상품 만기 일수 — 예측기·안내 문구 공통 기준 */
export const PRODUCT_TERM_DAYS = 183;

export const MAX_CONSTELLATION_STAGES = 8;

export const BASE_ANNUAL_RATE = 0.035;
export const MAX_PREFERRED_BONUS_RATE = 0.01;
export const MAX_ANNUAL_RATE = BASE_ANNUAL_RATE + MAX_PREFERRED_BONUS_RATE;
export const LUCKY_DAY_BONUS_RATE = 0.005;
export const FOUR_WEEK_STREAK_BONUS_RATE = 0.005;

export const RATE_SUMMARY_LABEL = `최대 연 ${(MAX_ANNUAL_RATE * 100).toFixed(1)}% (기본 ${(BASE_ANNUAL_RATE * 100).toFixed(1)}% + 우대 최대 ${(MAX_PREFERRED_BONUS_RATE * 100).toFixed(1)}%p)`;

/** 계산기 하단 신뢰도 안내용 */
export const CALCULATION_DISCLOSURE_SUBTITLE =
  "단리 계산, 183일 기준, 우대 금리 모두 충족 시";

export function formatMinDepositFloorWarning(minDepositLimit: number): string {
  return `최초 설정한 행운 금액(${minDepositLimit.toLocaleString("ko-KR")}원) 이상 저축해야 안내된 이자를 100% 받을 수 있습니다.`;
}

/** 일적립 단리 이자: 일납입 × (연금리/365) × n(n-1)/2 */
export function calcInstallmentInterestPretax(
  dailyAmount: number,
  days: number,
  annualRate: number,
): number {
  if (dailyAmount <= 0 || days < 2) return 0;
  return Math.round(dailyAmount * (annualRate / 365) * ((days * (days - 1)) / 2));
}

/** 매일 동일 금액 적립 가정 만기 원금·이자(세전) */
export function calcDailySavings(
  dailyAmount: number,
  annualRate: number = MAX_ANNUAL_RATE,
) {
  const principal = Math.round(dailyAmount * PRODUCT_TERM_DAYS);
  const interest = calcInstallmentInterestPretax(
    dailyAmount,
    PRODUCT_TERM_DAYS,
    annualRate,
  );
  return { principal, interest };
}

export type MaturityBreakdownPretax = {
  principalPretax: number;
  interestPretax: number;
  /** 원 단위: 항상 principalPretax + interestPretax (표시 합계 불일치 방지) */
  totalPretax: number;
};

/** 만기 리포트·요약용 세전 원금/이자/합계 (1원 단위 정합 보장) */
export function calcMaturityBreakdownPretax(
  dailyAmount: number,
  annualRate: number = MAX_ANNUAL_RATE,
): MaturityBreakdownPretax {
  const { principal, interest } = calcDailySavings(dailyAmount, annualRate);
  const totalPretax = principal + interest;
  return { principalPretax: principal, interestPretax: interest, totalPretax };
}

/** 진행 회차에 따른 경과 일수(균등 매핑, 리텐션·통계용) */
export function estimateLinkedDaysFromStage(rewardStage: number): number {
  return Math.max(
    1,
    Math.min(
      PRODUCT_TERM_DAYS,
      Math.round((rewardStage / MAX_CONSTELLATION_STAGES) * PRODUCT_TERM_DAYS),
    ),
  );
}

export function calcAccumulatedEstimatedInterest(
  dailyAmount: number,
  elapsedDays: number,
): number {
  if (dailyAmount <= 0 || elapsedDays < 2) return 0;
  return calcInstallmentInterestPretax(dailyAmount, elapsedDays, MAX_ANNUAL_RATE);
}

export function calcMaturityPreferredBonusWon(dailyAmount: number): number {
  if (dailyAmount <= 0) return 0;
  const maxI = calcDailySavings(dailyAmount, MAX_ANNUAL_RATE).interest;
  const baseI = calcDailySavings(dailyAmount, BASE_ANNUAL_RATE).interest;
  return Math.max(0, maxI - baseI);
}

/** 성좌 진행도에 비례해 우대 구간을 가중(달성 중인 우대 금리) */
export function achievedPreferredBonusRate(rewardStage: number): number {
  const capped = Math.min(MAX_CONSTELLATION_STAGES, Math.max(0, rewardStage));
  return Math.min(
    MAX_PREFERRED_BONUS_RATE,
    (capped / MAX_CONSTELLATION_STAGES) * MAX_PREFERRED_BONUS_RATE,
  );
}

export function effectiveAnnualRateForPrediction(rewardStage: number): number {
  return BASE_ANNUAL_RATE + achievedPreferredBonusRate(rewardStage);
}

export type MaturityPrincipalProjectionInput = {
  rewardStage: number;
  todayDepositAmount: number;
  minDepositLimit: number;
  firstRoundDepositAmount: number | null;
};

/**
 * 만기 원금 시뮬:
 * (과거 납입 누적 추정) + 오늘 금액 + (남은 회차 × 하한선)
 */
export function projectTotalPrincipalAtMaturity(
  input: MaturityPrincipalProjectionInput,
): {
  pastPrincipal: number;
  todayAmount: number;
  futurePrincipal: number;
  projectedTotalPrincipal: number;
} {
  const { rewardStage, todayDepositAmount, minDepositLimit, firstRoundDepositAmount } =
    input;
  const min = minDepositLimit;
  const first = firstRoundDepositAmount ?? min;

  const pastPrincipal =
    rewardStage <= 1 ? 0 : first + Math.max(0, rewardStage - 2) * min;

  const futurePrincipal =
    Math.max(0, MAX_CONSTELLATION_STAGES - rewardStage) * min;

  const projectedTotalPrincipal =
    pastPrincipal + todayDepositAmount + futurePrincipal;

  return {
    pastPrincipal,
    todayAmount: todayDepositAmount,
    futurePrincipal,
    projectedTotalPrincipal,
  };
}

export function computeRealtimeMaturityPrediction(
  input: MaturityPrincipalProjectionInput,
) {
  const principalParts = projectTotalPrincipalAtMaturity(input);
  const { projectedTotalPrincipal } = principalParts;

  const annualRate = effectiveAnnualRateForPrediction(input.rewardStage);
  const dailyEquivalent = projectedTotalPrincipal / PRODUCT_TERM_DAYS;
  const projectedInterestPretax = calcInstallmentInterestPretax(
    dailyEquivalent,
    PRODUCT_TERM_DAYS,
    annualRate,
  );

  return {
    ...principalParts,
    termDays: PRODUCT_TERM_DAYS,
    effectiveAnnualRate: annualRate,
    accruedPreferredBonusRate: achievedPreferredBonusRate(input.rewardStage),
    projectedInterestPretax,
    projectedMaturityTotalPretax: projectedTotalPrincipal + projectedInterestPretax,
  };
}
