import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "猫と学ぶ確率・統計",
  description: "カブ先生とタマ助手の対話で学ぶ、直感に反する確率・統計の世界",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased min-h-screen selection:bg-amber-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
