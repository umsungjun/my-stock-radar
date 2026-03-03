"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { SearchBar } from "@/components/SearchBar";
import { AlertForm } from "@/components/AlertForm";
import { AlertList } from "@/components/AlertList";
import { PriceCard } from "@/components/PriceCard";
import { NotificationSetup } from "@/components/NotificationSetup";

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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<SearchResult | null>(null);
  const [watchList, setWatchList] = useState<
    (SearchResult & { price?: number })[]
  >([]);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertFormAsset, setAlertFormAsset] = useState<SearchResult | null>(
    null
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchAlerts = useCallback(async () => {
    const res = await fetch("/api/alerts");
    if (res.ok) {
      const data = await res.json();
      setAlerts(data.alerts);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchAlerts();
    }
  }, [session, fetchAlerts]);

  // 클라이언트 폴링: 관심 종목 가격 업데이트
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
          const res = await fetch(
            `/api/prices?type=${type}&symbols=${symbols.join(",")}`
          );
          if (res.ok) {
            const { prices } = await res.json();
            setWatchList((prev) =>
              prev.map((item) =>
                prices[item.symbol] !== undefined
                  ? { ...item, price: prices[item.symbol] }
                  : item
              )
            );
          }
        } catch {}
      }
    };

    updatePrices();
    const interval = setInterval(updatePrices, 60000); // 1분마다
    return () => clearInterval(interval);
  }, [watchList.length]);

  const handleSelect = (result: SearchResult) => {
    // 이미 있는지 확인
    if (!watchList.find((w) => w.symbol === result.symbol)) {
      setWatchList((prev) => [...prev, result]);
    }
    setSelectedAsset(result);
  };

  const handleDeleteAlert = async (id: number) => {
    await fetch(`/api/alerts?id=${id}`, { method: "DELETE" });
    fetchAlerts();
  };

  const openAlertForm = (asset: SearchResult) => {
    setAlertFormAsset(asset);
    setShowAlertForm(true);
  };

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted">로딩 중...</p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold mb-1 tracking-tight">대시보드</h1>
        <p className="text-muted">
          종목을 검색하고 가격 알림을 설정하세요
        </p>
      </div>

      <NotificationSetup />

      <SearchBar onSelect={handleSelect} />

      {/* 알림 설정 모달 */}
      {showAlertForm && alertFormAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-card-border rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <AlertForm
              symbol={alertFormAsset.symbol}
              name={alertFormAsset.name}
              assetType={alertFormAsset.assetType}
              currentPrice={
                watchList.find((w) => w.symbol === alertFormAsset.symbol)?.price
              }
              onCreated={() => {
                setShowAlertForm(false);
                fetchAlerts();
              }}
              onCancel={() => setShowAlertForm(false)}
            />
          </div>
        </div>
      )}

      {/* 관심 종목 */}
      {watchList.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold">관심 종목</h2>
            <span className="text-xs px-2 py-0.5 rounded-lg bg-accent-light text-accent font-semibold">
              {watchList.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {watchList.map((item) => (
              <PriceCard
                key={`${item.assetType}-${item.symbol}`}
                symbol={item.symbol}
                name={item.name}
                assetType={item.assetType}
                price={item.price}
                onClick={() => openAlertForm(item)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 알림 목록 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-bold">내 알림</h2>
          <span className="text-xs px-2 py-0.5 rounded-lg bg-accent-light text-accent font-semibold">
            {alerts.filter((a) => a.isActive).length}개 활성
          </span>
        </div>
        <AlertList alerts={alerts} onDelete={handleDeleteAlert} />
      </section>
    </div>
  );
}
