"use client";

import { useState } from "react";

// ============================================================
// Types
// ============================================================
interface Thumbnail {
  name: string;
  label: string;
  resolution: string;
  quality: string;
  url: string;
  videoId: string;
}

interface ApiError {
  error: string;
}

// ============================================================
// Sub-components
// ============================================================
const QualityBadge = ({ quality }: { quality: string }) => {
  const getQualityStyles = () => {
    switch (quality) {
      case "highest":
        return "bg-[#FF0033]/20 text-[#FF5555] border-[#FF0033]/30";
      case "high":
        return "bg-[#FF0033]/10 text-[#FF7777] border-[#FF0033]/20";
      case "medium":
        return "bg-white/10 text-white/70 border-white/20";
      default:
        return "bg-white/5 text-white/50 border-white/10";
    }
  };

  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium border ${getQualityStyles()}`}
    >
      {quality}
    </span>
  );
};

// ============================================================
// Main Component
// ============================================================
export default function YouTubeThumbnailGrabber() {
  const [videoUrl, setVideoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;

    setIsLoading(true);
    setError(null);
    setShowResults(false);

    try {
      const response = await fetch(
        `/api/thumbnail?url=${encodeURIComponent(videoUrl.trim())}`,
      );

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error || "Failed to fetch thumbnails");
      }

      const data = await response.json();
      setThumbnails(data.thumbnails);
      setShowResults(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (thumbnail: Thumbnail) => {
    try {
      const response = await fetch(thumbnail.url);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${thumbnail.videoId}-${thumbnail.name}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      window.open(thumbnail.url, "_blank");
    }
  };

  return (
    <section className="relative overflow-hidden py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Input Card - Tech Style */}
        <div
          className="relative rounded-2xl overflow-hidden
                     border border-white/10 
                     shadow-[inset_0_0_16px_rgba(240,247,245,0.1)]
                     bg-white/5 backdrop-blur-sm"
        >
          {/* Gradient border effect */}
          <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-white/20 via-transparent to-white/10 opacity-50 pointer-events-none" />

          <div className="relative p-6 sm:p-8">
            {/* Input Form */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-white/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Enter YouTube video URL..."
                  className="w-full pl-12 pr-4 py-4 
                           bg-black/40 border border-white/10 rounded-xl 
                           text-white placeholder-white/40 
                           focus:outline-none focus:ring-2 focus:ring-[#FF0033]/50 focus:border-[#FF0033]/50 
                           transition-all duration-200"
                />
              </div>

              {/* Submit Button - Tech Style */}
              <button
                type="submit"
                disabled={!videoUrl.trim() || isLoading}
                className="group relative inline-flex items-center justify-center gap-3
                         rounded-xl px-8 py-4
                         bg-gradient-to-r from-[#FF0033] via-[#FF2244] to-[#FF3355]
                         border border-white/20
                         shadow-lg shadow-[#FF0033]/20
                         transition-all duration-300 ease-out
                         hover:scale-[1.02] hover:shadow-xl hover:shadow-[#FF0033]/30
                         hover:border-white/30
                         active:scale-[0.98]
                         disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none
                         overflow-hidden whitespace-nowrap"
              >
                {/* Animated shine */}
                <div
                  className="absolute inset-0 -translate-x-full group-hover:translate-x-full 
                              bg-gradient-to-r from-transparent via-white/20 to-transparent 
                              transition-transform duration-1000 ease-in-out"
                />

                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span className="relative font-semibold">Grabbing...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 text-white relative"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 10l5 5 5-5"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15V3"
                      />
                    </svg>
                    <span className="relative font-bold tracking-wide">
                      Grab Thumbnail
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 rounded-xl border border-[#FF0033]/30 bg-[#FF0033]/10">
                <p className="text-[#FF5555] text-sm flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <title>Error</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {error}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        {showResults && (
          <div className="mt-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Section Title */}
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-white mb-2">
                Available Thumbnails
              </h3>
              <p className="text-white/60 text-sm">
                Click download to save your preferred size
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {thumbnails.map((thumbnail, index) => (
                <div
                  key={thumbnail.resolution}
                  className="group relative rounded-2xl overflow-hidden
                           border border-white/10 
                           shadow-[inset_0_0_16px_rgba(240,247,245,0.05)]
                           hover:shadow-[inset_0_0_16px_rgba(240,247,245,0.1)]
                           hover:border-white/20
                           hover:bg-white/5
                           transition-all duration-300 ease-in-out
                           opacity-0 animate-fade-in-up"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: "forwards",
                  }}
                >
                  {/* Gradient border on hover */}
                  <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-white/20 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  <div className="relative p-4">
                    {/* Thumbnail Preview */}
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/10 mb-4">
                      {/* biome-ignore lint/performance/noImgElement: Using native img for external YouTube URLs */}
                      <img
                        src={thumbnail.url}
                        alt={`${thumbnail.label} ${thumbnail.resolution}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />

                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Info */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h4 className="text-white font-semibold text-sm">
                              {thumbnail.label}
                            </h4>
                            <QualityBadge quality={thumbnail.quality} />
                          </div>
                          <p className="text-lg font-bold text-white font-mono tracking-tight">
                            {thumbnail.resolution}
                          </p>
                        </div>
                      </div>

                      {/* Download Button */}
                      <button
                        type="button"
                        onClick={() => handleDownload(thumbnail)}
                        className="w-full group/btn py-3 
                                 bg-white/5 hover:bg-[#FF0033]/20 
                                 border border-white/10 hover:border-[#FF0033]/40 
                                 text-white/80 hover:text-[#FF5555] 
                                 font-medium rounded-xl 
                                 transition-all duration-300 
                                 flex items-center justify-center gap-2"
                      >
                        <svg
                          className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-y-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 10l5 5 5-5"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15V3"
                          />
                        </svg>
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
