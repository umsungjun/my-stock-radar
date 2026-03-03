import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const alerts = await prisma.alert.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ alerts });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { symbol, name, assetType, targetPrice, direction } = body;

  if (!symbol || !name || !assetType || !targetPrice || !direction) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  if (!["above", "below"].includes(direction)) {
    return NextResponse.json(
      { error: "direction must be 'above' or 'below'" },
      { status: 400 }
    );
  }

  const alert = await prisma.alert.create({
    data: {
      userId: session.user.id,
      symbol,
      name,
      assetType,
      targetPrice,
      direction,
    },
  });

  return NextResponse.json({ alert }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "Alert id required" },
      { status: 400 }
    );
  }

  // 본인 알림만 삭제 가능
  await prisma.alert.deleteMany({
    where: { id: parseInt(id), userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
