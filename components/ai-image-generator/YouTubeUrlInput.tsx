"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";

// YouTube URL patterns to extract Video ID
const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  /m\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
];

interface YouTubeThumbnail {
  name: string;
  label: string;
  resolution: string;
  quality: string;
  url: string;
  videoId: string;
}

interface YouTubeUrlInputProps {
  value: string;
  onChange: (value: string) => void;
  onThumbnailFetched?: (thumbnail: YouTubeThumbnail) => void;
  onError?: (error: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

function extractVideoId(url: string): string | null {
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }
  return null;
}

function isValidYouTubeUrl(url: string): boolean {
  return extractVideoId(url) !== null;
}

const YouTubeUrlInput = memo(function YouTubeUrlInput({
  value,
  onChange,
  onThumbnailFetched,
  onError,
  placeholder = "Drop a YouTube link here to 'borrow' its magic...",
  disabled = false,
}: YouTubeUrlInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  const previousUrlRef = useRef<string>("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external value to local
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Fetch thumbnail from API
  const fetchThumbnail = useCallback(
    async (url: string) => {
      if (!isValidYouTubeUrl(url)) return;
      if (url === previousUrlRef.current) return; // Don't refetch same URL

      setIsLoading(true);
      onError?.(null as unknown as string); // Clear previous errors

      try {
        const response = await fetch(
          `/api/thumbnail?url=${encodeURIComponent(url.trim())}`,
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch thumbnail");
        }

        const data = await response.json();
        const thumbnails: YouTubeThumbnail[] = data.thumbnails;

        if (thumbnails.length > 0) {
          // Use the highest quality thumbnail
          const bestThumbnail = thumbnails[0];
          previousUrlRef.current = url;
          onThumbnailFetched?.(bestThumbnail);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch thumbnail";
        onError?.(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [onThumbnailFetched, onError],
  );

  // Handle input change with debounce
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      onChange(newValue);

      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Debounce thumbnail fetch
      if (isValidYouTubeUrl(newValue)) {
        timeoutRef.current = setTimeout(() => {
          fetchThumbnail(newValue);
        }, 800); // Wait 800ms after user stops typing
      }
    },
    [onChange, fetchThumbnail],
  );

  // Handle paste - fetch immediately
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const pastedText = e.clipboardData.getData("text");

      // Check if it's a valid YouTube URL before updating
      if (isValidYouTubeUrl(pastedText)) {
        e.preventDefault();
        setLocalValue(pastedText);
        onChange(pastedText);

        // Fetch immediately on paste
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          fetchThumbnail(pastedText);
        }, 100);
      }
    },
    [onChange, fetchThumbnail],
  );

  // Handle blur - try to fetch if valid URL
  const handleBlur = useCallback(() => {
    if (
      isValidYouTubeUrl(localValue) &&
      localValue !== previousUrlRef.current
    ) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      fetchThumbnail(localValue);
    }
  }, [localValue, fetchThumbnail]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef && !disabled) {
      inputRef.focus();
    }
  }, [inputRef, disabled]);

  return (
    <div className="w-full space-y-2">
      <label
        htmlFor="youtube-url-input"
        className="text-xs text-white/60 ml-1 block"
      >
        Steal any video's thumbnail — Paste a YouTube URL to grab its cover
      </label>

      <div className="relative">
        <input
          ref={setInputRef}
          id="youtube-url-input"
          type="text"
          inputMode="url"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          value={localValue}
          onChange={handleChange}
          onPaste={handlePaste}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl
                   text-white placeholder-white/40 pr-10
                   focus:outline-none focus:ring-2 focus:ring-[#FF0033]/50 focus:border-[#FF0033]/50
                   transition-all duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="YouTube video URL for style reference"
        />

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              className="animate-spin h-5 w-5 text-[#FF0033]"
              fill="none"
              viewBox="0 0 24 24"
            >
              <title>Loading thumbnail</title>
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
          </div>
        )}
      </div>
    </div>
  );
});

export default YouTubeUrlInput;
export type { YouTubeThumbnail };
