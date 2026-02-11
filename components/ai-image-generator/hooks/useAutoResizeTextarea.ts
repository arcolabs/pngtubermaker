"use client";

import { useEffect, useRef } from "react";

interface UseAutoResizeTextareaOptions {
  minHeight?: number;
  maxHeight?: number | "viewport" | "unlimited";
}

export function useAutoResizeTextarea(
  value: string,
  options: UseAutoResizeTextareaOptions = {},
) {
  const { minHeight = 40, maxHeight = "unlimited" } = options;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const optionsRef = useRef({ minHeight, maxHeight });

  // Keep options in ref to avoid dependency issues
  useEffect(() => {
    optionsRef.current = { minHeight, maxHeight };
  }, [minHeight, maxHeight]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: value is intentionally a dependency to trigger resize on content change
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { minHeight: min, maxHeight: max } = optionsRef.current;

    textarea.style.height = "auto";
    const scrollHeight = textarea.scrollHeight;

    if (max === "unlimited") {
      textarea.style.height = `${Math.max(min, scrollHeight)}px`;
      textarea.style.overflowY = "hidden";
    } else {
      let effectiveMaxHeight: number;
      if (max === "viewport") {
        effectiveMaxHeight =
          typeof window !== "undefined" ? window.innerHeight * 0.6 : 600;
      } else {
        effectiveMaxHeight = max;
      }

      const newHeight = Math.max(
        min,
        Math.min(scrollHeight, effectiveMaxHeight),
      );
      textarea.style.height = `${newHeight}px`;
      textarea.style.overflowY =
        scrollHeight > effectiveMaxHeight ? "auto" : "hidden";
    }
  }, [value]);

  useEffect(() => {
    const handleResize = () => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const { minHeight: min, maxHeight: max } = optionsRef.current;

      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;

      if (max === "unlimited") {
        textarea.style.height = `${Math.max(min, scrollHeight)}px`;
        textarea.style.overflowY = "hidden";
      } else {
        let effectiveMaxHeight: number;
        if (max === "viewport") {
          effectiveMaxHeight =
            typeof window !== "undefined" ? window.innerHeight * 0.6 : 600;
        } else {
          effectiveMaxHeight = max;
        }

        const newHeight = Math.max(
          min,
          Math.min(scrollHeight, effectiveMaxHeight),
        );
        textarea.style.height = `${newHeight}px`;
        textarea.style.overflowY =
          scrollHeight > effectiveMaxHeight ? "auto" : "hidden";
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return textareaRef;
}
