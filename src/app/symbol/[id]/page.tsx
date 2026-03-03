"use client";

import { useParams } from "next/navigation";
import { TradingViewChart } from "@/components/TradingViewChart";
import Link from "next/link";

export default function SymbolPage() {
  const params = useParams();
  // id는 URL 인코딩된 TradingView 심볼 (e.g., "AAPL", "KRX:005930", "BINANCE:BTCUSDT")
  const symbol = decodeURIComponent(params.id as string);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="text-muted hover:text-foreground transition-colors"
        >
          ← 대시보드
        </Link>
        <h1 className="text-2xl font-bold">{symbol}</h1>
      </div>

      <div className="rounded-xl border border-card-border overflow-hidden">
        <TradingViewChart symbol={symbol} />
      </div>
    </div>
  );
}
