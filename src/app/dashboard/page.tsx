"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { SearchBar } from "@/components/SearchBar";
import { AlertForm } from "@/components/AlertForm";
import { AlertList } from "@/components/AlertList";
import { PriceCard } from "@/components/PriceCard";
import { NotificationSetup } from "@/components/NotificationSetup";
import { TradingViewChart } from "@/components/TradingViewChart";

interface SearchResult {
  symbol: string;
  name: string;
  assetType: "us_stock" | "kr_stock" | "crypto";
}

interface Alert {
  id: number;
  symbol: string;
  name: string;
  assetType: string;
  targetPrice: number;
  direction: string;
  isActive: boolean;
  triggeredAt: string | null;
  createdAt: string;
}

type AssetTab = "all" | "crypto" | "stock";

// 코인 한국어 이름 매핑 (API route와 동일하게 유지)
const CRYPTO_KR_NAMES: Record<string, string> = {
  BTC: "비트코인", ETH: "이더리움", BNB: "바이낸스코인", SOL: "솔라나",
  XRP: "리플", DOGE: "도지코인", ADA: "에이다", AVAX: "아발란체",
  LINK: "체인링크", DOT: "폴카닷", MATIC: "폴리곤", UNI: "유니스왑",
  ATOM: "코스모스", LTC: "라이트코인", BCH: "비트코인캐시", TRX: "트론",
  NEAR: "니어프로토콜", SHIB: "시바이누", APT: "앱토스", ARB: "아비트럼",
  OP: "옵티미즘", SUI: "수이", TON: "톤코인", FTM: "팬텀", ALGO: "알고랜드",
  VET: "비체인", FIL: "파일코인", HBAR: "헤데라", SAND: "더샌드박스",
  MANA: "디센트럴랜드", INJ: "인젝티브", SEI: "세이", STX: "스택스",
  PEPE: "페페", WIF: "위프", BONK: "봉크", JUP: "주피터", PYTH: "피스네트워크",
  RUNE: "쏘체인", BLUR: "블러", GMX: "지엠엑스", AAVE: "에이브", MKR: "메이커",
  SNX: "신세틱스", CRV: "커브", LDO: "리도", RPL: "로켓풀", GRT: "그래프",
  IMX: "이뮤터블엑스", GALA: "갈라", CHZ: "칠리즈", ENJ: "엔진코인",
  ZEC: "지캐시", DASH: "대시", ETC: "이더리움클래식", XLM: "스텔라루멘",
  XMR: "모네로", EOS: "이오스", IOTA: "아이오타", NEO: "네오",
};

