"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useBuyCreditsModal } from "@/hooks/use-buy-credits-modal";
import { useSubscriptionStore } from "@/hooks/use-subscription-store";

// ============================================================================
// Types
// ============================================================================

export type ArtStyle = "anime" | "chibi" | "cartoon" | "pixel-art" | "none";
export type AspectRatio = "1:1" | "3:4" | "9:16";
export type TaskType = "avatar" | "expression_base" | "expression_custom";
export type ExpressionSubtype = "happy" | "angry" | "sad";

export interface GenerateReferences {
  referenceUrl?: string | null;
}

export interface ExpressionState {
  id: string;
  type: string;
  status: "pending" | "generating" | "completed" | "failed";
  imageUrl: string | null;
}

export interface Generation {
  id: string;
  type: TaskType;
  parentId?: string;
  subtype?: ExpressionSubtype;
  avatarId: string | null;
  slug?: string | null;
  prompt: string;
  style: ArtStyle;
  aspectRatio: AspectRatio;
  candidateImages: string[];
  status: "generating" | "completed" | "failed";
  error?: string;
  createdAt: number;
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
  generatingExpression: string | null;
  baseSelected: boolean;
}

export interface GeneratorState {
  prompt: string;
  style: ArtStyle;
  aspectRatio: AspectRatio;
  generations: Generation[];
  isGenerating: boolean;
  selected: SelectedAvatar | null;
  error: string | null;
}

// ============================================================================
// History Types
// ============================================================================

interface HistoryPackItem {
  id: string;
  packType: string;
  subtype: string | null;
  status: string;
  createdAt: string;
  expressions: {
    id: string;
    type: string;
    status: string;
    imageUrl: string | null;
  }[];
}

interface HistoryItem {
  id: string;
  name: string;
  slug?: string | null;
  prompt: string;
  style: string;
  aspectRatio?: string;
  status: string;
  candidateImages: string[];
  baseImageUrl: string | null;
  expressions: {
    id: string;
    type: string;
    status: string;
    imageUrl: string | null;
  }[];
  packs?: HistoryPackItem[];
  createdAt: string;
}

