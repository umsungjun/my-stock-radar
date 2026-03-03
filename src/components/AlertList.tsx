"use client";

import Link from "next/link";

interface Alert {
  id: number;
  symbol: string;
  name: string;
  assetType: string;
  targetPrice: number | string;
  direction: string;
  isActive: boolean;
  triggeredAt: string | null;
  createdAt: string;
}

interface AlertListProps {
  alerts: Alert[];
  onDelete: (id: number) => void;
}

const ASSET_TYPE_LABEL: Record<string, string> = {
  us_stock: "US",
  kr_stock: "KR",
  crypto: "Crypto",
};

const ASSET_TYPE_COLOR: Record<string, string> = {
  us_stock: "bg-blue-500/10 text-blue-500",
  kr_stock: "bg-emerald-500/10 text-emerald-500",
  crypto: "bg-orange-500/10 text-orange-500",
};

function getTradingViewSymbol(symbol: string, assetType: string): string {
  switch (assetType) {
    case "us_stock":
      return symbol;
    case "kr_stock":
      return `KRX:${symbol}`;
    case "crypto":
      return `BINANCE:${symbol}`;
    default:
      return symbol;
  }
}

export function AlertList({ alerts, onDelete }: AlertListProps) {
  if (alerts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-accent-light flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-accent">
            <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-lg font-semibold mb-1">등록된 알림이 없습니다</p>
        <p className="text-sm text-muted">종목을 검색하여 가격 알림을 설정해보세요</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`group p-4 rounded-2xl border transition-all duration-200 ${
            alert.isActive
              ? "bg-card border-card-border hover:border-accent/20 hover:shadow-md hover:shadow-accent/5"
              : "bg-card/50 border-card-border/50 opacity-60"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href={`/symbol/${getTradingViewSymbol(alert.symbol, alert.assetType)}`}
                className="font-semibold hover:text-accent transition-colors"
              >
                {alert.name}
              </Link>
              <span className={`text-xs px-2 py-0.5 rounded-lg font-semibold ${ASSET_TYPE_COLOR[alert.assetType]}`}>
                {ASSET_TYPE_LABEL[alert.assetType]}
              </span>
              {!alert.isActive && (
                <span className="text-xs px-2.5 py-0.5 rounded-lg font-semibold bg-success-light text-success">
                  발동됨
                </span>
              )}
            </div>
            {alert.isActive && (
              <button
                onClick={() => onDelete(alert.id)}
                className="text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all duration-200 text-sm font-medium"
              >
                삭제
              </button>
            )}
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span
              className={`font-semibold ${
                alert.direction === "below" ? "text-success" : "text-danger"
              }`}
            >
              {alert.direction === "below" ? "▼ 이하" : "▲ 이상"}
            </span>
            <span className="text-foreground font-bold text-base">
              {Number(alert.targetPrice).toLocaleString()}
            </span>
            {alert.triggeredAt && (
              <span className="text-muted text-xs">
                {new Date(alert.triggeredAt).toLocaleDateString("ko-KR")} 발동
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
