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
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      console.warn(`[SafeImage] Failed to load image: ${src}`);
      onErrorFallback?.(new Error(`Failed to load image: ${src}`));
    }
  };

  if (hasError) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
        <span className="text-2xl">🎭</span>
      </div>
    );
  }

  return <Image src={src} alt={alt} {...props} onError={handleError} />;
}
