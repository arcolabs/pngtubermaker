# Partner Page — Implementation Guide

> Assignee: Frontend/Fullstack Engineer
> Priority: P1
> Estimated scope: 7 files new, 1 file modified
> Reference: [technical-architecture](./technical-architecture-20260219.md)

---

## Overview

Build a `/partners` public page that displays link-exchange partners (like TinyLaunch, etc.) with their badges/logos. Partners are managed via an admin CRUD interface at `/admin/partners` — no CMS needed, everything lives in our Neon DB.

**User stories**:
- Visitor sees a grid of partner badges on `/partners`, each linking to the partner's site
- Admin can add/edit/delete/reorder partners at `/admin/partners`
- Admin can paste raw badge HTML or upload a logo image
- Changes are live immediately (no rebuild needed)

---

## Before You Start

1. Pull latest from `main`
2. Run `bun install && bun run db:push` to sync DB
3. Add your user ID to `.env`:
   ```
   ADMIN_USER_IDS=your-user-id-here
   ```
   (Find your user ID: log in, open browser console, run `fetch('/api/subscription').then(r=>r.json()).then(console.log)` — or query the `user` table directly)

---

## Task 1: Database Schema

**File**: `database/schema.ts`

Add this table after the `avatarExpressions` table (before the Legacy section):

```typescript
// ============================================================================
// Partners (link exchange)
// ============================================================================

export const partners = pgTable("partners", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  // Either a logo image URL (uploaded to R2) or raw badge HTML from partner
  logoUrl: text("logo_url"),
  logoR2Key: text("logo_r2_key"),
  badgeHtml: text("badge_html"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

Add type exports at the bottom of the file (in the "Type exports" section):

```typescript
// Partners
export type Partner = InferSelectModel<typeof partners>;
export type NewPartner = InferInsertModel<typeof partners>;
```

Then run:

```bash
bun run db:generate
bun run db:push
```

---

## Task 2: Admin Auth Helper

**File (new)**: `lib/admin.ts`

This checks if the current user is an admin. We use an env var to avoid modifying the `user` table (which is managed by better-auth).

```typescript
const ADMIN_IDS = new Set(
  (process.env.ADMIN_USER_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean),
);

export function isAdmin(userId: string): boolean {
  return ADMIN_IDS.has(userId);
}
```

Add to `.env.example`:

```
# Comma-separated user IDs that can access /admin
ADMIN_USER_IDS=
```

---

## Task 3: Partners Service

**File (new)**: `lib/services/partners.ts`

Follow the same pattern as `lib/services/avatars.ts`.

```typescript
import { asc, eq } from "drizzle-orm";
import { partners } from "@/database/schema";
import type { Partner } from "@/database/schema";
import { getDatabase } from "@/lib/db";

/** List all active partners, ordered by sortOrder. Used by public page. */
export async function listActivePartners(): Promise<Partner[]> {
  const db = getDatabase();
  return db
    .select()
    .from(partners)
    .where(eq(partners.isActive, true))
    .orderBy(asc(partners.sortOrder), asc(partners.name));
}

/** List ALL partners (including inactive). Used by admin. */
export async function listAllPartners(): Promise<Partner[]> {
  const db = getDatabase();
  return db
    .select()
    .from(partners)
    .orderBy(asc(partners.sortOrder), asc(partners.name));
}

/** Get single partner by ID. */
export async function getPartner(id: string): Promise<Partner | null> {
  const db = getDatabase();
  const rows = await db
    .select()
    .from(partners)
    .where(eq(partners.id, id))
    .limit(1);
  return rows[0] ?? null;
}

/** Create a new partner. Returns the created record. */
export async function createPartner(data: {
  name: string;
  url: string;
  description?: string;
  logoUrl?: string;
  logoR2Key?: string;
  badgeHtml?: string;
  sortOrder?: number;
  isActive?: boolean;
}): Promise<Partner> {
  const db = getDatabase();
  const id = crypto.randomUUID();
  const rows = await db
    .insert(partners)
    .values({ id, ...data })
    .returning();
  return rows[0];
}

