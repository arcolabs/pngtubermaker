"use client";

import { Download } from "lucide-react";
import { useState } from "react";

interface ImageActionIconsProps {
  /** Image URL to download when the user clicks the download icon. */
  imageUrl: string;
  /** Suggested filename (no extension). Defaults to a timestamped name. */
  filename?: string;
  /** Visible always (true) or only on hover (false, default). */
  alwaysVisible?: boolean;
}

export function ImageActionIcons({
  imageUrl,
  filename,
  alwaysVisible = false,
}: ImageActionIconsProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDownloading(true);
    try {
      // Route through our same-origin proxy so R2 CDN CORS isn't required.
      const proxied = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
      const res = await fetch(proxied);
      if (!res.ok) throw new Error(`proxy returned ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename || `image-${Date.now()}`}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[ImageActionIcons] download failed:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className={`absolute top-2 right-2 z-10 flex gap-1.5 transition-all duration-200 ${
        alwaysVisible ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      }`}
    >
      <button
        type="button"
        onClick={handleDownload}
        disabled={isDownloading}
        className="p-2 rounded-lg bg-white/90 backdrop-blur-sm shadow-md hover:bg-white hover:scale-105 transition-all disabled:opacity-60"
        title="Download image"
      >
        <Download className="w-4 h-4 text-gray-700" />
      </button>
    </div>
  );
}
