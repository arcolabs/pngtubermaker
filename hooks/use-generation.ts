"use client";

import { useCallback, useRef, useState } from "react";

export type CreateStep =
  | "describe"
  | "choose-base"
  | "expressions"
  | "download";

export type ArtStyle = "anime" | "chibi";

export interface ExpressionState {
  id: string;
  type: string;
  status: "pending" | "generating" | "completed" | "failed";
  imageUrl: string | null;
}

export interface GenerationState {
  step: CreateStep;
  // Step 1
  prompt: string;
  style: ArtStyle;
  // Step 2
  avatarId: string | null;
  candidateImages: string[];
  selectedIndex: number | null;
  // Step 3
  expressions: ExpressionState[];
  // Step 4
  avatarName: string;
  // Loading states
  isGenerating: boolean;
  isGeneratingExpressions: boolean;
  error: string | null;
}

const INITIAL_STATE: GenerationState = {
  step: "describe",
  prompt: "",
  style: "anime",
  avatarId: null,
  candidateImages: [],
  selectedIndex: null,
  expressions: [],
  avatarName: "My PNGTuber",
  isGenerating: false,
  isGeneratingExpressions: false,
  error: null,
};

/**
 * Core state machine for the Create Flow.
 * Manages the 4-step generation process and API calls.
 */
export function useGeneration() {
  const [state, setState] = useState<GenerationState>(INITIAL_STATE);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Fetch credit balance
  const fetchBalance = useCallback(async () => {
    try {
      const res = await fetch("/api/credits/balance");
      if (res.ok) {
        const data = await res.json();
        setCreditBalance(data.total);
      }
    } catch {
      // Silently fail — balance will show as null
    }
  }, []);

  // Step 1 → Step 2: Generate character
  const generateCharacter = useCallback(async () => {
    setState((prev) => ({ ...prev, isGenerating: true, error: null }));

    try {
      const res = await fetch("/api/avatars/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: state.prompt,
          style: state.style,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          error: data.error || "Generation failed",
        }));
        // Refresh balance after failed attempt (might have been refunded)
        await fetchBalance();
        return;
      }

      setState((prev) => ({
        ...prev,
        step: "choose-base",
        avatarId: data.avatarId,
        candidateImages: data.images,
        selectedIndex: null,
        isGenerating: false,
      }));
      await fetchBalance();
    } catch {
      setState((prev) => ({
        ...prev,
        isGenerating: false,
        error: "Network error. Please try again.",
      }));
    }
  }, [state.prompt, state.style, fetchBalance]);

  // Step 2: Select a candidate
  const selectCandidate = useCallback((index: number) => {
    setState((prev) => ({ ...prev, selectedIndex: index }));
  }, []);

  // Step 2: Regenerate candidates (costs another 300 credits)
  const regenerateCharacter = useCallback(async () => {
    setState((prev) => ({ ...prev, isGenerating: true, error: null }));

    try {
      const res = await fetch("/api/avatars/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: state.prompt,
          style: state.style,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          error: data.error || "Regeneration failed",
        }));
        await fetchBalance();
        return;
      }

      setState((prev) => ({
        ...prev,
        avatarId: data.avatarId,
        candidateImages: data.images,
        selectedIndex: null,
        isGenerating: false,
      }));
      await fetchBalance();
    } catch {
      setState((prev) => ({
        ...prev,
        isGenerating: false,
        error: "Network error. Please try again.",
      }));
    }
  }, [state.prompt, state.style, fetchBalance]);

  // Step 2 → Step 3: Select base and generate expressions
  const generateExpressions = useCallback(async () => {
    if (state.selectedIndex === null || !state.avatarId) return;

    setState((prev) => ({
      ...prev,
      step: "expressions",
      isGeneratingExpressions: true,
      error: null,
      expressions: [
        {
          id: "idle",
          type: "idle",
          status: "completed",
          imageUrl: prev.candidateImages[prev.selectedIndex ?? 0] ?? null,
        },
        { id: "talking", type: "talking", status: "pending", imageUrl: null },
        { id: "happy", type: "happy", status: "pending", imageUrl: null },
        { id: "sad", type: "sad", status: "pending", imageUrl: null },
      ],
    }));

    try {
      // First, select the base image
      await fetch(`/api/avatars/${state.avatarId}/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedIndex: state.selectedIndex }),
      });

      // Then generate expressions
      const res = await fetch(`/api/avatars/${state.avatarId}/expressions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expressions: ["talking", "happy", "sad"],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setState((prev) => ({
          ...prev,
          isGeneratingExpressions: false,
          error: data.error || "Expression generation failed",
        }));
        await fetchBalance();
        return;
      }

      // Update expressions with results
      if (data.expressions) {
        setState((prev) => ({
          ...prev,
          isGeneratingExpressions: false,
          expressions: prev.expressions.map((expr) => {
            if (expr.type === "idle") return expr;
            const result = data.expressions.find(
              (e: { type: string }) => e.type === expr.type,
            );
            if (result) {
              return {
                ...expr,
                status: result.status,
                imageUrl: result.imageUrl,
                id: result.id || expr.id,
              };
            }
            return expr;
          }),
        }));
      }
      await fetchBalance();
    } catch {
      setState((prev) => ({
        ...prev,
        isGeneratingExpressions: false,
        error: "Network error. Please try again.",
      }));
    }
  }, [state.selectedIndex, state.avatarId, fetchBalance]);

  // Step 3 → Step 4: Proceed to download
  const proceedToDownload = useCallback(() => {
    setState((prev) => ({ ...prev, step: "download" }));
  }, []);

  // Navigation
  const goBack = useCallback(() => {
    setState((prev) => {
      switch (prev.step) {
        case "choose-base":
          return { ...prev, step: "describe" };
        case "expressions":
          return { ...prev, step: "choose-base" };
        case "download":
          return { ...prev, step: "expressions" };
        default:
          return prev;
      }
    });
  }, []);

  // Form updates
  const updatePrompt = useCallback((prompt: string) => {
    setState((prev) => ({ ...prev, prompt }));
  }, []);

  const updateStyle = useCallback((style: ArtStyle) => {
    setState((prev) => ({ ...prev, style }));
  }, []);

  const updateAvatarName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, avatarName: name }));
  }, []);

  // Reset
  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState(INITIAL_STATE);
  }, []);

  return {
    state,
    creditBalance,
    fetchBalance,
    generateCharacter,
    selectCandidate,
    regenerateCharacter,
    generateExpressions,
    proceedToDownload,
    goBack,
    updatePrompt,
    updateStyle,
    updateAvatarName,
    reset,
  };
}