// 주식 기본 목록 (US 30개 + KR 20개)
const DEFAULT_STOCKS: SearchResult[] = [
  // 미국 주식
  { symbol: "AAPL",  name: "Apple",          assetType: "us_stock" },
  { symbol: "MSFT",  name: "Microsoft",      assetType: "us_stock" },
  { symbol: "NVDA",  name: "NVIDIA",         assetType: "us_stock" },
  { symbol: "GOOGL", name: "Alphabet",       assetType: "us_stock" },
  { symbol: "AMZN",  name: "Amazon",         assetType: "us_stock" },
  { symbol: "META",  name: "Meta",           assetType: "us_stock" },
  { symbol: "TSLA",  name: "Tesla",          assetType: "us_stock" },
  { symbol: "JPM",   name: "JPMorgan Chase", assetType: "us_stock" },
  { symbol: "LLY",   name: "Eli Lilly",      assetType: "us_stock" },
  { symbol: "UNH",   name: "UnitedHealth",   assetType: "us_stock" },
  { symbol: "V",     name: "Visa",           assetType: "us_stock" },
  { symbol: "XOM",   name: "ExxonMobil",     assetType: "us_stock" },
  { symbol: "MA",    name: "Mastercard",     assetType: "us_stock" },
  { symbol: "JNJ",   name: "Johnson & Johnson", assetType: "us_stock" },
  { symbol: "PG",    name: "Procter & Gamble",  assetType: "us_stock" },
  { symbol: "COST",  name: "Costco",         assetType: "us_stock" },
  { symbol: "HD",    name: "Home Depot",     assetType: "us_stock" },
  { symbol: "ABBV",  name: "AbbVie",         assetType: "us_stock" },
  { symbol: "MRK",   name: "Merck",          assetType: "us_stock" },
  { symbol: "KO",    name: "Coca-Cola",      assetType: "us_stock" },
  { symbol: "CVX",   name: "Chevron",        assetType: "us_stock" },
  { symbol: "BAC",   name: "Bank of America",assetType: "us_stock" },
  { symbol: "AMD",   name: "AMD",            assetType: "us_stock" },
  { symbol: "NFLX",  name: "Netflix",        assetType: "us_stock" },
  { symbol: "WMT",   name: "Walmart",        assetType: "us_stock" },
  { symbol: "CRM",   name: "Salesforce",     assetType: "us_stock" },
  { symbol: "ORCL",  name: "Oracle",         assetType: "us_stock" },
  { symbol: "QCOM",  name: "Qualcomm",       assetType: "us_stock" },
  { symbol: "INTC",  name: "Intel",          assetType: "us_stock" },
  { symbol: "IBM",   name: "IBM",            assetType: "us_stock" },
  // 한국 주식
  { symbol: "005930", name: "삼성전자",    assetType: "kr_stock" },
  { symbol: "000660", name: "SK하이닉스", assetType: "kr_stock" },
  { symbol: "035420", name: "NAVER",      assetType: "kr_stock" },
  { symbol: "035720", name: "카카오",     assetType: "kr_stock" },
  { symbol: "000270", name: "기아",       assetType: "kr_stock" },
  { symbol: "005380", name: "현대차",     assetType: "kr_stock" },
  { symbol: "051910", name: "LG화학",     assetType: "kr_stock" },
  { symbol: "006400", name: "삼성SDI",    assetType: "kr_stock" },
  { symbol: "003550", name: "LG",         assetType: "kr_stock" },
  { symbol: "207940", name: "삼성바이오로직스", assetType: "kr_stock" },
  { symbol: "066570", name: "LG전자",     assetType: "kr_stock" },
  { symbol: "012330", name: "현대모비스", assetType: "kr_stock" },
  { symbol: "034730", name: "SK",         assetType: "kr_stock" },
  { symbol: "015760", name: "한국전력",   assetType: "kr_stock" },
  { symbol: "032830", name: "삼성생명",   assetType: "kr_stock" },
  { symbol: "003490", name: "대한항공",   assetType: "kr_stock" },
  { symbol: "010950", name: "S-Oil",      assetType: "kr_stock" },
  { symbol: "009150", name: "삼성전기",   assetType: "kr_stock" },
  { symbol: "096770", name: "SK이노베이션", assetType: "kr_stock" },
  { symbol: "086790", name: "하나금융지주", assetType: "kr_stock" },
];

