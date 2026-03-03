const FINNHUB_BASE = "https://finnhub.io/api/v1";

export async function getUSStockPrice(symbol: string): Promise<number | null> {
  const res = await fetch(
    `${FINNHUB_BASE}/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.c ?? null; // c = current price
}

export async function searchUSStocks(query: string) {
  const res = await fetch(
    `${FINNHUB_BASE}/search?q=${query}&token=${process.env.FINNHUB_API_KEY}`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.result || []).map(
    (item: { symbol: string; description: string }) => ({
      symbol: item.symbol,
      name: item.description,
      assetType: "us_stock" as const,
    })
  );
}

export async function getUSStockPrices(
  symbols: string[]
): Promise<Record<string, number>> {
  const prices: Record<string, number> = {};
  // Finnhub은 배치 API가 없으므로 병렬 요청 (rate limit 60/min 주의)
  const results = await Promise.allSettled(
    symbols.map(async (symbol) => {
      const price = await getUSStockPrice(symbol);
      if (price !== null) prices[symbol] = price;
    })
  );
  return prices;
}
