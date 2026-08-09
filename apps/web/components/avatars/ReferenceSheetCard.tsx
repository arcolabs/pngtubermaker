"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { ImageActionIcons } from "@/components/ui/ImageActionIcons";

interface ReferenceSheetCardProps {
  avatarId: string;
  initialUrl: string;
  onRegenerated: (newUrl: string, generatedAt: string) => void;
}

export function ReferenceSheetCard({
  avatarId,
  initialUrl,
  onRegenerated,
}: ReferenceSheetCardProps) {
  const [url, setUrl] = useState(initialUrl);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegenerate = async () => {
    if (
      !confirm(
        "Regenerate will overwrite the current reference sheet and cost 200 credits. Continue?",
      )
    ) {
      return;
    }
    setRegenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/avatars/${avatarId}/reference-sheet`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(
          data.error === "insufficient_credits"
            ? "Not enough credits."
            : data.error === "generation_failed"
              ? "Generation failed — credits refunded."
              : "Something went wrong.",
        );
        return;
      }
      const data = await res.json();
      setUrl(data.referenceSheetUrl);
      onRegenerated(data.referenceSheetUrl, data.referenceSheetGeneratedAt);
    } catch (err) {
      console.error("[ReferenceSheetCard] regenerate failed:", err);
      setError("Network error.");
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Character Reference Sheet
        </h3>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex-[3] min-w-0">
          <div className="relative group rounded-xl overflow-hidden border border-gray-200">
            {/* biome-ignore lint/performance/noImgElement: external R2 URLs */}
            <img
              src={url}
              alt="Character reference sheet"
              className="w-full aspect-square object-contain bg-white"
            />
            <ImageActionIcons
              imageUrl={url}
              filename={`reference-sheet-${avatarId}`}
            />
            {regenerating && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
            )}
          </div>
        </div>

        <div className="flex-[1] min-w-[220px] bg-gray-50/70 rounded-xl p-4 border border-gray-200 flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            Three views, expressions, palette & world setting — all in one
            sheet.
          </p>
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={regenerating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-60"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate (200)
          </button>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
