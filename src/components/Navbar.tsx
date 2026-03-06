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
                <path d="M16.3 2 L13.7 2 L9 12.8 L11.4 12.8 L6.9 22 L9.4 22 L14 11.6 L11.8 11.6 Z"/>
              </svg>
            </div>
            <span className="text-lg font-bold bg-linear-to-r from-gradient-start to-gradient-end bg-clip-text text-transparent">
              MultiTrigger
            </span>
          </Link>
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
