"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] relative">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-linear-to-r from-accent/15 to-purple-500/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 p-8 rounded-3xl bg-card border border-card-border shadow-xl shadow-black/5 max-w-sm w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-gradient-start to-gradient-end flex items-center justify-center mx-auto mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-7 h-7">
            <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z" clipRule="evenodd" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-2">로그인</h1>
        <p className="text-muted text-sm mb-8 leading-relaxed">
          가격 알림을 설정하려면
          <br />
          로그인이 필요합니다
        </p>

        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 hover:shadow-md transition-all duration-200 font-semibold"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google로 계속하기
        </button>

        <p className="text-xs text-muted mt-6">
          로그인 시 서비스 이용약관에 동의합니다
        </p>
      </div>
    </div>
  );
}