function historyItemToGeneration(item: HistoryItem): Generation {
  return {
    id: item.id,
    type: "avatar",
    avatarId: item.id,
    slug: item.slug,
    prompt: item.prompt,
    style: item.style as ArtStyle,
    aspectRatio: (item.aspectRatio as AspectRatio) || "1:1",
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

function historyPackToGeneration(
  pack: HistoryPackItem,
  parentAvatarId: string,
  parentSlug: string | null | undefined,
  parentStyle: ArtStyle,
  parentAspectRatio: AspectRatio,
): Generation {
  const isBase = pack.packType === "base";
  const candidateImages = pack.expressions
    .map((e) => e.imageUrl)
    .filter((url): url is string => url !== null);

  return {
    id: pack.id,
    type: isBase ? "expression_base" : "expression_custom",
    parentId: parentAvatarId,
    subtype: (pack.subtype as ExpressionSubtype) ?? undefined,
    avatarId: parentAvatarId,
    slug: parentSlug,
    prompt: isBase
      ? "Base Expressions"
      : `${(pack.subtype ?? "").charAt(0).toUpperCase() + (pack.subtype ?? "").slice(1)} Expressions`,
    style: parentStyle,
    aspectRatio: parentAspectRatio,
    candidateImages,
    status:
      pack.status === "completed"
        ? "completed"
        : pack.status === "failed"
          ? "failed"
          : "generating",
    createdAt: new Date(pack.createdAt).getTime(),
  };
}

// ============================================================================
// Initial State
// ============================================================================

const INITIAL_STATE: GeneratorState = {
  prompt: "",
  style: "chibi",
  aspectRatio: "1:1",
  generations: [],
  isGenerating: false,
  selected: null,
  error: null,
};

// ============================================================================
// Hook
// ============================================================================

export function useAvatarGenerator() {
  const [state, setState] = useState<GeneratorState>(INITIAL_STATE);

  // Refs for concurrency control
  const isGeneratingRef = useRef(false);
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  const pendingRequestsRef = useRef<Set<string>>(new Set());

  const credits = useSubscriptionStore((s) => s.credits);
  const refreshStore = useSubscriptionStore((s) => s.refresh);
  const creditBalance = credits?.total ?? null;

  const fetchBalance = useCallback(async () => {
    await refreshStore();
  }, [refreshStore]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Abort all pending requests
      abortControllersRef.current.forEach((ctrl) => {
        try {
          ctrl.abort();
        } catch {
          // Ignore abort errors
        }
      });
      abortControllersRef.current.clear();
      pendingRequestsRef.current.clear();
    };
  }, []);

  // ── Load history from server ──────────────────────────────────────────

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/avatars/history?limit=20");
      if (!res.ok) return;
      const data = await res.json();
      const items: HistoryItem[] = data.history ?? [];

      setState((prev) => {
        // Keep only in-flight generations (those with null avatarId)
        const inFlightGenerations = prev.generations.filter(
          (g) => g.avatarId === null && g.status === "generating",
        );

        // Build generations: avatars + their packs interleaved by createdAt
        const allGenerations: Generation[] = [];

        for (const item of items) {
          const avatarGen = historyItemToGeneration(item);
          const packs = item.packs ?? [];

          const packGenerations = packs.map((pack) =>
            historyPackToGeneration(
              pack,
              item.id,
              item.slug,
              item.style as ArtStyle,
              (item.aspectRatio as AspectRatio) || "1:1",
            ),
          );

          allGenerations.push(...packGenerations, avatarGen);
        }

        allGenerations.sort((a, b) => b.createdAt - a.createdAt);

        return {
          ...prev,
          generations: [...inFlightGenerations, ...allGenerations],
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

  const updateAspectRatio = useCallback((aspectRatio: AspectRatio) => {
    setState((prev) => ({ ...prev, aspectRatio }));
  }, []);

  // ── Generate with concurrency control ─────────────────────────────────

  const executeGeneration = useCallback(
    async (
      prompt: string,
      style: ArtStyle,
      aspectRatio: AspectRatio,
      references?: GenerateReferences,
    ): Promise<void> => {
      // Check if already generating
      if (isGeneratingRef.current) {
        console.warn(
          "[useAvatarGenerator] A generation is already in progress",
        );
        return;
      }

      isGeneratingRef.current = true;
      const abortController = new AbortController();
      // Client-side timeout: 3 min (backend MJ timeout is 180s)
      const timeoutId = setTimeout(() => abortController.abort(), 200_000);
      const tempId = crypto.randomUUID();
      abortControllersRef.current.set(tempId, abortController);

      // Add skeleton immediately
      setState((prev) => ({
        ...prev,
        isGenerating: true,
        error: null,
        generations: [
          {
            id: tempId,
            type: "avatar",
            avatarId: null,
            prompt,
            style,
            aspectRatio,
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
          body: JSON.stringify({
            prompt,
            style,
            aspectRatio,
            referenceUrl: references?.referenceUrl || undefined,
          }),
          signal: abortController.signal,
        });

        const data = await res.json();

        if (!res.ok) {
          if (data.error === "insufficient_credits") {
            useBuyCreditsModal.getState().open(data.required);
          }
          setState((prev) => ({
            ...prev,
            isGenerating: false,
            generations: prev.generations.map((g) =>
              g.id === tempId
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

        // Replace temp ID with real ID from server
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          generations: prev.generations.map((g) =>
            g.id === tempId
              ? {
                  ...g,
                  id: data.avatarId,
                  avatarId: data.avatarId,
                  candidateImages: data.images,
                  aspectRatio: data.aspectRatio || g.aspectRatio,
                  status: "completed" as const,
                }
              : g,
          ),
        }));
        await fetchBalance();
      } catch (error) {
        const isAbort = error instanceof Error && error.name === "AbortError";

        setState((prev) => ({
          ...prev,
          isGenerating: false,
          generations: prev.generations.map((g) =>
            g.id === tempId
              ? {
                  ...g,
                  status: "failed" as const,
                  error: isAbort
                    ? "Generation timed out. Please try again."
                    : error instanceof Error
                      ? error.message
                      : "Network error. Please try again.",
                }
              : g,
          ),
        }));
      } finally {
        clearTimeout(timeoutId);
        abortControllersRef.current.delete(tempId);
        isGeneratingRef.current = false;
      }
    },
    [fetchBalance],
  );

  const generate = useCallback(
    async (references?: GenerateReferences) => {
      await executeGeneration(
        state.prompt,
        state.style,
        state.aspectRatio,
        references,
      );
    },
    [executeGeneration, state.prompt, state.style, state.aspectRatio],
  );

  const regenerate = useCallback(
    async (prompt: string, style: ArtStyle, aspectRatio: AspectRatio) => {
      await executeGeneration(prompt, style, aspectRatio);
    },
    [executeGeneration],
  );

  // ── Select / toggle candidate ─────────────────────────────────────────

  const selectCandidate = useCallback(
    (
      generationId: string,
      index: number,
      existingExpressions?: ExpressionState[],
    ) => {
      setState((prev) => {
        const gen = prev.generations.find((g) => g.id === generationId);
        if (!gen || !gen.avatarId) return prev;

        if (
          prev.selected?.generationId === generationId &&
          prev.selected.candidateIndex === index
        ) {
          return { ...prev, selected: null };
        }

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
                : (gen.name ?? "My PNGTuber"),
            expressions: existingExpressions ?? [],
            isSelectingBase: false,
            generatingExpression: null,
            baseSelected: false,
          },
        };
      });
    },
    [],
  );

  // ── Generate expression pack with concurrency control ─────────────────

  const generateExpressionPack = useCallback(
    async (packType: "base" | "custom", subtype?: ExpressionSubtype) => {
      const selected = state.selected;
      if (!selected) return;

      // Prevent duplicate packs
      const avatarId = selected.avatarId;
      const isBase = packType === "base";
      const alreadyExists = state.generations.some((g) => {
        if (g.avatarId !== avatarId) return false;
        if (g.status === "failed") return false;
        if (isBase) return g.type === "expression_base";
        return g.type === "expression_custom" && g.subtype === subtype;
      });
      if (alreadyExists) return;

      // Check if already generating expression for this avatar
      const requestKey = `pack-${avatarId}-${packType}-${subtype ?? "base"}`;
      if (pendingRequestsRef.current.has(requestKey)) {
        console.warn(
          "[useAvatarGenerator] Expression pack generation already in progress",
        );
        return;
      }

      pendingRequestsRef.current.add(requestKey);

      const genId = crypto.randomUUID();
      const parentGen = state.generations.find(
        (g) => g.id === selected.generationId,
      );

      const skeletonCount = isBase ? 4 : 2;
      const prompt = "Expressions";

      // Insert generating skeleton card
      setState((prev) => {
        const latestParent = prev.generations.find(
          (g) => g.id === selected.generationId,
        );
        return {
          ...prev,
          generations: [
            {
              id: genId,
              type: isBase ? "expression_base" : "expression_custom",
              parentId: selected.generationId,
              subtype,
              avatarId: selected.avatarId,
              slug: latestParent?.slug ?? parentGen?.slug,
              prompt,
              style: parentGen?.style ?? prev.style,
              aspectRatio: parentGen?.aspectRatio ?? prev.aspectRatio,
              candidateImages: Array(skeletonCount).fill(""),
              status: "generating" as const,
              createdAt: Date.now(),
            },
            ...prev.generations,
          ],
        };
      });

      try {
        // Ensure base image is selected before generating expressions
        if (!selected.baseSelected) {
          const selectRes = await fetch(
            `/api/avatars/${selected.avatarId}/select`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                selectedIndex: selected.candidateIndex,
              }),
            },
          );

          if (!selectRes.ok) {
            const selectData = await selectRes.json();
            if (selectData.error !== "Avatar not ready for selection") {
              throw new Error(selectData.error || "Failed to select base");
            }
          } else {
            const selectData = await selectRes.json();
            setState((prev) => ({
              ...prev,
              selected: prev.selected
                ? { ...prev.selected, baseSelected: true }
                : null,
              generations: prev.generations.map((g) =>
                g.avatarId === selected.avatarId && g.type === "avatar"
                  ? { ...g, slug: selectData.slug, name: selectData.name }
                  : g,
              ),
            }));
          }
        }

        // Call the packs API
        const res = await fetch(`/api/avatars/${selected.avatarId}/packs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ packType, subtype }),
        });

        const data = await res.json();

        if (!res.ok) {
          if (data.error === "insufficient_credits") {
            useBuyCreditsModal.getState().open(data.required);
          }
          setState((prev) => ({
            ...prev,
            generations: prev.generations.map((g) =>
              g.id === genId
                ? {
                    ...g,
                    status: "failed" as const,
                    error: data.error || "Expression pack generation failed",
                  }
                : g,
            ),
          }));
          await fetchBalance();
          return;
        }

        // Replace skeleton with real data
        const imageUrls = (data.expressions as { imageUrl: string | null }[])
          .map((e) => e.imageUrl)
          .filter((url): url is string => url !== null);

        setState((prev) => ({
          ...prev,
          generations: prev.generations.map((g) =>
            g.id === genId
              ? {
                  ...g,
                  id: data.packId,
                  avatarId: selected.avatarId,
                  candidateImages: imageUrls,
                  status:
                    data.failedCount === (data.expressions?.length ?? 0)
                      ? ("failed" as const)
                      : ("completed" as const),
                }
              : g,
          ),
        }));
        await fetchBalance();
      } catch (error) {
        setState((prev) => ({
          ...prev,
          generations: prev.generations.map((g) =>
            g.id === genId
              ? {
                  ...g,
                  status: "failed" as const,
                  error:
                    error instanceof Error
                      ? error.message
                      : "Network error. Please try again.",
                }
              : g,
          ),
        }));
      } finally {
        pendingRequestsRef.current.delete(requestKey);
      }
    },
    [state.selected, state.generations, fetchBalance],
  );

  // ── Download ───────────────────────────────────────────────────────────

  const download = useCallback(async () => {
    const selected = state.selected;
    if (!selected) return;

    // Still selecting candidates → download candidate image directly without
    // calling /select (which would prematurely mark the avatar as completed)
    if (!selected.baseSelected) {
      const filename = `${selected.avatarName.replace(/\s+/g, "_")}_pngtuber.png`;
      try {
        const res = await fetch(selected.candidateUrl);
        if (!res.ok) throw new Error("fetch failed");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      } catch {
        // CORS fallback: open image in new tab
        window.open(selected.candidateUrl, "_blank");
      }
      return;
    }

    // baseSelected=true → expressions generated, use download API
    const hasExpressions = selected.expressions.some(
      (e) => e.status === "completed",
    );
    const format = hasExpressions ? "zip" : "png";
    const ext = hasExpressions ? "zip" : "png";

    const res = await fetch(
      `/api/avatars/${selected.avatarId}/download?format=${format}`,
    );

    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selected.avatarName.replace(/\s+/g, "_")}_pngtuber.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [state.selected]);

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
    updateAspectRatio,
    generate,
    regenerate,
    selectCandidate,
    generateExpressionPack,
    download,
    updateAvatarName,
    clearSelection,
  };
}