/** Update an existing partner. Returns the updated record. */
export async function updatePartner(
  id: string,
  data: Partial<{
    name: string;
    url: string;
    description: string | null;
    logoUrl: string | null;
    logoR2Key: string | null;
    badgeHtml: string | null;
    sortOrder: number;
    isActive: boolean;
  }>,
): Promise<Partner | null> {
  const db = getDatabase();
  const rows = await db
    .update(partners)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(partners.id, id))
    .returning();
  return rows[0] ?? null;
}

/** Delete a partner by ID. */
export async function deletePartner(id: string): Promise<void> {
  const db = getDatabase();
  await db.delete(partners).where(eq(partners.id, id));
}
```

---

## Task 4: API Routes

### 4a. List + Create

**File (new)**: `app/api/admin/partners/route.ts`

```typescript
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import {
  listAllPartners,
  createPartner,
} from "@/lib/services/partners";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !isAdmin(session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const partners = await listAllPartners();
  return NextResponse.json({ partners });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !isAdmin(session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();

    // Basic validation
    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    if (!body.url || typeof body.url !== "string") {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }

    const partner = await createPartner({
      name: body.name,
      url: body.url,
      description: body.description || null,
      logoUrl: body.logoUrl || null,
      badgeHtml: body.badgeHtml || null,
      sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : 0,
      isActive: body.isActive !== false,
    });

    return NextResponse.json({ partner }, { status: 201 });
  } catch (error) {
    console.error("Failed to create partner:", error);
    return NextResponse.json(
      { error: "Failed to create partner" },
      { status: 500 },
    );
  }
}
```

### 4b. Single partner CRUD

**File (new)**: `app/api/admin/partners/[id]/route.ts`

```typescript
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import {
  getPartner,
  updatePartner,
  deletePartner,
} from "@/lib/services/partners";

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
    const partner = await updatePartner(id, body);
    if (!partner) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
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

  // If partner has an R2 logo, delete it
  // (import deleteFromR2 from lib/services/r2 if logo cleanup is needed)

  await deletePartner(id);
  return NextResponse.json({ success: true });
}
```

### 4c. Public endpoint (no auth)

**File (new)**: `app/api/partners/route.ts`

```typescript
import { NextResponse } from "next/server";
import { listActivePartners } from "@/lib/services/partners";

export async function GET() {
  const partners = await listActivePartners();
  return NextResponse.json({ partners });
}
```

---

## Task 5: Public Partners Page

**File (new)**: `app/(main)/partners/page.tsx`

This is a **server component** — fetches data at request time, no client JS needed.

```tsx
import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { listActivePartners } from "@/lib/services/partners";

export const metadata: Metadata = {
  title: "Partners | PNGTuberMaker",
  description:
    "Our amazing partners and friends in the creator ecosystem.",
};

