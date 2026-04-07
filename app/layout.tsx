import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "음성 업로드 · n8n",
  description: "음성 파일을 업로드하여 웹훅으로 전송합니다.",
};

/**
 * 루트 레이아웃 — 전역 폰트·메타만 담당합니다.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
