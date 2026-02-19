"use client";

import { Download } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { ExpressionState } from "@/hooks/use-generation";

interface StepDownloadProps {
  avatarId: string | null;
  avatarName: string;
  expressions: ExpressionState[];
  onNameChange: (name: string) => void;
}

export function StepDownload({
  avatarId,
  avatarName,
  expressions,
  onNameChange,
}: StepDownloadProps) {
  const [selectedSize, setSelectedSize] = useState(512);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (format: "zip" | "individual") => {
    if (!avatarId) return;
    setIsDownloading(true);

    try {
      // TODO: Wire up to download API when Engineer A implements it
      const res = await fetch(
        `/api/avatars/${avatarId}/download?format=${format}&size=${selectedSize}`,
      );

      if (res.ok && format === "zip") {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${avatarName.replace(/\s+/g, "_")}_pngtuber.zip`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // Will be handled by error toast (Task 4.3)
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Celebration header */}
      <div className="text-center space-y-2">
        <div className="text-4xl">🎉</div>
        <h2 className="text-2xl font-bold">Your PNGTuber is ready!</h2>
      </div>

      {/* Name input */}
      <div className="form-control">
        <label className="label" htmlFor="avatar-name">
          <span className="label-text font-medium">Name your character</span>
        </label>
        <input
          id="avatar-name"
          type="text"
          value={avatarName}
          onChange={(e) => onNameChange(e.target.value)}
          className="input input-bordered w-full"
          placeholder="My PNGTuber"
          maxLength={50}
        />
      </div>

      {/* Expression preview grid */}
      <div className="grid grid-cols-4 gap-3">
        {expressions
          .filter((e) => e.status === "completed" && e.imageUrl)
          .map((expr) => (
            <div
              key={expr.id}
              className="aspect-square rounded-lg overflow-hidden"
            >
              <img
                src={expr.imageUrl ?? ""}
                alt={expr.type}
                className="w-full h-full object-cover"
              />
              <div className="text-center text-xs text-base-content/60 mt-1 capitalize">
                {expr.type}
              </div>
            </div>
          ))}
      </div>

      {/* Size selector */}
      <div className="space-y-2">
        <div className="label">
          <span className="label-text font-medium">Export Size</span>
        </div>
        {[
          { size: 512, label: "512×512", tier: "free" },
          { size: 1080, label: "1080×1080", tier: "start" },
          { size: 2160, label: "2160×2160 (4K)", tier: "pro" },
        ].map((opt) => (
          <label
            key={opt.size}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
              selectedSize === opt.size
                ? "bg-primary/10 ring-1 ring-primary"
                : "bg-base-200"
            }`}
          >
            <input
              type="radio"
              name="size"
              value={opt.size}
              checked={selectedSize === opt.size}
              onChange={() => setSelectedSize(opt.size)}
              className="radio radio-primary radio-sm"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>

      {/* Download buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          className="btn btn-primary flex-1"
          onClick={() => handleDownload("zip")}
          disabled={isDownloading}
        >
          <Download className="w-4 h-4" />
          {isDownloading ? "Downloading..." : "Download ZIP"}
        </button>
      </div>

      {/* Quick setup guides placeholder */}
      <div className="divider" />

      <div className="space-y-2">
        <h3 className="font-semibold">What&apos;s next?</h3>
        <div className="join join-vertical w-full">
          <div className="collapse collapse-arrow join-item bg-base-200">
            <input type="radio" name="guide" />
            <div className="collapse-title font-medium">
              Use with veadotube mini
            </div>
            <div className="collapse-content text-sm">
              <p>Setup guide coming soon...</p>
            </div>
          </div>
          <div className="collapse collapse-arrow join-item bg-base-200">
            <input type="radio" name="guide" />
            <div className="collapse-title font-medium">
              Use with PNGTuber Plus
            </div>
            <div className="collapse-content text-sm">
              <p>Setup guide coming soon...</p>
            </div>
          </div>
          <div className="collapse collapse-arrow join-item bg-base-200">
            <input type="radio" name="guide" />
            <div className="collapse-title font-medium">
              Use with Discord Reactive
            </div>
            <div className="collapse-content text-sm">
              <p>Setup guide coming soon...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <Link href="/create" className="btn btn-outline flex-1">
          Create Another
        </Link>
        <Link href="/avatars" className="btn btn-primary flex-1">
          Go to My Avatars
        </Link>
      </div>
    </div>
  );
}
