"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import {
  type ArtStyle,
  type AspectRatio,
  useAvatarGenerator,
} from "@/hooks/use-avatar-generator";
import { useReferencePersistentState } from "@/hooks/use-reference-persistent-state";
import type { ReferenceHandlers } from "@/types/reference";
import { GenerationGroup } from "./GenerationGroup";
import { GeneratorForm } from "./GeneratorForm";

export function AvatarGenerator() {
  const searchParams = useSearchParams();
  const {
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
  } = useAvatarGenerator();

  // Reference state management
  const {
    activeType,
    imageFile,
    styleFile,
    faceFile,
    gallery,
    setActiveType,
    setImageFile,
    setStyleFile,
    setFaceFile,
    addToGallery,
    removeFromGallery,
  } = useReferencePersistentState();

  useEffect(() => {
    fetchBalance();
    loadHistory();
  }, [fetchBalance, loadHistory]);

  // Pre-fill prompt from URL query parameter (e.g. /create?prompt=...)
  useEffect(() => {
    const promptParam = searchParams.get("prompt");
    if (promptParam && !state.prompt) {
      updatePrompt(promptParam);
    }
  }, [searchParams, state.prompt, updatePrompt]);

  // Generate with references
  const handleGenerate = () => {
    const references = {
      imageUrl: imageFile?.url || null,
      styleUrl: styleFile?.url || null,
      faceUrl: faceFile?.url || null,
    };
    generate(references);
  };

  // Regenerate with same params
  const handleRegenerate = (
    prompt: string,
    style: string,
    aspectRatio: string,
  ) => {
    regenerate(prompt, style as ArtStyle, aspectRatio as AspectRatio);
  };

  // Bundle all reference state + callbacks into one object
  const reference: ReferenceHandlers = useMemo(
    () => ({
      activeType,
      imageFile,
      styleFile,
      faceFile,
      gallery,
      onActiveTypeChange: setActiveType,
      onImageFileChange: setImageFile,
      onStyleFileChange: setStyleFile,
      onFaceFileChange: setFaceFile,
      onImageUploaded: addToGallery,
      onRemoveFromGallery: removeFromGallery,
    }),
    [
      activeType,
      imageFile,
      styleFile,
      faceFile,
      gallery,
      setActiveType,
      setImageFile,
      setStyleFile,
      setFaceFile,
      addToGallery,
      removeFromGallery,
    ],
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Generator form — always visible at top */}
      <GeneratorForm
        prompt={state.prompt}
        style={state.style}
        aspectRatio={state.aspectRatio}
        creditBalance={creditBalance}
        isGenerating={state.isGenerating}
        reference={reference}
        onPromptChange={updatePrompt}
        onStyleChange={updateStyle}
        onAspectRatioChange={updateAspectRatio}
        onGenerate={handleGenerate}
      />

      {/* Global error */}
      {state.error && (
        <div className="alert alert-error mt-4">
          <span>{state.error}</span>
        </div>
      )}

      {/* Generation feed — newest first */}
      {state.generations.length > 0 && (
        <div className="mt-6 space-y-4">
          {state.generations.map((gen) => (
            <GenerationGroup
              key={gen.id}
              generation={gen}
              allGenerations={state.generations}
              selected={state.selected}
              creditBalance={creditBalance}
              onSelectCandidate={selectCandidate}
              onGenerateExpressionPack={generateExpressionPack}
              onDownload={download}
              onRegenerate={handleRegenerate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
