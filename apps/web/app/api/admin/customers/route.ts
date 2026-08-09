import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { getCustomerDashboardData } from "@/lib/services/admin-customers";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !isAdmin(session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await getCustomerDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch customer dashboard:", error);
    return NextResponse.json(
      { error: "Failed to load customer data" },
      { status: 500 },
    );
  }
}
