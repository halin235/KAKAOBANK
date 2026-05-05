/**
 * 사주 `fortune_tags` → 협업 상품(보험·증권) 교차 판매 매핑 (포트폴리오 데모).
 * 실서비스에서는 명식 파싱 결과·CRM 규칙으로 치환하고, 여기서는 일주 오버레이+케이스 기본 태그로 시뮬레이션합니다.
 */

export type FortuneTag =
  | "역마살"
  | "낙상수"
  | "충"
  | "편재"
  | "식신생재"
  | "천을귀인";

export type CurationCaseLetter = "A" | "B" | "C";

export type CrossSellPartner = "kakaopay_insurance" | "kakaopay_securities";

/** 보험 트리거 태그 (Case A 시나리오) */
export const INSURANCE_TRIGGER_TAGS: readonly FortuneTag[] = [
  "역마살",
  "낙상수",
  "충",
];

/** 증권 트리거 태그 (Case B 시나리오) */
export const STOCK_TRIGGER_TAGS: readonly FortuneTag[] = [
  "편재",
  "식신생재",
  "천을귀인",
];

/**
 * 특정 일주에 추가 가중치를 두는 사주 태그 오버레이
 * (실서비스에서는 명식 전체 파싱 결과로 대체)
 */
export const FORTUNE_TAGS_BY_DAY_PILLAR: Partial<Record<string, FortuneTag[]>> = {
  임진: ["역마살", "충"],
  경자: ["역마살", "낙상수"],
  계해: ["충"],
  신유: ["충"],
  을유: ["낙상수"],
  경신: ["편재", "천을귀인"],
  정사: ["식신생재", "편재"],
  무신: ["식신생재"],
};

/** 큐레이션 케이스별 기본 fortune_tags (일주 오버레이와 합산) */
export const CASE_DEFAULT_FORTUNE_TAGS: Record<CurationCaseLetter, FortuneTag[]> = {
  /** 재물운 상승 — 재성 기운 → 증권 시나리오 */
  A: ["편재", "식신생재", "천을귀인"],
  /** 지출·변동 — 역마·충 성향 → 미니 보험 시나리오 */
  B: ["역마살", "낙상수", "충"],
  /** 안정 — 귀인 성향 → 가벼운 증권 시나리오 */
  C: ["천을귀인"],
};

export interface CrossSellRecommendation {
  id: string;
  partner: CrossSellPartner;
  fortune_tags: FortuneTag[];
  fortune_badge: string;
  productTitle: string;
  subtitle: string;
  personalized_copy: string;
  action_label: string;
  /** 적금 우대 연리 플래그 (예: 0.001 = 0.1%p) — 보험 가입 연동 시 */
  deposit_rate_bonus_p?: number;
  /** 증권용: 부족 오행 및 섹터 힌트 */
  lacking_element?: string;
  sector_theme?: string;
  logic_notes: string[];
}

function uniqueTags(tags: FortuneTag[]): FortuneTag[] {
  return [...new Set(tags)];
}

export function deriveFortuneTags(
  dayPillar: string,
  curationCase: CurationCaseLetter,
): FortuneTag[] {
  const overlay = FORTUNE_TAGS_BY_DAY_PILLAR[dayPillar] ?? [];
  const base = CASE_DEFAULT_FORTUNE_TAGS[curationCase] ?? [];
  return uniqueTags([...base, ...overlay]);
}

function pickInsuranceLeadTag(tags: FortuneTag[]): FortuneTag {
  const hit = INSURANCE_TRIGGER_TAGS.find((t) => tags.includes(t));
  return hit ?? "역마살";
}

function buildInsuranceOffer(
  userName: string,
  tags: FortuneTag[],
): CrossSellRecommendation {
  const lead = pickInsuranceLeadTag(tags);
  const label =
    lead === "낙상수"
      ? "낙상수"
      : lead === "충"
        ? "충"
        : "역마살";

  return {
    id: "kakaopay_mini_insurance_amulet",
    partner: "kakaopay_insurance",
    fortune_tags: tags.filter((t) => INSURANCE_TRIGGER_TAGS.includes(t)),
    fortune_badge: "액막이",
    productTitle: "액막이 부적 보험 (운동/배송 보험)",
    subtitle: "카카오페이 손해보험 협업 · 미니 보험",
    personalized_copy: `${userName}님, 이번 달 ${label}의 기운을 액막이 보험으로 막아보세요.`,
    action_label: "액막이 시작하기",
    deposit_rate_bonus_p: 0.001,
    logic_notes: [],
  };
}

function buildStockOffer(userName: string, tags: FortuneTag[]): CrossSellRecommendation {
  return {
    id: "kakaopay_fractional_stock_fortune",
    partner: "kakaopay_securities",
    fortune_tags: tags.filter((t) => STOCK_TRIGGER_TAGS.includes(t)),
    fortune_badge: "재물운 상승",
    productTitle: "행운의 주식 점괘 (소수점 투자)",
    subtitle: "카카오페이증권 협업",
    personalized_copy: `${userName}님, 오늘의 흐름에 맞춰 소액부터 차근차근 모아보세요.`,
    action_label: "행운 투자하기",
    logic_notes: [],
  };
}

/**
 * 교차 판매 상품 매칭 (보험 우선 → 증권)
 */
export function matchCrossSellRecommendation(input: {
  userName: string;
  dayPillar: string;
  curationCase: CurationCaseLetter;
}): CrossSellRecommendation | null {
  const tags = deriveFortuneTags(input.dayPillar, input.curationCase);

  const hitInsurance = tags.some((t) =>
    INSURANCE_TRIGGER_TAGS.includes(t),
  );
  const hitStock = tags.some((t) => STOCK_TRIGGER_TAGS.includes(t));

  if (hitInsurance) {
    return buildInsuranceOffer(input.userName, tags);
  }
  if (hitStock) {
    return buildStockOffer(input.userName, tags);
  }

  return null;
}