export default async function PartnersPage() {
  const partners = await listActivePartners();

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        <Breadcrumb items={[{ label: "Partners" }]} />

        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Our Partners
          </h1>
          <p className="text-gray-500 mt-3">
            Tools, platforms, and communities we love and recommend.
          </p>
        </div>

        {partners.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            No partners listed yet. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {partners.map((partner) => (
              <a
                key={partner.id}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgba(6,182,212,0.15)] transition-all duration-300"
              >
                {/* Badge HTML takes priority over logo image */}
                {partner.badgeHtml ? (
                  <div
                    className="flex items-center justify-center min-h-[60px] mb-4"
                    dangerouslySetInnerHTML={{ __html: partner.badgeHtml }}
                  />
                ) : partner.logoUrl ? (
                  <div className="flex items-center justify-center min-h-[60px] mb-4">
                    <img
                      src={partner.logoUrl}
                      alt={partner.name}
                      className="max-h-[60px] max-w-full object-contain"
                    />
                  </div>
                ) : null}

                <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors flex items-center gap-2">
                  {partner.name}
                  <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>

                {partner.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {partner.description}
                  </p>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

**Important security note about `dangerouslySetInnerHTML`**: This is acceptable here because the badge HTML is written by admins (not user-submitted). If you want extra safety, install `dompurify` and sanitize:

```bash
bun add isomorphic-dompurify
```

Then wrap: `dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(partner.badgeHtml) }}`

This is optional for MVP since only admins can write badge HTML.

---

## Task 6: Admin Partners Page

**File (new)**: `app/(main)/admin/partners/page.tsx`

This is a **client component** — needs interactivity for CRUD operations.

```tsx
"use client";

import {
  ExternalLink,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface Partner {
  id: string;
  name: string;
  url: string;
  description: string | null;
  logoUrl: string | null;
  badgeHtml: string | null;
  sortOrder: number;
  isActive: boolean;
}

type PartnerFormData = {
  name: string;
  url: string;
  description: string;
  logoUrl: string;
  badgeHtml: string;
  sortOrder: number;
  isActive: boolean;
};

const EMPTY_FORM: PartnerFormData = {
  name: "",
  url: "",
  description: "",
  logoUrl: "",
  badgeHtml: "",
  sortOrder: 0,
  isActive: true,
};

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PartnerFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchPartners = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/partners");
      if (res.status === 403) {
        setError("You don't have admin access.");
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPartners(data.partners);
    } catch {
      setError("Failed to load partners.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(partner: Partner) {
    setEditingId(partner.id);
    setForm({
      name: partner.name,
      url: partner.url,
      description: partner.description ?? "",
      logoUrl: partner.logoUrl ?? "",
      badgeHtml: partner.badgeHtml ?? "",
      sortOrder: partner.sortOrder,
      isActive: partner.isActive,
    });
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `/api/admin/partners/${editingId}`
        : "/api/admin/partners";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      setShowModal(false);
      fetchPartners();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete partner "${name}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/partners/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      fetchPartners();
    } catch {
      alert("Failed to delete partner.");
    }
  }

  async function handleToggleActive(partner: Partner) {
    try {
      await fetch(`/api/admin/partners/${partner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !partner.isActive }),
      });
      fetchPartners();
    } catch {
      alert("Failed to update partner.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-medium">{error}</p>
          <a href="/dashboard" className="btn btn-sm btn-ghost mt-4">
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manage Partners
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Add, edit, or remove link-exchange partners.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="btn btn-primary btn-sm"
          >
            <Plus className="w-4 h-4" />
            Add Partner
          </button>
        </div>

        {/* Partner list */}
        {partners.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            No partners yet. Click "Add Partner" to create one.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
            <table className="table w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="w-12">#</th>
                  <th>Name</th>
                  <th>URL</th>
                  <th>Display</th>
                  <th className="w-20">Active</th>
                  <th className="w-32 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="text-gray-400 text-sm">
                      <GripVertical className="w-4 h-4 inline" />{" "}
                      {p.sortOrder}
                    </td>
                    <td className="font-medium">{p.name}</td>
                    <td>
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm inline-flex items-center gap-1"
                      >
                        {new URL(p.url).hostname}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="text-xs text-gray-400">
                      {p.badgeHtml
                        ? "Badge HTML"
                        : p.logoUrl
                          ? "Logo URL"
                          : "Text only"}
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary toggle-sm"
                        checked={p.isActive}
                        onChange={() => handleToggleActive(p)}
                      />
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(p)}
                          className="btn btn-ghost btn-xs"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id, p.name)}
                          className="btn btn-ghost btn-xs text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg">
            <h3 className="font-bold text-lg">
              {editingId ? "Edit Partner" : "Add Partner"}
            </h3>

            <div className="mt-4 space-y-4">
              {/* Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Name <span className="text-red-400">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="TinyLaunch"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </div>

              {/* URL */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    URL <span className="text-red-400">*</span>
                  </span>
                </label>
                <input
                  type="url"
                  className="input input-bordered w-full"
                  placeholder="https://tinylaunch.com"
                  value={form.url}
                  onChange={(e) =>
                    setForm({ ...form, url: e.target.value })
                  }
                />
              </div>

              {/* Description */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Description</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="A platform for launching side projects"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              {/* Logo URL */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Logo URL</span>
                  <span className="label-text-alt text-gray-400">
                    Direct image link
                  </span>
                </label>
                <input
                  type="url"
                  className="input input-bordered w-full"
                  placeholder="https://example.com/logo.png"
                  value={form.logoUrl}
                  onChange={(e) =>
                    setForm({ ...form, logoUrl: e.target.value })
                  }
                />
              </div>

              {/* Badge HTML */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Badge HTML
                  </span>
                  <span className="label-text-alt text-gray-400">
                    Overrides logo if set
                  </span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full h-24 font-mono text-sm"
                  placeholder='<a href="..."><img src="..." alt="..." /></a>'
                  value={form.badgeHtml}
                  onChange={(e) =>
                    setForm({ ...form, badgeHtml: e.target.value })
                  }
                />
              </div>

              {/* Sort Order + Active */}
              <div className="flex gap-4">
                <div className="form-control flex-1">
                  <label className="label">
                    <span className="label-text font-medium">
                      Sort Order
                    </span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    value={form.sortOrder}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        sortOrder: Number.parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Active</span>
                  </label>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary mt-2"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Modal actions */}
            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={saving || !form.name || !form.url}
                onClick={handleSave}
              >
                {saving && (
                  <span className="loading loading-spinner loading-xs" />
                )}
                {editingId ? "Save Changes" : "Create Partner"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)} />
        </div>
      )}
    </div>
  );
}
```

---

## Task 7: Add Navigation Link

**File**: `components/layout/Footer.tsx`

Add a "Partners" link next to the existing links in the footer navigation. Find the section with links like "Pricing", "Terms", etc. and add:

```tsx
<Link href="/partners" className="...same classes as siblings...">
  Partners
