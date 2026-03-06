import { NextResponse } from "next/server";

// Binance 거래량 기준 상위 코인의 한국어 이름
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
  WAVES: "웨이브즈", ZIL: "질리카", ONT: "온톨로지", QTUM: "퀀텀",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (type !== "crypto") {
    return NextResponse.json({ error: "type=crypto only" }, { status: 400 });
  }

  const res = await fetch("https://api.binance.com/api/v3/ticker/24hr", {
    next: { revalidate: 3600 }, // 1시간 캐시
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Binance API error" }, { status: 502 });
  }

  const tickers = await res.json() as Array<{
    symbol: string;
    quoteVolume: string;
  }>;

  const items = tickers
    .filter((t) => t.symbol.endsWith("USDT"))
    .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
    .slice(0, 100)
    .map((t) => {
      const base = t.symbol.replace("USDT", "");
      return {
        symbol: t.symbol,
        name: CRYPTO_KR_NAMES[base] ?? base,
        assetType: "crypto" as const,
      };
    });

  return NextResponse.json({ items });
}
