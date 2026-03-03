import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyStockRadar - 나만의 투자 알림",
  description: "미국 주식, 한국 주식, 암호화폐 가격을 모니터링하고 목표가 도달 시 즉시 알림을 받으세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground min-h-screen`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SessionProvider>
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</main>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
