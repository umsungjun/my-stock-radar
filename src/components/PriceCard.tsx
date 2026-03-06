"use client";

interface PriceCardProps {
  symbol: string;
  name: string;
  assetType: string;
  price?: number;
  isSelected?: boolean;
  onSelect?: () => void;  // 차트 선택
  onClick?: () => void;   // 알림 설정
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

export function PriceCard({
  symbol,
  name,
  assetType,
  price,
  isSelected = false,
  onSelect,
  onClick,
}: PriceCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer border-b border-card-border/50 transition-colors ${
        isSelected ? "bg-accent/10" : "hover:bg-accent/5"
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate">{name}</div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-muted font-mono">{symbol}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${ASSET_TYPE_COLOR[assetType]}`}>
            {ASSET_TYPE_LABEL[assetType]}
          </span>
        </div>
      </div>
      <div className="text-right shrink-0">
        {price !== undefined ? (
          <span className="text-sm font-bold tabular-nums">{price.toLocaleString()}</span>
        ) : (
          <div className="w-16 h-4 bg-card-border/50 rounded animate-pulse" />
        )}
      </div>
      {/* 알림 설정 버튼 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        title="알림 설정"
        className="p-1.5 rounded-lg hover:bg-accent/10 text-muted hover:text-accent transition-colors shrink-0"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}
