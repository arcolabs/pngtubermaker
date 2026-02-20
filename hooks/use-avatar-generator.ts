"use client";

import { useCallback, useState } from "react";
import { useSubscriptionStore } from "@/hooks/use-subscription-store";

// ============================================================================
// Types
// ============================================================================

export type ArtStyle = "anime" | "chibi";

export interface ExpressionState {
  id: string;
  type: string;
  status: "pending" | "generating" | "completed" | "failed";
  imageUrl: string | null;
}

export interface Generation {
  id: string;
  avatarId: string | null;
  prompt: string;
  style: ArtStyle;
  candidateImages: string[];
  status: "generating" | "completed" | "failed";
  error?: string;
  createdAt: number;
  // History fields (populated from server, empty for new generations)
  name?: string;
  baseImageUrl?: string | null;
  expressions?: ExpressionState[];
}

export interface SelectedAvatar {
  generationId: string;
  avatarId: string;
  candidateIndex: number;
  candidateUrl: string;
  avatarName: string;
  expressions: ExpressionState[];
  isSelectingBase: boolean;
  isGeneratingExpressions: boolean;
  expressionsGenerated: boolean;
  baseSelected: boolean;
}

export interface GeneratorState {
  prompt: string;
  style: ArtStyle;
  generations: Generation[];
  isGenerating: boolean;
  selected: SelectedAvatar | null;
  error: string | null;
}

// ============================================================================
// Hook
// ============================================================================

// API response shape from GET /api/avatars/history
interface HistoryItem {
  id: string;
  name: string;
  prompt: string;
  style: string;
  status: string; // 'generating' | 'selecting' | 'completed' | 'failed'
  candidateImages: string[];
  baseImageUrl: string | null;
  expressions: {
    id: string;
    type: string;
    status: string;
    imageUrl: string | null;
  }[];
  createdAt: string;
}

function historyItemToGeneration(item: HistoryItem): Generation {
  return {
    id: item.id,
    avatarId: item.id,
    prompt: item.prompt,
    style: item.style as ArtStyle,
    candidateImages: item.candidateImages,
    status:
      item.status === "selecting" || item.status === "completed"
        ? "completed"
        : item.status === "failed"
          ? "failed"
          : "generating",
    createdAt: new Date(item.createdAt).getTime(),
    name: item.name,
    baseImageUrl: item.baseImageUrl,
    expressions: item.expressions.map((e) => ({
      id: e.id,
      type: e.type,
      status: e.status as ExpressionState["status"],
      imageUrl: e.imageUrl,
    })),
  };
}

const INITIAL_STATE: GeneratorState = {
  prompt: "",
  style: "anime",
  generations: [],
  isGenerating: false,
  selected: null,
  error: null,
};

