import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUSStockPrices } from "@/lib/services/finnhub";
import { getCryptoPrices } from "@/lib/services/binance";
import { getKRStockPrices } from "@/lib/services/kis";
import { sendAlertNotification } from "@/lib/services/fcm";

export async function GET(req: NextRequest) {
  // Vercel Cron 보안: CRON_SECRET 검증
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. 활성 알림의 고유 심볼 조회
    const activeAlerts = await prisma.alert.findMany({
      where: { isActive: true },
      include: { user: { include: { fcmTokens: true } } },
    });

    if (activeAlerts.length === 0) {
      return NextResponse.json({ message: "No active alerts", triggered: 0 });
    }

    // 2. 심볼별 그룹핑
    const usSymbols = [
      ...new Set(
        activeAlerts
          .filter((a) => a.assetType === "us_stock")
          .map((a) => a.symbol)
      ),
    ];
    const krSymbols = [
      ...new Set(
        activeAlerts
          .filter((a) => a.assetType === "kr_stock")
          .map((a) => a.symbol)
      ),
    ];
    const cryptoSymbols = [
      ...new Set(
        activeAlerts
          .filter((a) => a.assetType === "crypto")
          .map((a) => a.symbol)
      ),
    ];

    // 3. 일괄 가격 조회
    const [usPrices, krPrices, cryptoPrices] = await Promise.all([
      usSymbols.length > 0 ? getUSStockPrices(usSymbols) : {},
      krSymbols.length > 0 ? getKRStockPrices(krSymbols) : {},
      cryptoSymbols.length > 0 ? getCryptoPrices(cryptoSymbols) : {},
    ]);

    const allPrices: Record<string, number> = { ...usPrices, ...krPrices, ...cryptoPrices };

    // 4. 알림 조건 매칭 + FCM 발송
    let triggeredCount = 0;

    for (const alert of activeAlerts) {
      const currentPrice = allPrices[alert.symbol];
      if (currentPrice === undefined) continue;

      const target = Number(alert.targetPrice);
      const triggered =
        (alert.direction === "above" && currentPrice >= target) ||
        (alert.direction === "below" && currentPrice <= target);

      if (triggered) {
        // FCM 발송 (사용자의 모든 디바이스)
        for (const fcmToken of alert.user.fcmTokens) {
          await sendAlertNotification(
            fcmToken.token,
            alert.name,
            currentPrice,
            target,
            alert.direction
          );
        }

        // 알림 비활성화
        await prisma.alert.update({
          where: { id: alert.id },
          data: { isActive: false, triggeredAt: new Date() },
        });

        triggeredCount++;
      }
    }

    return NextResponse.json({
      message: `Checked ${activeAlerts.length} alerts`,
      triggered: triggeredCount,
    });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json(
      { error: "Cron job failed" },
      { status: 500 }
    );
  }
}
