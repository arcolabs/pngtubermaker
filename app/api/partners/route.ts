import { NextResponse } from "next/server";
import { listActivePartners } from "@/lib/services/partners";

export async function GET() {
  const partners = await listActivePartners();
  return NextResponse.json({ partners });
}
