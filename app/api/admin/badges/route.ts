import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { createBadge, listAllBadges } from "@/lib/services/badges";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !isAdmin(session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const badges = await listAllBadges();
  return NextResponse.json({ badges });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !isAdmin(session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();

    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    if (!body.url || typeof body.url !== "string") {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }
    if (!body.imageUrl || typeof body.imageUrl !== "string") {
      return NextResponse.json(
        { error: "imageUrl is required" },
        { status: 400 },
      );
    }

    const badge = await createBadge({
      name: body.name,
      url: body.url,
      imageUrl: body.imageUrl,
      altText: body.altText || body.name,
      width: typeof body.width === "number" ? body.width : 200,
      height: typeof body.height === "number" ? body.height : 54,
      sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : 0,
      isActive: body.isActive !== false,
    });

    return NextResponse.json({ badge }, { status: 201 });
  } catch (error) {
    console.error("Failed to create badge:", error);
    return NextResponse.json(
      { error: "Failed to create badge" },
      { status: 500 },
    );
  }
}