export function useAvatarGenerator() {
  const [state, setState] = useState<GeneratorState>(INITIAL_STATE);

  const credits = useSubscriptionStore((s) => s.credits);
  const refreshStore = useSubscriptionStore((s) => s.refresh);
  const creditBalance = credits?.total ?? null;

  const fetchBalance = useCallback(async () => {
    await refreshStore();
  }, [refreshStore]);

  // ── Load history from server ──────────────────────────────────────────

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/avatars/history?limit=20");
      if (!res.ok) return;
      const data = await res.json();
      const items: HistoryItem[] = data.history ?? [];

      setState((prev) => {
        // Merge: keep any in-flight generations (that have no avatarId yet),
        // replace everything else with server data
        const inFlightGenerations = prev.generations.filter(
          (g) => g.avatarId === null,
        );
        const historyGenerations = items.map(historyItemToGeneration);

        return {
          ...prev,
          generations: [...inFlightGenerations, ...historyGenerations],
        };
      });
    } catch {
      // Silent fail — history is non-critical
    }
  }, []);

  // ── Form updates ──────────────────────────────────────────────────────

  const updatePrompt = useCallback((prompt: string) => {
    setState((prev) => ({ ...prev, prompt }));
  }, []);

  const updateStyle = useCallback((style: ArtStyle) => {
    setState((prev) => ({ ...prev, style }));
  }, []);

  // ── Generate ──────────────────────────────────────────────────────────

  const generate = useCallback(async () => {
    const genId = crypto.randomUUID();
    const prompt = state.prompt;
    const style = state.style;

    // Prepend a "generating" placeholder to the feed
    setState((prev) => ({
      ...prev,
      isGenerating: true,
      error: null,
      generations: [
        {
          id: genId,
          avatarId: null,
          prompt,
          style,
          candidateImages: [],
          status: "generating",
          createdAt: Date.now(),
        },
        ...prev.generations,
      ],
    }));

    try {
      const res = await fetch("/api/avatars/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style }),
      });

      const data = await res.json();

      if (!res.ok) {
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          generations: prev.generations.map((g) =>
            g.id === genId
              ? {
                  ...g,
                  status: "failed" as const,
                  error: data.error || "Generation failed",
                }
              : g,
          ),
        }));
        await fetchBalance();
        return;
      }

      setState((prev) => ({
        ...prev,
        isGenerating: false,
        generations: prev.generations.map((g) =>
          g.id === genId
            ? {
                ...g,
                id: data.avatarId,
                avatarId: data.avatarId,
                candidateImages: data.images,
                status: "completed" as const,
              }
            : g,
        ),
      }));
      await fetchBalance();
    } catch {
      setState((prev) => ({
        ...prev,
        isGenerating: false,
        generations: prev.generations.map((g) =>
          g.id === genId
            ? {
                ...g,
                status: "failed" as const,
                error: "Network error. Please try again.",
              }
            : g,
        ),
      }));
    }
  }, [state.prompt, state.style, fetchBalance]);

  // ── Select candidate ──────────────────────────────────────────────────

  const selectCandidate = useCallback(
    (
      generationId: string,
      index: number,
      existingExpressions?: ExpressionState[],
    ) => {
      setState((prev) => {
        const gen = prev.generations.find((g) => g.id === generationId);
        if (!gen || !gen.avatarId) return prev;

        // If already selected and base was confirmed via /select, don't allow re-select
        if (
          prev.selected?.generationId === generationId &&
          prev.selected.baseSelected
        ) {
          return prev;
        }

        const hasExpressions =
          existingExpressions && existingExpressions.length > 0;

        return {
          ...prev,
          selected: {
            generationId,
            avatarId: gen.avatarId,
            candidateIndex: index,
            candidateUrl: gen.candidateImages[index] ?? "",
            avatarName:
              prev.selected?.generationId === generationId
                ? prev.selected.avatarName
                : "My PNGTuber",
            expressions: existingExpressions ?? [],
            isSelectingBase: false,
            isGeneratingExpressions: false,
            expressionsGenerated: hasExpressions ?? false,
            baseSelected: hasExpressions ?? false,
          },
        };
      });
    },
    [],
  );

  // ── Generate expressions (calls /select then /expressions) ────────────

  const generateExpressions = useCallback(async () => {
    const selected = state.selected;
    if (!selected) return;

    setState((prev) => ({
      ...prev,
      selected: prev.selected
        ? {
            ...prev.selected,
            isGeneratingExpressions: true,
            expressions: [
              {
                id: "idle",
                type: "idle",
                status: "completed",
                imageUrl: prev.selected.candidateUrl,
              },
              {
                id: "talking",
                type: "talking",
                status: "pending",
                imageUrl: null,
              },
              { id: "happy", type: "happy", status: "pending", imageUrl: null },
              { id: "sad", type: "sad", status: "pending", imageUrl: null },
            ],
          }
        : null,
      error: null,
    }));

    try {
      // Step 1: Select the base image
      if (!selected.baseSelected) {
        await fetch(`/api/avatars/${selected.avatarId}/select`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selectedIndex: selected.candidateIndex }),
        });
      }

      // Step 2: Generate expressions
      const res = await fetch(`/api/avatars/${selected.avatarId}/expressions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expressions: ["talking", "happy", "sad"] }),
      });

      const data = await res.json();

      if (!res.ok) {
        setState((prev) => ({
          ...prev,
          selected: prev.selected
            ? {
                ...prev.selected,
                isGeneratingExpressions: false,
                baseSelected: true,
              }
            : null,
          error: data.error || "Expression generation failed",
        }));
        await fetchBalance();
        return;
      }

      if (data.expressions) {
        setState((prev) => ({
          ...prev,
          selected: prev.selected
            ? {
                ...prev.selected,
                isGeneratingExpressions: false,
                expressionsGenerated: true,
                baseSelected: true,
                expressions: prev.selected.expressions.map((expr) => {
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
              }
            : null,
        }));
      }
      await fetchBalance();
    } catch {
      setState((prev) => ({
        ...prev,
        selected: prev.selected
          ? {
              ...prev.selected,
              isGeneratingExpressions: false,
              baseSelected: true,
            }
          : null,
        error: "Network error. Please try again.",
      }));
    }
  }, [state.selected, fetchBalance]);

  // ── Download ──────────────────────────────────────────────────────────

  const download = useCallback(
    async (size: number) => {
      const selected = state.selected;
      if (!selected) return;

      // Ensure base is selected first
      if (!selected.baseSelected) {
        await fetch(`/api/avatars/${selected.avatarId}/select`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selectedIndex: selected.candidateIndex }),
        });
        setState((prev) => ({
          ...prev,
          selected: prev.selected
            ? { ...prev.selected, baseSelected: true }
            : null,
        }));
      }

      const res = await fetch(
        `/api/avatars/${selected.avatarId}/download?format=zip&size=${size}`,
      );

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selected.avatarName.replace(/\s+/g, "_")}_pngtuber.zip`;
        a.click();
        URL.revokeObjectURL(url);
      }
    },
    [state.selected],
  );

  // ── Avatar name ───────────────────────────────────────────────────────

  const updateAvatarName = useCallback((name: string) => {
    setState((prev) => ({
      ...prev,
      selected: prev.selected ? { ...prev.selected, avatarName: name } : null,
    }));
  }, []);

  // ── Clear selection ───────────────────────────────────────────────────

  const clearSelection = useCallback(() => {
    setState((prev) => ({ ...prev, selected: null }));
  }, []);

  return {
    state,
    creditBalance,
    fetchBalance,
    loadHistory,
    updatePrompt,
    updateStyle,
    generate,
    selectCandidate,
    generateExpressions,
    download,
    updateAvatarName,
    clearSelection,
  };
}
