"use client";

import { ExternalLink, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface Badge {
  id: string;
  name: string;
  url: string;
  imageUrl: string;
  altText: string;
  width: number;
  height: number;
  sortOrder: number;
  isActive: boolean;
}

type BadgeFormData = {
  name: string;
  url: string;
  imageUrl: string;
  altText: string;
  width: number;
  height: number;
  sortOrder: number;
  isActive: boolean;
};

const EMPTY_FORM: BadgeFormData = {
  name: "",
  url: "",
  imageUrl: "",
  altText: "",
  width: 200,
  height: 54,
  sortOrder: 0,
  isActive: true,
};

export default function AdminBadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BadgeFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchBadges = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/badges");
      if (res.status === 403) {
        setError("You don't have admin access.");
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setBadges(data.badges);
    } catch {
      setError("Failed to load badges.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(badge: Badge) {
    setEditingId(badge.id);
    setForm({
      name: badge.name,
      url: badge.url,
      imageUrl: badge.imageUrl,
      altText: badge.altText,
      width: badge.width,
      height: badge.height,
      sortOrder: badge.sortOrder,
      isActive: badge.isActive,
    });
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `/api/admin/badges/${editingId}`
        : "/api/admin/badges";

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
      fetchBadges();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete badge "${name}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/badges/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      fetchBadges();
    } catch {
      alert("Failed to delete badge.");
    }
  }

  async function handleToggleActive(badge: Badge) {
    try {
      await fetch(`/api/admin/badges/${badge.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !badge.isActive }),
      });
      fetchBadges();
    } catch {
      alert("Failed to update badge.");
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
            <h1 className="text-2xl font-bold text-gray-900">Manage Badges</h1>
            <p className="text-gray-500 text-sm mt-1">
              &quot;Featured on&quot; badges shown in the homepage footer.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="btn btn-primary btn-sm"
          >
            <Plus className="w-4 h-4" />
            Add Badge
          </button>
        </div>

        {/* Badge list */}
        {badges.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            No badges yet. Click &quot;Add Badge&quot; to create one.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
            <table className="table w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="w-12">#</th>
                  <th>Name</th>
                  <th>URL</th>
                  <th>Preview</th>
                  <th className="w-20">Active</th>
                  <th className="w-32 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {badges.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50">
                    <td className="text-gray-400 text-sm">
                      <GripVertical className="w-4 h-4 inline" /> {b.sortOrder}
                    </td>
                    <td className="font-medium">{b.name}</td>
                    <td>
                      <a
                        href={b.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm inline-flex items-center gap-1"
                      >
                        {(() => {
                          try {
                            return new URL(b.url).hostname;
                          } catch {
                            return b.url;
                          }
                        })()}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td>
                      {/* biome-ignore lint/performance/noImgElement: external badge image */}
                      <img
                        src={b.imageUrl}
                        alt={b.altText}
                        width={b.width / 2}
                        height={b.height / 2}
                        className="object-contain"
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary toggle-sm"
                        checked={b.isActive}
                        onChange={() => handleToggleActive(b)}
                      />
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(b)}
                          className="btn btn-ghost btn-xs"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(b.id, b.name)}
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
              {editingId ? "Edit Badge" : "Add Badge"}
            </h3>

            <div className="mt-6 space-y-4">
              {/* Quick paste */}
              {!editingId && (
                <div className="form-control">
                  <label htmlFor="badge-paste" className="label">
                    <span className="label-text font-medium">
                      Paste Badge HTML
                    </span>
                    <span className="label-text-alt text-gray-400">
                      Auto-fills all fields
                    </span>
                  </label>
                  <textarea
                    id="badge-paste"
                    className="textarea textarea-bordered w-full h-20 font-mono text-xs"
                    placeholder='<a href="https://..."><img src="https://..." alt="..." width="200" height="54"></a>'
                    onChange={(e) => {
                      const html = e.target.value.trim();
                      if (!html) return;
                      const parser = new DOMParser();
                      const doc = parser.parseFromString(html, "text/html");
                      const a = doc.querySelector("a");
                      const img = doc.querySelector("img");
                      if (!img) return;
                      const url = a?.getAttribute("href") || "";
                      const imageUrl = img.getAttribute("src") || "";
                      const alt = img.getAttribute("alt") || "";
                      const w = img.getAttribute("width");
                      const h = img.getAttribute("height");
                      setForm({
                        ...form,
                        name: alt || form.name,
                        url,
                        imageUrl,
                        altText: alt,
                        width: w ? Number.parseInt(w, 10) : form.width,
                        height: h ? Number.parseInt(h, 10) : form.height,
                      });
                      e.target.value = "";
                    }}
                  />
                </div>
              )}

              {/* Name */}
              <div className="form-control">
                <label htmlFor="badge-name" className="label">
                  <span className="label-text font-medium">
                    Name <span className="text-red-400">*</span>
                  </span>
                </label>
                <input
                  id="badge-name"
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Twelve Tools"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              {/* URL */}
              <div className="form-control">
                <label htmlFor="badge-url" className="label">
                  <span className="label-text font-medium">
                    Link URL <span className="text-red-400">*</span>
                  </span>
                </label>
                <input
                  id="badge-url"
                  type="url"
                  className="input input-bordered w-full"
                  placeholder="https://twelve.tools"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                />
              </div>

              {/* Image URL */}
              <div className="form-control">
                <label htmlFor="badge-image-url" className="label">
                  <span className="label-text font-medium">
                    Badge Image URL <span className="text-red-400">*</span>
                  </span>
                </label>
                <input
                  id="badge-image-url"
                  type="url"
                  className="input input-bordered w-full"
                  placeholder="https://twelve.tools/badge3-light.svg"
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm({ ...form, imageUrl: e.target.value })
                  }
                />
              </div>

              {/* Alt Text */}
              <div className="form-control">
                <label htmlFor="badge-alt" className="label">
                  <span className="label-text font-medium">Alt Text</span>
                </label>
                <input
                  id="badge-alt"
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Featured on Twelve Tools"
                  value={form.altText}
                  onChange={(e) =>
                    setForm({ ...form, altText: e.target.value })
                  }
                />
              </div>

              {/* Width + Height */}
              <div className="flex gap-4">
                <div className="form-control flex-1">
                  <label htmlFor="badge-width" className="label">
                    <span className="label-text font-medium">Width</span>
                  </label>
                  <input
                    id="badge-width"
                    type="number"
                    className="input input-bordered w-full"
                    value={form.width}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        width: Number.parseInt(e.target.value, 10) || 200,
                      })
                    }
                  />
                </div>
                <div className="form-control flex-1">
                  <label htmlFor="badge-height" className="label">
                    <span className="label-text font-medium">Height</span>
                  </label>
                  <input
                    id="badge-height"
                    type="number"
                    className="input input-bordered w-full"
                    value={form.height}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        height: Number.parseInt(e.target.value, 10) || 54,
                      })
                    }
                  />
                </div>
              </div>

              {/* Sort Order + Active */}
              <div className="flex gap-4">
                <div className="form-control flex-1">
                  <label htmlFor="badge-sort-order" className="label">
                    <span className="label-text font-medium">Sort Order</span>
                  </label>
                  <input
                    id="badge-sort-order"
                    type="number"
                    className="input input-bordered w-full"
                    value={form.sortOrder}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        sortOrder: Number.parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />
                </div>
                <div className="form-control">
                  <label htmlFor="badge-active" className="label">
                    <span className="label-text font-medium">Active</span>
                  </label>
                  <input
                    id="badge-active"
                    type="checkbox"
                    className="toggle toggle-primary mt-2"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
                    }
                  />
                </div>
              </div>

              {/* Preview */}
              {form.imageUrl && (
                <div className="form-control">
                  <div className="label">
                    <span className="label-text font-medium">Preview</span>
                  </div>
                  <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex items-center justify-center">
                    <a
                      href={form.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {/* biome-ignore lint/performance/noImgElement: external badge image */}
                      <img
                        src={form.imageUrl}
                        alt={form.altText || form.name}
                        width={form.width}
                        height={form.height}
                      />
                    </a>
                  </div>
                </div>
              )}
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
                disabled={saving || !form.name || !form.url || !form.imageUrl}
                onClick={handleSave}
              >
                {saving && (
                  <span className="loading loading-spinner loading-xs" />
                )}
                {editingId ? "Save Changes" : "Create Badge"}
              </button>
            </div>
          </div>
          <button
            type="button"
            className="modal-backdrop"
            onClick={() => setShowModal(false)}
          />
        </div>
      )}
    </div>
  );
}
