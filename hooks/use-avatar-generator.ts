"use client";

import { useCallback, useState } from "react";
import { useSubscriptionStore } from "@/hooks/use-subscription-store";

// ============================================================================
// Types
// ============================================================================

export type ArtStyle = "anime" | "chibi";
export type AspectRatio = "1:1" | "3:4" | "9:16";
export type TaskType = "avatar" | "expression_base" | "expression_custom";
export type ExpressionSubtype = "happy" | "angry" | "sad";

export interface GenerateReferences {
  imageUrl?: string | null;
  styleUrl?: string | null;
  faceUrl?: string | null;
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
  /** Which expression type is currently generating (null if none) */
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
// Hook
// ============================================================================

// API response shapes from GET /api/avatars/history
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

const INITIAL_STATE: GeneratorState = {
  prompt: "",
  style: "anime",
  aspectRatio: "1:1",
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
        const inFlightGenerations = prev.generations.filter(
          (g) => g.avatarId === null,
        );

        // Build generations: avatars + their packs interleaved by createdAt
        const allGenerations: Generation[] = [];

        for (const item of items) {
          const avatarGen = historyItemToGeneration(item);
          const packs = item.packs ?? [];

          // Convert packs to Generation objects
          const packGenerations = packs.map((pack) =>
            historyPackToGeneration(
              pack,
              item.id,
              item.slug,
              item.style as ArtStyle,
              (item.aspectRatio as AspectRatio) || "1:1",
            ),
          );

          // Add all (avatar + packs), packs first (most recent first)
          allGenerations.push(...packGenerations, avatarGen);
        }

        // Sort all by createdAt descending (most recent first)
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

  // ── Generate ──────────────────────────────────────────────────────────

  const generate = useCallback(
    async (references?: GenerateReferences) => {
      const genId = crypto.randomUUID();
      const prompt = state.prompt;
      const style = state.style;
      const aspectRatio = state.aspectRatio;

      setState((prev) => ({
        ...prev,
        isGenerating: true,
        error: null,
        generations: [
          {
            id: genId,
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
            references: references
              ? {
                  imageUrl: references.imageUrl,
                  styleUrl: references.styleUrl,
                  faceUrl: references.faceUrl,
                }
              : undefined,
          }),
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
                  aspectRatio: data.aspectRatio || g.aspectRatio,
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
    },
    [state.prompt, state.style, state.aspectRatio, fetchBalance],
  );

  // ── Regenerate with specific params (without changing form state) ─────

  const regenerate = useCallback(
    async (prompt: string, style: ArtStyle, aspectRatio: AspectRatio) => {
      const genId = crypto.randomUUID();

      setState((prev) => ({
        ...prev,
        isGenerating: true,
        error: null,
        generations: [
          {
            id: genId,
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
          }),
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
                  aspectRatio: data.aspectRatio || g.aspectRatio,
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
    },
    [fetchBalance],
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

        // Toggle: clicking same candidate again deselects
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

  // ── Generate expression pack ─────────────────────────────────────────

  const generateExpressionPack = useCallback(
    async (packType: "base" | "custom", subtype?: ExpressionSubtype) => {
      const selected = state.selected;
      if (!selected) return;

      const genId = crypto.randomUUID();

      // Find the current generation to inherit style/aspectRatio
      const parentGen = state.generations.find(
        (g) => g.id === selected.generationId,
      );

      const isBase = packType === "base";
      const skeletonCount = isBase ? 4 : 2;
      const prompt = isBase
        ? "Base Expressions"
        : `${(subtype ?? "").charAt(0).toUpperCase() + (subtype ?? "").slice(1)} Expressions`;

      // Insert generating skeleton card
      setState((prev) => {
        // Re-read parent from latest state to get slug set by select
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
            // If avatar is already completed, that's fine — ignore
            if (selectData.error !== "Avatar not ready for selection") {
              throw new Error(selectData.error || "Failed to select base");
            }
          } else {
            const selectData = await selectRes.json();
            // Mark base as selected and store the slug
            setState((prev) => ({
              ...prev,
              selected: prev.selected
                ? { ...prev.selected, baseSelected: true }
                : null,
              // Update the parent avatar generation with slug from select response
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
        const imageUrls = (
          data.expressions as {
            id: string;
            type: string;
            status: string;
            imageUrl: string | null;
          }[]
        )
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
      } catch {
        setState((prev) => ({
          ...prev,
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
    },
    [state.selected, state.generations, fetchBalance],
  );

  // ── Download (auto-detect format: png if no expressions, zip if has) ──

  const download = useCallback(async () => {
    const selected = state.selected;
    if (!selected) return;

    // Only select base image if not already selected
    if (!selected.baseSelected) {
      await fetch(`/api/avatars/${selected.avatarId}/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedIndex: selected.candidateIndex }),
      });
    }

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
