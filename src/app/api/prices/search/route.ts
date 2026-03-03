import { NextRequest, NextResponse } from "next/server";
import { searchUSStocks } from "@/lib/services/finnhub";
import { searchCrypto } from "@/lib/services/binance";
import { searchKRStocks } from "@/lib/services/kis";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query || query.length < 1) {
    return NextResponse.json({ results: [] });
  }

  try {
    const [usStocks, krStocks, cryptos] = await Promise.allSettled([
      searchUSStocks(query),
      Promise.resolve(searchKRStocks(query)),
      searchCrypto(query),
    ]);

    const results = [
      ...(usStocks.status === "fulfilled" ? usStocks.value : []),
      ...(krStocks.status === "fulfilled" ? krStocks.value : []),
      ...(cryptos.status === "fulfilled" ? cryptos.value : []),
    ];

    return NextResponse.json({ results: results.slice(0, 20) });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
