"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface TradingViewChartProps {
  symbol: string;
  className?: string;
}

export function TradingViewChart({
  symbol,
  className = "",
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!containerRef.current) return;

    // 기존 위젯 제거
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: "D",
      timezone: "Asia/Seoul",
      theme: resolvedTheme === "dark" ? "dark" : "light",
      style: "1",
      locale: "kr",
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
    });

    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container__widget";
    widgetContainer.style.height = "100%";
    widgetContainer.style.width = "100%";

    containerRef.current.appendChild(widgetContainer);
    containerRef.current.appendChild(script);
  }, [symbol, resolvedTheme]);

  return (
    <div
      className={`tradingview-widget-container ${className}`}
      ref={containerRef}
      style={{ height: className ? "100%" : "500px", width: "100%" }}
    />
  );
}
