import { NextResponse } from "next/server";
import { listActiveBadges } from "@/lib/services/badges";

export async function GET() {
  const badges = await listActiveBadges();
  return NextResponse.json({ badges });
}
