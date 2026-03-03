"use client";

import { useState, useEffect, useRef } from "react";

interface SearchResult {
  symbol: string;
  name: string;
  assetType: "us_stock" | "kr_stock" | "crypto";
}

interface SearchBarProps {
  onSelect: (result: SearchResult) => void;
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

export function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (query.length < 1) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/prices/search?q=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        setResults(data.results || []);
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div ref={ref} className="relative w-full max-w-xl">
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
            clipRule="evenodd"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="종목 검색 (AAPL, 삼성전자, BTC...)"
          className="w-full pl-12 pr-4 py-3 rounded-2xl bg-card border border-card-border text-foreground placeholder:text-muted focus:outline-none focus:border-accent/50 focus:shadow-[0_0_0_3px] focus:shadow-accent/10 transition-all duration-200"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-card border border-card-border rounded-2xl shadow-xl shadow-black/5 z-50 max-h-80 overflow-y-auto">
          <div className="p-2">
            {results.map((result) => (
              <button
                key={`${result.assetType}-${result.symbol}`}
                onClick={() => {
                  onSelect(result);
                  setQuery("");
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-accent/5 rounded-xl transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${ASSET_TYPE_COLOR[result.assetType]}`}>
                    {ASSET_TYPE_LABEL[result.assetType]}
                  </div>
                  <div>
                    <span className="font-medium text-sm">{result.name}</span>
                    <span className="text-muted text-xs ml-2">
                      {result.symbol}
                    </span>
                  </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-muted">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
