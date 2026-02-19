import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FoodSafeAI",
  description: "학교 급식 안전 운영 및 학부모 소통 대시보드",
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
