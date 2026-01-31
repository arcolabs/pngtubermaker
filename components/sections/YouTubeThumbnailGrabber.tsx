"use client";

import { useState } from "react";

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
      // Fetch the image as blob
      const response = await fetch(thumbnail.url);
      const blob = await response.blob();

      // Create download link
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
      // Fallback: open in new tab
      window.open(thumbnail.url, "_blank");
    }
  };

  return (
    <section className="relative overflow-hidden bg-background pt-4 pb-20 lg:pt-6 lg:pb-28">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Input Card */}
        <div className="bg-[#1A1A1A] rounded-2xl border border-border p-6 sm:p-8 shadow-2xl">
          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-[#FFFFFF80]"
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
                className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-lg text-white placeholder-[#FFFFFF80] focus:outline-none focus:ring-2 focus:ring-[#FF5555] focus:border-transparent transition-all duration-200"
              />
            </div>
            <button
              type="submit"
              disabled={!videoUrl.trim() || isLoading}
              className="sm:w-auto w-full px-8 py-4 bg-[#FF0000] hover:bg-[#E60000] active:bg-[#CC0000] disabled:bg-[#2A2A2A] disabled:text-[#FFFFFF80] disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-[#FF0000]/20 hover:shadow-xl hover:shadow-[#FF0000]/30 flex items-center justify-center gap-2 whitespace-nowrap"
            >
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Grabbing thumbnail...</span>
                </>
              ) : (
                <>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span>Grab Thumbnail</span>
                </>
              )}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-[#FF0000]/10 border border-[#FF0000]/30 rounded-lg">
              <p className="text-[#FF5555] text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        {showResults && (
          <div className="mt-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {thumbnails.map((thumbnail, index) => (
                <div
                  key={thumbnail.resolution}
                  className="group bg-[#1A1A1A] rounded-xl border border-border p-6 hover:border-[#FF5555]/50 transition-all duration-300 opacity-0 animate-fade-in-up"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: "forwards",
                  }}
                >
                  {/* Thumbnail Preview */}
                  <div
                    className="w-full rounded-lg overflow-hidden bg-background flex items-center justify-center p-2 mb-4"
                    style={{ minHeight: "160px", maxHeight: "360px" }}
                  >
                    <div
                      className="relative w-full flex items-center justify-center"
                      style={{ minHeight: "160px", maxHeight: "360px" }}
                    >
                      {/* biome-ignore lint/performance/noImgElement: Using native img for external YouTube URLs */}
                      <img
                        src={thumbnail.url}
                        alt={`${thumbnail.label} ${thumbnail.resolution}`}
                        className="max-w-full max-h-full w-auto h-auto object-contain group-hover:scale-105 transition-transform duration-300"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "360px",
                          width: "auto",
                          height: "auto",
                        }}
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h4 className="text-white font-semibold text-base">
                            {thumbnail.label}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              thumbnail.quality === "highest"
                                ? "bg-[#FF5555] text-white"
                                : thumbnail.quality === "high"
                                  ? "bg-[#FF0000]/80 text-white"
                                  : thumbnail.quality === "medium"
                                    ? "bg-[#2A2A2A] text-[#FFFFFF80]"
                                    : "bg-[#2A2A2A] text-[#FFFFFF80]"
                            }`}
                          >
                            {thumbnail.quality}
                          </span>
                        </div>
                        <p className="text-lg font-bold text-white tracking-tight">
                          {thumbnail.resolution}
                        </p>
                      </div>
                    </div>

                    {/* Download Button */}
                    <button
                      type="button"
                      onClick={() => handleDownload(thumbnail)}
                      className="w-full py-2.5 bg-[#FF0000]/10 hover:bg-[#FF0000]/20 border border-[#FF0000]/30 hover:border-[#FF5555]/50 text-[#FF5555] font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      <span>Download</span>
                    </button>
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
