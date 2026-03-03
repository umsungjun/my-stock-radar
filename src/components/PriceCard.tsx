"use client";

import Link from "next/link";

interface PriceCardProps {
  symbol: string;
  name: string;
  assetType: string;
  price?: number;
  onClick?: () => void;
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

export function PriceCard({
  symbol,
  name,
  assetType,
  price,
  onClick,
}: PriceCardProps) {
  return (
    <div className="group p-5 rounded-2xl bg-card border border-card-border hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <Link
          href={`/symbol/${getTradingViewSymbol(symbol, assetType)}`}
          className="font-semibold hover:text-accent transition-colors"
        >
          {name}
        </Link>
        <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${ASSET_TYPE_COLOR[assetType]}`}>
          {ASSET_TYPE_LABEL[assetType]}
        </span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <span className="text-xs text-muted font-mono">{symbol}</span>
          {price !== undefined ? (
            <p className="text-2xl font-bold mt-1 tracking-tight">
              {price.toLocaleString()}
            </p>
          ) : (
            <div className="mt-2 w-24 h-7 bg-card-border/50 rounded-lg animate-pulse" />
          )}
        </div>
        <button
          onClick={onClick}
          className="text-sm px-4 py-2 rounded-xl bg-linear-to-r from-gradient-start to-gradient-end text-white font-medium hover:shadow-lg hover:shadow-accent/25 hover:-translate-y-0.5 transition-all duration-200"
        >
          알림 설정
        </button>
      </div>
    </div>
  );
}
