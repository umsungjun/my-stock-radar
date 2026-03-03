import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// FCM 토큰 등록
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await req.json();
  if (!token) {
    return NextResponse.json(
      { error: "token is required" },
      { status: 400 }
    );
  }

  // upsert: 이미 등록된 토큰이면 무시
  await prisma.fcmToken.upsert({
    where: { token },
    update: { userId: session.user.id },
    create: { userId: session.user.id, token },
  });

  return NextResponse.json({ success: true });
}
