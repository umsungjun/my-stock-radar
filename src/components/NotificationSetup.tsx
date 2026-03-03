"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  requestNotificationPermission,
  onForegroundMessage,
} from "@/lib/firebase-client";

export function NotificationSetup() {
  const { data: session } = useSession();
  const [permission, setPermission] = useState<string>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (!session) return;

    // 포그라운드 메시지 수신 시 알림 표시
    const unsubscribe = onForegroundMessage((payload: unknown) => {
      const p = payload as {
        notification?: { title?: string; body?: string };
      };
      if (p.notification) {
        new Notification(p.notification.title || "MyStockRadar", {
          body: p.notification.body,
          icon: "/favicon.ico",
        });
      }
    });

    return () => unsubscribe();
  }, [session]);

  const handleEnable = async () => {
    const token = await requestNotificationPermission();
    if (token) {
      // FCM 토큰을 서버에 등록
      await fetch("/api/fcm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      setPermission("granted");
    }
  };

  if (!session || permission === "granted") return null;

  return (
    <div className="p-4 rounded-2xl bg-linear-to-r from-accent/5 to-purple-500/5 border border-accent/15 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-accent">
            <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-sm">알림을 활성화하세요</p>
          <p className="text-xs text-muted mt-0.5">
            목표가 도달 시 브라우저 푸시 알림을 받을 수 있습니다
          </p>
        </div>
      </div>
      <button
        onClick={handleEnable}
        className="px-5 py-2.5 rounded-xl bg-linear-to-r from-gradient-start to-gradient-end text-white text-sm font-semibold hover:shadow-lg hover:shadow-accent/25 transition-all duration-200 whitespace-nowrap"
      >
        알림 허용
      </button>
    </div>
  );
}
