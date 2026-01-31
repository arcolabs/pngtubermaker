"use client";

import { useState } from "react";
import Image from "next/image";

export default function YouTubeThumbnailGrabber() {
  const [videoUrl, setVideoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (videoUrl.trim()) {
      setIsLoading(true);
      // Simulate loading
      setTimeout(() => {
        setIsLoading(false);
        setShowResults(true);
      }, 1500);
    }
  };

  // Mock thumbnail data - in real app, this would come from API
  const thumbnailSizes = [
    {
      label: "HD Image",
      resolution: "1280x720",
      url: "/images/showcase/image.JPEG",
      quality: "highest",
    },
    {
      label: "SD Image",
      resolution: "640x480",
      url: "/images/showcase/image(1).JPEG",
      quality: "high",
    },
    {
      label: "Normal Image",
      resolution: "480x360",
      url: "/images/showcase/image(2).JPEG",
      quality: "medium",
    },
    {
      label: "Normal Image",
      resolution: "320x180",
      url: "/images/showcase/image(3).JPEG",
      quality: "low",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-background pt-4 pb-20 lg:pt-6 lg:pb-28">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Input Card */}
          <div className="bg-[#1A1A1A] rounded-2xl border border-border p-8 sm:p-10 shadow-2xl">
            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-[#FFFFFF80]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
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
                className="w-full py-4 bg-[#FF0000] hover:bg-[#E60000] active:bg-[#CC0000] disabled:bg-[#2A2A2A] disabled:text-[#FFFFFF80] disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-[#FF0000]/20 hover:shadow-xl hover:shadow-[#FF0000]/30 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
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
          </div>

          {/* Results Section */}
          {showResults && (
            <div className="mt-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Thumbnail Results
                </h3>
                <p className="text-[#FFFFFF80]">
                  Select a size to download
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {thumbnailSizes.map((thumbnail) => (
                  <div
                    key={thumbnail.resolution}
                    className="group bg-[#1A1A1A] rounded-xl border border-border p-6 hover:border-[#FF5555]/50 transition-all duration-300"
                  >
                    {/* Thumbnail Preview */}
                    <div className="relative aspect-video w-full mb-4 rounded-lg overflow-hidden bg-background">
                      <Image
                        src={thumbnail.url}
                        alt={`${thumbnail.label} ${thumbnail.resolution}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                      {/* Quality Badge */}
                      <div className="absolute top-2 right-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            thumbnail.quality === "highest"
                              ? "bg-[#FF5555] text-white"
                              : thumbnail.quality === "high"
                                ? "bg-[#FF0000]/80 text-white"
                                : "bg-[#2A2A2A] text-[#FFFFFF80]"
                          }`}
                        >
                          {thumbnail.quality}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-medium">
                          {thumbnail.label}
                        </h4>
                        <span className="text-sm text-[#FFFFFF80]">
                          {thumbnail.resolution}
                        </span>
                      </div>

                      {/* Download Button */}
                      <button
                        type="button"
                        onClick={() => {
                          // In real app, this would trigger download
                          console.log(`Downloading ${thumbnail.resolution}`);
                        }}
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

              {/* Try Another Button */}
              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowResults(false);
                    setVideoUrl("");
                  }}
                  className="text-[#FF5555] hover:text-[#FF0000] font-medium transition-colors duration-200"
                >
                  Grab another thumbnail →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
