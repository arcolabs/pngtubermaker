"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_FORM_STATE, MOCK_IMAGE_URLS, STORAGE_KEY } from "../constants";
import type { FormState, GenerationTask } from "../types";

// Simple ID generator
const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export interface UseAIImageGenerationReturn {
  formState: FormState;
  setFormState: (updates: Partial<FormState>) => void;
  currentTask: GenerationTask | null;
  isGenerating: boolean;
  generate: () => Promise<void>;
  regenerate: () => Promise<void>;
  clearTask: () => void;
}

export function useAIImageGeneration(): UseAIImageGenerationReturn {
  // Form state with persistence
  const [formState, setFormStateInternal] =
    useState<FormState>(DEFAULT_FORM_STATE);
  const [currentTask, setCurrentTask] = useState<GenerationTask | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load persisted form state on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Migrate legacy 'title' to 'prompt'
          if ("title" in parsed && !("prompt" in parsed)) {
            parsed.prompt = parsed.title;
            delete parsed.title;
          }
          setFormStateInternal((prev) => ({ ...prev, ...parsed }));
        } catch {
          // Ignore parse errors
        }
      }
    }
  }, []);

  // Persist form state on change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formState));
    }
  }, [formState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const setFormState = useCallback((updates: Partial<FormState>) => {
    setFormStateInternal((prev) => ({ ...prev, ...updates }));
  }, []);

  const clearTask = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCurrentTask(null);
    setIsGenerating(false);
  }, []);

  // Simulate image generation with polling
  const generate = useCallback(async () => {
    if (isGenerating || !formState.prompt.trim()) return;

    setIsGenerating(true);
    clearTask();

    // Build prompt
    const prompt = [
      formState.prompt,
      formState.description,
      formState.style?.promptModifier || "",
      formState.colorTone ? `${formState.colorTone} color tone` : "",
    ]
      .filter(Boolean)
      .join(". ");

    // Create new task
    const task: GenerationTask = {
      id: generateId(),
      prompt,
      title: formState.prompt,
      description: formState.description,
      style: formState.style,
      size: formState.size,
      colorTone: formState.colorTone || undefined,
      status: "queued",
      images: [],
      progress: 0,
      createdAt: Date.now(),
    };

    setCurrentTask(task);

    // Simulate API delay and polling
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Update to running state
    setCurrentTask((prev) => (prev ? { ...prev, status: "running" } : null));

    // Simulate progress polling
    let progress = 0;
    intervalRef.current = setInterval(() => {
      progress += Math.random() * 20 + 10;

      if (progress >= 100) {
        progress = 100;
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        // Complete with mock images
        const shuffled = [...MOCK_IMAGE_URLS].sort(() => Math.random() - 0.5);
        setCurrentTask((prev) =>
          prev
            ? {
                ...prev,
                status: "completed",
                progress: 100,
                images: shuffled.slice(0, Math.floor(Math.random() * 2) + 3),
                completedAt: Date.now(),
              }
            : null,
        );
        setIsGenerating(false);
      } else {
        setCurrentTask((prev) =>
          prev ? { ...prev, progress: Math.min(progress, 100) } : null,
        );
      }
    }, 600);
  }, [formState, isGenerating, clearTask]);

  const regenerate = useCallback(async () => {
    clearTask();
    await generate();
  }, [generate, clearTask]);

  return {
    formState,
    setFormState,
    currentTask,
    isGenerating,
    generate,
    regenerate,
    clearTask,
  };
}
