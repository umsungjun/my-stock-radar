import { NextRequest, NextResponse } from "next/server";
import { getUSStockPrices } from "@/lib/services/finnhub";
import { getCryptoPrices } from "@/lib/services/binance";
import { getKRStockPrices } from "@/lib/services/kis";

export async function GET(req: NextRequest) {
  const symbols = req.nextUrl.searchParams.get("symbols");
  const type = req.nextUrl.searchParams.get("type"); // us_stock, kr_stock, crypto

  if (!symbols || !type) {
    return NextResponse.json(
      { error: "symbols and type are required" },
      { status: 400 }
    );
  }

  const symbolList = symbols.split(",").map((s) => s.trim());

  try {
    let prices: Record<string, number> = {};

    switch (type) {
      case "us_stock":
        prices = await getUSStockPrices(symbolList);
        break;
      case "kr_stock":
        prices = await getKRStockPrices(symbolList);
        break;
      case "crypto":
        prices = await getCryptoPrices(symbolList);
        break;
      default:
        return NextResponse.json(
          { error: "Invalid type" },
          { status: 400 }
        );
    }

    return NextResponse.json({ prices });
  } catch (error) {
    console.error("Price fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch prices" },
      { status: 500 }
    );
  }
}
