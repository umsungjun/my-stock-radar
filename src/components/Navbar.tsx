"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b border-card-border/50 bg-glass backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-gradient-start to-gradient-end flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-4.5 h-4.5">
                <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-lg font-bold bg-linear-to-r from-gradient-start to-gradient-end bg-clip-text text-transparent">
              MyStockRadar
            </span>
          </Link>
          {session && (
            <Link
              href="/dashboard"
              className="text-sm text-muted hover:text-foreground transition-colors font-medium"
            >
              대시보드
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted hidden sm:block">
                {session.user?.name}
              </span>
              <button
                onClick={() => signOut()}
                className="text-sm px-4 py-2 rounded-xl bg-card border border-card-border hover:border-accent/30 hover:text-accent transition-all duration-200 font-medium"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="text-sm px-4 py-2 rounded-xl bg-linear-to-r from-gradient-start to-gradient-end text-white font-medium hover:shadow-lg hover:shadow-accent/25 transition-all duration-200"
            >
              로그인
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
