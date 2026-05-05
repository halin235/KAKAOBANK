import type { Metadata, Viewport } from "next";
import { getPublicSiteUrl } from "../lib/env";
import "./globals.css";

const siteTitle = "카카오뱅크 별자리 적금 - 나만의 운세가 쌓이는 저축";
const siteDescription =
  "사주 60갑자 일주 큐레이션과 성좌 게이미피케이션으로 매일 저축 동기를 주는 모바일 적금 데모입니다. 실제 카카오뱅크 서비스와 무관한 포트폴리오 프로젝트입니다.";

const siteUrl = getPublicSiteUrl();

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: {
    default: siteTitle,
    template: "%s | 별자리 적금",
  },
  description: siteDescription,
  keywords: [
    "적금",
    "저축",
    "별자리 적금",
    "사주",
    "60갑자",
    "큐레이션",
    "게이미피케이션",
    "만기 시뮬레이션",
  ],
  applicationName: "별자리 적금",
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    locale: "ko_KR",
    type: "website",
    ...(siteUrl ? { url: siteUrl } : {}),
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
