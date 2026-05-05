/** 사주·큐레이션 카피를 1~2문장으로 압축 (UI 정보 과부하 완화) */
export function shortenFortuneLine(source: string, maxChars = 96): string {
  const trimmed = source.trim();
  if (trimmed.length <= maxChars) {
    return trimmed;
  }
  const cut = trimmed.slice(0, maxChars);
  const lastPeriod = cut.lastIndexOf(".");
  if (lastPeriod >= 28) {
    return cut.slice(0, lastPeriod + 1).trim();
  }
  const lastComma = cut.lastIndexOf(",");
  if (lastComma >= 28) {
    return `${cut.slice(0, lastComma + 1).trim()}…`;
  }
  return `${cut.trim()}…`;
}

/** 긴 개인화 메시지 대신 핵심 한 줄 요약 */
export function buildFortuneCurationSummary(input: {
  name: string;
  productName: string;
  curationCase: "A" | "B" | "C";
}): string {
  if (input.curationCase === "C") {
    return `재정 안정이 필요한 달, 6개월 정기예금이 ${input.name}님의 기운을 지켜줄 거예요.`;
  }
  if (input.curationCase === "A") {
    return `목표를 넓혀도 좋은 흐름이에요. ${input.productName}으로 재물 기운을 이어가 보세요.`;
  }
  return `지출 리듬을 다스리기 좋은 달이에요. ${input.productName}으로 여유를 채워보세요.`;
}

/** 만기 리포트 헤더용 축하 한 줄 */
export function buildMaturityCelebrationLine(displayName: string): string {
  return shortenFortuneLine(
    `${displayName}님, 6개월 별자리 저축을 빛나게 완성했어요.`,
    72,
  );
}

export function formatAppliedAnnualRateLine(
  totalRate: number,
  baseRate: number,
  preferredBonusP: number,
): string {
  const totalPct = totalRate * 100;
  const basePct = baseRate * 100;
  const prefPct = preferredBonusP * 100;
  return `적용 금리: 연 ${totalPct.toFixed(2)}% (기본 ${basePct.toFixed(1)}% + 우대 ${prefPct.toFixed(2)}%p 포함)`;
}
