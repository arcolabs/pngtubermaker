import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { grantPurchasedCredits, refundCredits } from "@/lib/services/credits";

const MAX_CREDITS = 100_000;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !isAdmin(session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: userId } = await params;

  try {
    const body = await req.json();
    const { action, amount, reason } = body as {
      action: string;
      amount: number;
      reason: string;
    };

    if (!action || !amount || !reason) {
      return NextResponse.json(
        { error: "Missing action, amount, or reason" },
        { status: 400 },
      );
    }

    if (typeof amount !== "number" || amount <= 0 || amount > MAX_CREDITS) {
      return NextResponse.json(
        { error: `Amount must be between 1 and ${MAX_CREDITS}` },
        { status: 400 },
      );
    }

    const adminEmail = session.user.email;
    const metadata = { adminId: session.user.id, adminEmail, reason };

    if (action === "grant") {
      await grantPurchasedCredits(
        userId,
        amount,
        `Admin grant: ${reason} (by ${adminEmail})`,
        metadata,
      );
    } else if (action === "refund") {
      await refundCredits(
        userId,
        amount,
        `Admin refund: ${reason} (by ${adminEmail})`,
        metadata,
      );
    } else {
      return NextResponse.json(
        { error: "Invalid action. Must be 'grant' or 'refund'" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to adjust credits:", error);
    return NextResponse.json(
      { error: "Failed to adjust credits" },
      { status: 500 },
    );
  }
}
