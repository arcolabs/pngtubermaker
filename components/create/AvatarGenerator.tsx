"use client";

import { useEffect, useMemo } from "react";
import { useAvatarGenerator } from "@/hooks/use-avatar-generator";
import { useReferencePersistentState } from "@/hooks/use-reference-persistent-state";
import type { ReferenceHandlers } from "@/types/reference";
import { GenerationGroup } from "./GenerationGroup";
import { GeneratorForm } from "./GeneratorForm";

export function AvatarGenerator() {
  const {
    state,
    creditBalance,
    fetchBalance,
    loadHistory,
    updatePrompt,
    updateStyle,
    generate,
    selectCandidate,
    generateSingleExpression,
    download,
    updateAvatarName,
    clearSelection,
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

  // Generate with references
  const handleGenerate = () => {
    const references = {
      imageUrl: imageFile?.url || null,
      styleUrl: styleFile?.url || null,
      faceUrl: faceFile?.url || null,
    };
    generate(references);
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

      {/* Generation feed — newest first */}
      {state.generations.length > 0 && (
        <div className="mt-6 space-y-4">
          {state.generations.map((gen) => (
            <GenerationGroup
              key={gen.id}
              generation={gen}
              selected={state.selected}
              creditBalance={creditBalance}
              onSelectCandidate={selectCandidate}
              onGenerateSingleExpression={generateSingleExpression}
              onUpdateAvatarName={updateAvatarName}
              onDownload={download}
              onClearSelection={clearSelection}
            />
          ))}
        </div>
      )}
    </div>
  );
}