function getTradingViewSymbol(symbol: string, assetType: string): string {
  switch (assetType) {
    case "us_stock": return symbol;
    case "kr_stock": return `KRX:${symbol}`;
    case "crypto": return `BINANCE:${symbol}`;
    default: return symbol;
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<SearchResult>(DEFAULT_STOCKS[0]);
  const [watchList, setWatchList] = useState<(SearchResult & { price?: number })[]>(DEFAULT_STOCKS);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertFormAsset, setAlertFormAsset] = useState<SearchResult | null>(null);
  const [assetTab, setAssetTab] = useState<AssetTab>("all");
  const [filterQuery, setFilterQuery] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const fetchAlerts = useCallback(async () => {
    const res = await fetch("/api/alerts");
    if (res.ok) {
      const data = await res.json();
      setAlerts(data.alerts);
    }
  }, []);

  useEffect(() => {
    if (session) fetchAlerts();
  }, [session, fetchAlerts]);

  // 마운트 시 Binance 거래량 상위 100개 코인 로드
  useEffect(() => {
    fetch("/api/prices/top?type=crypto")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data?.items) return;
        setWatchList((prev) => {
          const existing = new Set(prev.map((w) => w.symbol));
          const newCoins = data.items.filter((c: SearchResult) => !existing.has(c.symbol));
          return [...newCoins, ...prev];
        });
        // 첫 번째 코인(BTC)을 초기 선택으로
        if (data.items.length > 0) setSelectedSymbol(data.items[0]);
      })
      .catch(() => {});
  }, []);

  // 관심 종목 가격 폴링 (60초)
  useEffect(() => {
    if (watchList.length === 0) return;

    const updatePrices = async () => {
      const grouped: Record<string, string[]> = {};
      for (const item of watchList) {
        if (!grouped[item.assetType]) grouped[item.assetType] = [];
        grouped[item.assetType].push(item.symbol);
      }
      for (const [type, symbols] of Object.entries(grouped)) {
        try {
          const res = await fetch(`/api/prices?type=${type}&symbols=${symbols.join(",")}`);
          if (res.ok) {
            const { prices } = await res.json();
            setWatchList((prev) =>
              prev.map((item) =>
                prices[item.symbol] !== undefined ? { ...item, price: prices[item.symbol] } : item
              )
            );
          }
        } catch {}
      }
    };

    updatePrices();
    const interval = setInterval(updatePrices, 60000);
    return () => clearInterval(interval);
  }, [watchList.length]);

  const handleSelect = (result: SearchResult) => {
    if (!watchList.find((w) => w.symbol === result.symbol && w.assetType === result.assetType)) {
      setWatchList((prev) => [...prev, result]);
    }
    setSelectedSymbol(result);
  };

  const handleDeleteAlert = async (id: number) => {
    await fetch(`/api/alerts?id=${id}`, { method: "DELETE" });
    fetchAlerts();
  };

  const openAlertForm = (asset: SearchResult) => {
    setAlertFormAsset(asset);
    setShowAlertForm(true);
  };

  const filteredList = watchList.filter((item) => {
    if (assetTab === "crypto" && item.assetType !== "crypto") return false;
    if (assetTab === "stock" && item.assetType !== "us_stock" && item.assetType !== "kr_stock") return false;
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    const base = item.symbol.replace("USDT", "");
    const kr = CRYPTO_KR_NAMES[base] ?? "";
    return (
      item.symbol.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      kr.includes(filterQuery)
    );
  });

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted">로딩 중...</p>
      </div>
    );
  }

  if (!session) return null;

  const tabStyle = (tab: AssetTab) =>
    `flex-1 py-2 text-xs font-semibold transition-colors ${
      assetTab === tab
        ? "text-accent border-b-2 border-accent"
        : "text-muted hover:text-foreground"
    }`;

  return (
    // layout.tsx의 패딩 탈출 → 전체 높이 분할 레이아웃
    <div className="-mx-4 sm:-mx-6 -my-8 flex h-[calc(100vh-64px)] overflow-hidden">

      {/* 좌측: 차트 */}
      <div className="flex-1 relative bg-background">
        {selectedSymbol ? (
          <TradingViewChart
            symbol={getTradingViewSymbol(selectedSymbol.symbol, selectedSymbol.assetType)}
            className="h-full"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-muted">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 opacity-20">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            <p className="text-sm">우측에서 종목을 선택하면 차트가 표시됩니다</p>
          </div>
        )}
      </div>

      {/* 우측: 관심목록 패널 */}
      <div className="w-72 xl:w-80 border-l border-card-border flex flex-col overflow-hidden bg-card/30">

        {/* FCM 알림 설정 배너 */}
        <div className="px-3 pt-3">
          <NotificationSetup />
        </div>

        {/* 탭 */}
        <div className="flex border-b border-card-border mt-2">
          {(["all", "stock", "crypto"] as AssetTab[]).map((tab) => (
            <button
              key={tab}
              className={tabStyle(tab)}
              onClick={() => {
                setAssetTab(tab);
                listRef.current?.scrollTo({ top: 0 });
              }}
            >
              {tab === "all" ? "전체" : tab === "stock" ? "주식" : "코인"}
            </button>
          ))}
        </div>

        {/* 목록 내 필터 */}
        <div className="px-3 py-2 border-b border-card-border">
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="코인/종목 검색..."
            className="w-full text-xs bg-background border border-card-border rounded-lg px-2.5 py-1.5 outline-none focus:border-accent/50 placeholder:text-muted"
          />
        </div>

        {/* 새 종목 추가 검색 */}
        <div className="p-3 border-b border-card-border">
          <SearchBar onSelect={handleSelect} />
        </div>

        {/* 관심 종목 리스트 */}
        <div ref={listRef} className="flex-1 overflow-y-auto">
          {filteredList.length > 0 ? (
            filteredList.map((item) => (
              <PriceCard
                key={`${item.assetType}-${item.symbol}`}
                symbol={item.symbol}
                name={item.name}
                assetType={item.assetType}
                price={item.price}
                isSelected={
                  selectedSymbol?.symbol === item.symbol &&
                  selectedSymbol?.assetType === item.assetType
                }
                onSelect={() => setSelectedSymbol(item)}
                onClick={() => openAlertForm(item)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-muted">
              <p className="text-xs">종목을 검색해서 추가하세요</p>
            </div>
          )}
        </div>

        {/* 알림 목록 */}
        {alerts.length > 0 && (
          <div className="border-t border-card-border max-h-56 overflow-y-auto">
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                내 알림 · {alerts.filter((a) => a.isActive).length}개 활성
              </p>
              <AlertList alerts={alerts} onDelete={handleDeleteAlert} />
            </div>
          </div>
        )}
      </div>

      {/* 알림 설정 모달 */}
      {showAlertForm && alertFormAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-card-border rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <AlertForm
              symbol={alertFormAsset.symbol}
              name={alertFormAsset.name}
              assetType={alertFormAsset.assetType}
              currentPrice={watchList.find((w) => w.symbol === alertFormAsset.symbol)?.price}
              onCreated={() => {
                setShowAlertForm(false);
                fetchAlerts();
              }}
              onCancel={() => setShowAlertForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
