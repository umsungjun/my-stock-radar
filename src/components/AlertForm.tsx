"use client";

import { useState } from "react";

interface AlertFormProps {
  symbol: string;
  name: string;
  assetType: string;
  currentPrice?: number;
  onCreated: () => void;
  onCancel: () => void;
}

export function AlertForm({
  symbol,
  name,
  assetType,
  currentPrice,
  onCreated,
  onCancel,
}: AlertFormProps) {
  const [targetPrice, setTargetPrice] = useState(
    currentPrice?.toString() || ""
  );
  const [direction, setDirection] = useState<"above" | "below">("below");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPrice) return;

    setLoading(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          name,
          assetType,
          targetPrice: parseFloat(targetPrice),
          direction,
        }),
      });

      if (res.ok) {
        onCreated();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-xl font-bold">{name}</h3>
          <span className="text-sm text-muted font-mono">{symbol}</span>
        </div>
        {currentPrice && (
          <p className="text-sm text-muted">
            현재가{" "}
            <span className="text-foreground font-semibold text-base">
              {currentPrice.toLocaleString()}
            </span>
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2 text-muted">
          목표가
        </label>
        <input
          type="number"
          step="any"
          value={targetPrice}
          onChange={(e) => setTargetPrice(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-background border border-card-border focus:outline-none focus:border-accent/50 focus:shadow-[0_0_0_3px] focus:shadow-accent/10 transition-all duration-200 text-lg font-medium"
          placeholder="목표 가격 입력"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2 text-muted">
          조건
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDirection("below")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              direction === "below"
                ? "bg-success text-white shadow-lg shadow-success/25"
                : "bg-card border border-card-border text-muted hover:text-foreground hover:border-success/30"
            }`}
          >
            이하 (매수 기회)
          </button>
          <button
            type="button"
            onClick={() => setDirection("above")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              direction === "above"
                ? "bg-danger text-white shadow-lg shadow-danger/25"
                : "bg-card border border-card-border text-muted hover:text-foreground hover:border-danger/30"
            }`}
          >
            이상 (익절/손절)
          </button>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 rounded-xl bg-linear-to-r from-gradient-start to-gradient-end text-white font-semibold hover:shadow-lg hover:shadow-accent/25 transition-all duration-200 disabled:opacity-50 disabled:hover:shadow-none"
        >
          {loading ? "등록 중..." : "알림 등록"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-xl bg-card border border-card-border hover:border-accent/30 hover:text-accent transition-all duration-200 font-medium"
        >
          취소
        </button>
      </div>
    </form>
  );
}
