/**
 * 클라이언트 번들에 포함될 수 있는 값만 export합니다.
 * API 키·시크릿은 서버 라우트에서만 `process.env`를 읽고 여기에 노출하지 마세요.
 */
export function getPublicSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return raw?.replace(/\/$/, "") ?? "";
}
