// 한국투자증권 OpenAPI
// 실제 사용 시 https://apiportal.koreainvestment.com 에서 앱 키 발급 필요
// 모의투자 도메인 사용 (실전: https://openapi.koreainvestment.com:9443)
const KIS_BASE = "https://openapivts.koreainvestment.com:29443";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const res = await fetch(`${KIS_BASE}/oauth2/tokenP`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      appkey: process.env.KIS_APP_KEY,
      appsecret: process.env.KIS_APP_SECRET,
    }),
  });

  if (!res.ok) throw new Error("KIS token fetch failed");
  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + 23 * 60 * 60 * 1000, // 약 23시간
  };
  return data.access_token;
}

export async function getKRStockPrice(
  stockCode: string
): Promise<number | null> {
  try {
    const token = await getAccessToken();
    const res = await fetch(
      `${KIS_BASE}/uapi/domestic-stock/v1/quotations/inquire-price?FID_COND_MRKT_DIV_CODE=J&FID_INPUT_ISCD=${stockCode}`,
      {
        headers: {
          authorization: `Bearer ${token}`,
          appkey: process.env.KIS_APP_KEY!,
          appsecret: process.env.KIS_APP_SECRET!,
          tr_id: "FHKST01010100",
          "Content-Type": "application/json",
        },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return parseInt(data.output?.stck_prpr) || null; // 주식 현재가
  } catch {
    return null;
  }
}

export async function getKRStockPrices(
  codes: string[]
): Promise<Record<string, number>> {
  const prices: Record<string, number> = {};
  // 한투 API는 종목별 개별 호출 필요
  const results = await Promise.allSettled(
    codes.map(async (code) => {
      const price = await getKRStockPrice(code);
      if (price !== null) prices[code] = price;
    })
  );
  return prices;
}

// 한국 주식 검색은 정적 데이터로 처리 (API 호출 절약)
const POPULAR_KR_STOCKS = [
  { symbol: "005930", name: "삼성전자" },
  { symbol: "000660", name: "SK하이닉스" },
  { symbol: "373220", name: "LG에너지솔루션" },
  { symbol: "207940", name: "삼성바이오로직스" },
  { symbol: "005380", name: "현대차" },
  { symbol: "006400", name: "삼성SDI" },
  { symbol: "051910", name: "LG화학" },
  { symbol: "035420", name: "NAVER" },
  { symbol: "000270", name: "기아" },
  { symbol: "035720", name: "카카오" },
  { symbol: "105560", name: "KB금융" },
  { symbol: "055550", name: "신한지주" },
  { symbol: "066570", name: "LG전자" },
  { symbol: "003670", name: "포스코퓨처엠" },
  { symbol: "028260", name: "삼성물산" },
  { symbol: "068270", name: "셀트리온" },
  { symbol: "096770", name: "SK이노베이션" },
  { symbol: "034730", name: "SK" },
  { symbol: "003550", name: "LG" },
  { symbol: "012330", name: "현대모비스" },
];

export function searchKRStocks(query: string) {
  return POPULAR_KR_STOCKS.filter(
    (stock) =>
      stock.name.includes(query) || stock.symbol.includes(query)
  ).map((stock) => ({
    ...stock,
    assetType: "kr_stock" as const,
  }));
}
