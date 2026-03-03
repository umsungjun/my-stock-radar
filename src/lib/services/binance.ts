const BINANCE_BASE = "https://api.binance.com/api/v3";

export async function getCryptoPrice(
  symbol: string
): Promise<number | null> {
  const res = await fetch(
    `${BINANCE_BASE}/ticker/price?symbol=${symbol}`,
    { next: { revalidate: 30 } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return parseFloat(data.price) || null;
}

export async function getCryptoPrices(
  symbols: string[]
): Promise<Record<string, number>> {
  // Binance는 전체 티커를 한 번에 가져올 수 있음
  const res = await fetch(`${BINANCE_BASE}/ticker/price`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) return {};
  const data: { symbol: string; price: string }[] = await res.json();

  const symbolSet = new Set(symbols);
  const prices: Record<string, number> = {};
  for (const item of data) {
    if (symbolSet.has(item.symbol)) {
      prices[item.symbol] = parseFloat(item.price);
    }
  }
  return prices;
}

export async function searchCrypto(query: string) {
  // Binance에는 검색 API가 없으므로 인기 코인 목록에서 필터링
  const res = await fetch(`${BINANCE_BASE}/ticker/price`);
  if (!res.ok) return [];
  const data: { symbol: string; price: string }[] = await res.json();

  const usdtPairs = data
    .filter(
      (item) =>
        item.symbol.endsWith("USDT") &&
        item.symbol.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 20);

  return usdtPairs.map((item) => ({
    symbol: item.symbol,
    name: item.symbol.replace("USDT", ""),
    assetType: "crypto" as const,
  }));
}
