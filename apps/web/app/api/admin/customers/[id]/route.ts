import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { getCustomerDetail } from "@/lib/services/admin-customer-detail";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !isAdmin(session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const data = await getCustomerDetail(id);
    if (!data) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch customer detail:", error);
    return NextResponse.json(
      { error: "Failed to load customer data" },
      { status: 500 },
    );
  }
}
