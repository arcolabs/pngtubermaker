import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { deleteBadge, getBadge, updateBadge } from "@/lib/services/badges";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !isAdmin(session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const current = await getBadge(id);
    if (!current) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const badge = await updateBadge(id, body);
    return NextResponse.json({ badge });
  } catch (error) {
    console.error("Failed to update badge:", error);
    return NextResponse.json(
      { error: "Failed to update badge" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !isAdmin(session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const badge = await getBadge(id);
  if (!badge) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await deleteBadge(id);
  return NextResponse.json({ success: true });
}
