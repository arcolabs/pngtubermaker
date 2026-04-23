"use client";

import { X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  type ArtStyle,
  useAvatarGenerator,
} from "@/hooks/use-avatar-generator";
import { useReferencePersistentState } from "@/hooks/use-reference-persistent-state";
import type { ReferenceHandlers } from "@/types/reference";
import { ExpressionResultsCard } from "./ExpressionResultsCard";
import { GenerationGroup } from "./GenerationGroup";
import { GeneratorForm } from "./GeneratorForm";
import { TrialResultUpsell } from "./TrialResultUpsell";

const WELCOME_CREDITS = 1000;

function WelcomeBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="mb-6 relative rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-cyan-400/5 px-5 py-4">
      <button
        type="button"
        onClick={onDismiss}
        className="absolute top-3 right-3 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
      <p className="text-sm sm:text-base text-gray-700 pr-8">
        <span className="font-semibold text-gray-900">Welcome!</span> You have{" "}
        <span className="font-semibold text-primary">
          {WELCOME_CREDITS.toLocaleString()} welcome credits
        </span>{" "}
        — enough for your first avatar and a full expression pack. No credit
        card required.
      </p>
    </div>
  );
}

export function AvatarGenerator() {
  const searchParams = useSearchParams();
  const {
    state,
    creditBalance,
    fetchBalance,
    loadHistory,
    updatePrompt,
    updateStyle,
    generate,
    regenerate,
    selectCandidate,
    generateExpressionPack,
    download,
  } = useAvatarGenerator();

  // Reference state management
  const {
    referenceFile,
    gallery,
    setReferenceFile,
    addToGallery,
    removeFromGallery,
  } = useReferencePersistentState();

  const isWelcome = searchParams.get("welcome") === "1";
  const [showWelcome, setShowWelcome] = useState(isWelcome);

  // Show upsell when user runs out of welcome credits
  const showUpsell =
    creditBalance !== null &&
    creditBalance === 0 &&
    state.generations.some(
      (g) => g.type === "avatar" && g.status === "completed",
    );

  useEffect(() => {
    fetchBalance();
    loadHistory();
  }, [fetchBalance, loadHistory]);

  // Dismiss welcome banner when user starts generating
  useEffect(() => {
    if (state.isGenerating) setShowWelcome(false);
  }, [state.isGenerating]);

  // Pre-fill prompt from URL query parameter (e.g. /create?prompt=...)
  useEffect(() => {
    const promptParam = searchParams.get("prompt");
    if (promptParam && !state.prompt) {
      updatePrompt(promptParam);
    }
  }, [searchParams, state.prompt, updatePrompt]);

  // Generate with reference
  const handleGenerate = () => {
    generate({ referenceUrl: referenceFile?.url || null });
  };

  // Regenerate with same params (always 1:1 ratio)
  const handleRegenerate = (prompt: string, style: string) => {
    regenerate(prompt, style as ArtStyle, "1:1");
  };

  // Bundle reference state + callbacks into one object
  const reference: ReferenceHandlers = useMemo(
    () => ({
      referenceFile,
      gallery,
      onReferenceFileChange: setReferenceFile,
      onImageUploaded: addToGallery,
      onRemoveFromGallery: removeFromGallery,
    }),
    [referenceFile, gallery, setReferenceFile, addToGallery, removeFromGallery],
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {showWelcome && <WelcomeBanner onDismiss={() => setShowWelcome(false)} />}

      {/* Generator form — always visible at top */}
      <GeneratorForm
        prompt={state.prompt}
        style={state.style}
        creditBalance={creditBalance}
        isGenerating={state.isGenerating}
        reference={reference}
        onPromptChange={updatePrompt}
        onStyleChange={updateStyle}
        onGenerate={handleGenerate}
      />

      {/* Global error */}
      {state.error && (
        <div className="alert alert-error mt-4">
          <span>{state.error}</span>
        </div>
      )}

      {/* Generation feed — avatar cards + grouped expression cards */}
      {state.generations.length > 0 && (
        <div className="mt-6 space-y-4">
          {state.generations
            .filter((gen) => gen.type === "avatar")
            .map((gen) => {
              const exprGens = state.generations.filter(
                (eg) => eg.avatarId === gen.avatarId && eg.type !== "avatar",
              );
              return (
                <div key={gen.id} className="space-y-4">
                  <GenerationGroup
                    generation={gen}
                    allGenerations={state.generations}
                    selected={state.selected}
                    creditBalance={creditBalance}
                    onSelectCandidate={selectCandidate}
                    onGenerateExpressionPack={generateExpressionPack}
                    onRegenerate={handleRegenerate}
                  />
                  {exprGens.length > 0 && (
                    <ExpressionResultsCard
                      expressions={exprGens}
                      avatarId={gen.avatarId || gen.id}
                      avatarSlug={gen.slug}
                      onDownload={download}
                    />
                  )}
                </div>
              );
            })}

          {/* Upsell — shown when welcome credits are depleted */}
          {showUpsell && <TrialResultUpsell />}
        </div>
      )}
    </div>
  );
}
