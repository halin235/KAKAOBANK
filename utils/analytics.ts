export type CrossSellingAnalyticsEvent =
  | "impression"
  | "cta_click"
  | "dismiss";

export type CrossSellingPayload = {
  offer_id: string;
  partner?: string;
  fortune_tags?: string[];
  product_title?: string;
  entry?: string;
};

/**
 * 교차 판매 CTR/CVR 추적용 이벤트 로거 (실서비스에서는 데이터 레이어/SDK로 치환)
 */
export function track_cross_selling_click(
  event: CrossSellingAnalyticsEvent,
  payload: CrossSellingPayload,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const body = {
    event,
    ...payload,
    ts: Date.now(),
    path: window.location?.pathname ?? "",
  };

  window.dispatchEvent(new CustomEvent("kakaobank_cross_selling", { detail: body }));
}
