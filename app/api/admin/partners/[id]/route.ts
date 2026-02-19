import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import {
  deletePartner,
  getPartner,
  updatePartner,
} from "@/lib/services/partners";
import { deleteFromR2 } from "@/lib/services/storage";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !isAdmin(session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const partner = await getPartner(id);
  if (!partner) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ partner });
}

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

    // Get current partner to check for old logo
    const currentPartner = await getPartner(id);
    if (!currentPartner) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // If logo is being changed and there's an old R2 logo, delete it
    if (
      currentPartner.logoR2Key &&
      (body.logoUrl !== currentPartner.logoUrl ||
        body.logoR2Key !== currentPartner.logoR2Key)
    ) {
      try {
        await deleteFromR2(currentPartner.logoR2Key);
      } catch (err) {
        console.error("Failed to delete old R2 logo:", err);
      }
    }

    const partner = await updatePartner(id, body);
    return NextResponse.json({ partner });
  } catch (error) {
    console.error("Failed to update partner:", error);
    return NextResponse.json(
      { error: "Failed to update partner" },
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
  const partner = await getPartner(id);
  if (!partner) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (partner.logoR2Key) {
    try {
      await deleteFromR2(partner.logoR2Key);
    } catch (err) {
      console.error("Failed to delete R2 logo:", err);
    }
  }

  await deletePartner(id);
  return NextResponse.json({ success: true });
}
