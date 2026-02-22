"use client";

import {
  ExternalLink,
  GripVertical,
  ImageIcon,
  Link2,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

interface Partner {
  id: string;
  name: string;
  url: string;
  description: string | null;
  logoUrl: string | null;
  logoR2Key: string | null;
  badgeHtml: string | null;
  sortOrder: number;
  isActive: boolean;
}

type PartnerFormData = {
  name: string;
  url: string;
  description: string;
  logoUrl: string;
  logoR2Key: string;
  badgeHtml: string;
  sortOrder: number;
  isActive: boolean;
};

const EMPTY_FORM: PartnerFormData = {
  name: "",
  url: "",
  description: "",
  logoUrl: "",
  logoR2Key: "",
  badgeHtml: "",
  sortOrder: 0,
  isActive: true,
};

// Logo upload section component
function LogoUploadSection({
  logoUrl,
  onChange,
}: {
  logoUrl: string;
  onChange: (url: string, r2Key?: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/partners/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || data.message || "Upload failed");
        }

        const data = await res.json();
        onChange(data.url, data.key);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [onChange],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        await uploadFile(file);
      }
    },
    [uploadFile],
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleClear = () => {
    onChange("", "");
    setError(null);
  };

  // Preview state - show large preview with image info
  if (logoUrl) {
    return (
      <div className="space-y-3">
        {/* Large preview card */}
        <div className="relative group">
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 flex items-center justify-center min-h-[200px]">
            <Image
              src={logoUrl}
              alt="Partner logo"
              width={160}
              height={160}
              className="max-h-[160px] max-w-full object-contain"
            />
          </div>

          {/* Hover overlay with actions */}
          <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-sm bg-white text-gray-900 hover:bg-gray-100 border-0"
            >
              <Pencil className="w-4 h-4" />
              Change
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="btn btn-sm bg-red-500 text-white hover:bg-red-600 border-0"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {/* Image info */}
        <p className="text-xs text-gray-500 text-center">
          Logo preview • Click image to change or remove
        </p>
      </div>
    );
  }

  // Upload state - show tabs with upload zone or URL input
  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2 ${
            activeTab === "upload"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("url")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2 ${
            activeTab === "url"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Link2 className="w-4 h-4" />
          URL
        </button>
      </div>

      {/* Upload tab content */}
      {activeTab === "upload" && (
        <div className="space-y-3">
          {/* Drag & drop zone */}
          <button
            type="button"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            disabled={uploading}
            className={`
              relative rounded-xl border-2 border-dashed transition-all duration-200
              flex flex-col items-center justify-center min-h-[200px] p-8 w-full
              ${
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400 bg-gray-50/50"
              }
              ${uploading ? "pointer-events-none" : ""}
            `}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-600">Uploading...</span>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-900 font-medium">
                  Drop your logo here
                </p>
                <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                <p className="text-xs text-gray-400 mt-4">
                  PNG, JPG, WEBP, SVG up to 2MB
                </p>
              </>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
              className="hidden"
              onChange={handleFileSelect}
            />
          </button>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg text-sm">
              <X className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>
      )}

      {/* URL tab content */}
      {activeTab === "url" && (
        <div className="space-y-3">
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="url"
              placeholder="https://example.com/logo.png"
              value={logoUrl}
              onChange={(e) => onChange(e.target.value)}
              className="input input-bordered w-full pl-10"
            />
          </div>
          <p className="text-xs text-gray-500">
            Enter a direct link to your logo image
          </p>
        </div>
      )}
    </div>
  );
}

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
      logoR2Key: partner.logoR2Key ?? "",
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
                      <GripVertical className="w-4 h-4 inline" /> {p.sortOrder}
                    </td>
                    <td className="font-medium">{p.name}</td>
                    <td>
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm inline-flex items-center gap-1"
                      >
                        {(() => {
                          try {
                            return new URL(p.url).hostname;
                          } catch {
                            return p.url;
                          }
                        })()}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        {p.logoUrl ? (
                          <Image
                            src={p.logoUrl}
                            alt=""
                            width={40}
                            height={40}
                            className="w-10 h-10 object-contain rounded-lg border border-gray-100 bg-gray-50 p-1"
                          />
                        ) : p.badgeHtml ? (
                          <div className="w-10 h-10 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center text-xs text-gray-400">
                            HTML
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center text-xs text-gray-400">
                            -
                          </div>
                        )}
                        <span className="text-xs text-gray-400">
                          {p.badgeHtml
                            ? "Badge HTML"
                            : p.logoUrl
                              ? "Logo"
                              : "Text only"}
                        </span>
                      </div>
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

            <div className="mt-6 space-y-6">
              {/* Name */}
              <div className="form-control">
                <label htmlFor="partner-name" className="label">
                  <span className="label-text font-medium">
                    Name <span className="text-red-400">*</span>
                  </span>
                </label>
                <input
                  id="partner-name"
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="TinyLaunch"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              {/* URL */}
              <div className="form-control">
                <label htmlFor="partner-url" className="label">
                  <span className="label-text font-medium">
                    URL <span className="text-red-400">*</span>
                  </span>
                </label>
                <input
                  id="partner-url"
                  type="url"
                  className="input input-bordered w-full"
                  placeholder="https://tinylaunch.com"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                />
              </div>

              {/* Description */}
              <div className="form-control">
                <label htmlFor="partner-description" className="label">
                  <span className="label-text font-medium">Description</span>
                </label>
                <input
                  id="partner-description"
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="A platform for launching side projects"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              {/* Logo Upload - New UX */}
              <div className="form-control">
                <div className="label">
                  <span className="label-text font-medium">Logo</span>
                </div>
                <LogoUploadSection
                  logoUrl={form.logoUrl}
                  onChange={(url, r2Key) =>
                    setForm({ ...form, logoUrl: url, logoR2Key: r2Key ?? "" })
                  }
                />
              </div>

              {/* Badge HTML */}
              <div className="form-control">
                <label htmlFor="partner-badge-html" className="label">
                  <span className="label-text font-medium">Badge HTML</span>
                  <span className="label-text-alt text-gray-400">
                    Overrides logo if set
                  </span>
                </label>
                <textarea
                  id="partner-badge-html"
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
                  <label htmlFor="partner-sort-order" className="label">
                    <span className="label-text font-medium">Sort Order</span>
                  </label>
                  <input
                    id="partner-sort-order"
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
                  <label htmlFor="partner-active" className="label">
                    <span className="label-text font-medium">Active</span>
                  </label>
                  <input
                    id="partner-active"
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
