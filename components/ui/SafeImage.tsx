"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type SafeImageProps = Omit<ImageProps, "onError"> & {
  fallback?: React.ReactNode;
  onErrorFallback?: (error: Error) => void;
};

export function SafeImage({
  src,
  alt,
  fallback,
  onErrorFallback,
  ...props
}: SafeImageProps) {
  // Upstream image hosts (PiAPI etc.) change without notice, so the
  // remotePatterns whitelist can't be exhaustive. On first error retry as
  // unoptimized (plain <img>, no whitelist); only then show the fallback.
  const [errorCount, setErrorCount] = useState(0);

  const handleError = () => {
    setErrorCount((n) => {
      if (n === 0) {
        console.warn(
          `[SafeImage] Optimized load failed, retrying unoptimized: ${src}`,
        );
      } else if (n === 1) {
        console.warn(`[SafeImage] Failed to load image: ${src}`);
        onErrorFallback?.(new Error(`Failed to load image: ${src}`));
      }
      return n + 1;
    });
  };

  if (errorCount >= 2) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
        <span className="text-2xl">🎭</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      {...props}
      unoptimized={errorCount === 1 || props.unoptimized}
      onError={handleError}
    />
  );
}