</Link>
```

---

## File Checklist

| # | File | Action | Type |
|---|------|--------|------|
| 1 | `database/schema.ts` | Edit — add `partners` table + types | Schema |
| 2 | `lib/admin.ts` | New | Helper |
| 3 | `lib/services/partners.ts` | New | Service |
| 4 | `app/api/admin/partners/route.ts` | New | API |
| 5 | `app/api/admin/partners/[id]/route.ts` | New | API |
| 6 | `app/api/partners/route.ts` | New | API |
| 7 | `app/(main)/partners/page.tsx` | New | Page |
| 8 | `app/(main)/admin/partners/page.tsx` | New | Page |
| 9 | `components/layout/Footer.tsx` | Edit — add link | Component |
| 10 | `.env` / `.env.example` | Edit — add `ADMIN_USER_IDS` | Config |

---

## Verification Steps

After implementation, verify each of these:

1. `bun run check` — Biome lint passes with no new errors
2. `bun run db:push` — Schema applies cleanly
3. Visit `/partners` — shows empty state ("No partners listed yet")
4. Visit `/admin/partners` while NOT logged in — should show "Forbidden" error
5. Visit `/admin/partners` as a non-admin user — should show "You don't have admin access"
6. Visit `/admin/partners` as an admin (your ID in `ADMIN_USER_IDS`) — should load empty table
7. Click "Add Partner" — fill in name + URL + optional badge HTML — save succeeds
8. Visit `/partners` again — new partner appears with badge/logo
9. Toggle "Active" off on admin page — partner disappears from `/partners`
10. Edit a partner — changes reflect on `/partners`
11. Delete a partner — removed from both pages

---

## Notes for the Engineer

- **Do NOT modify the `user` table.** It's managed by better-auth. Admin access is controlled via `ADMIN_USER_IDS` env var.
- **`badgeHtml` takes priority over `logoUrl`** in rendering. If both exist, badge HTML is shown.
- **`dangerouslySetInnerHTML`** is used for badge HTML. This is safe because only admins can write it. If you want extra safety, add `isomorphic-dompurify` — but it's not required for MVP.
- **Sort order** is ascending — lower numbers appear first. Default is 0.
- **No R2 upload in MVP.** Admins paste a direct image URL or badge HTML. R2 upload for logos can be added later.
- Follow existing code patterns in the codebase. When in doubt, look at how `app/api/avatars/` or `app/(main)/dashboard/page.tsx` does things.
