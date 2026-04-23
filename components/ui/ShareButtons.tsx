"use client";

import { Check, Copy, Twitter } from "lucide-react";
import { useState } from "react";

interface ShareButtonsProps {
  /** Public URL of the image/artifact to share. */
  url: string;
  /** Tweet text (the URL will be appended by Twitter's intent). */
  tweetText?: string;
  /** Text to copy for Discord/generic paste. URL is appended if not already present. */
  copyText?: string;
}

export function ShareButtons({
  url,
  tweetText = "Made my PNGTuber character with pngtubermaker.com",
  copyText,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`;

  const handleCopy = async () => {
    const text = copyText
      ? copyText.includes(url)
        ? copyText
        : `${copyText} ${url}`
      : `${tweetText} ${url}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("[ShareButtons] copy failed:", err);
    }
  };

  return (
    <div className="flex gap-2">
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-[#1DA1F2] rounded-xl hover:bg-[#1a91da] transition-colors"
      >
        <Twitter className="w-4 h-4" />
        Share on Twitter
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
        title="Copy link for Discord"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-green-600" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            Copy for Discord
          </>
        )}
      </button>
    </div>
  );
}
