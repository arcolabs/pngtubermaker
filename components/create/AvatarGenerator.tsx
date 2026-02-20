"use client";

import { useEffect } from "react";
import { useAvatarGenerator } from "@/hooks/use-avatar-generator";
import { GenerationGroup } from "./GenerationGroup";
import { GeneratorForm } from "./GeneratorForm";

export function AvatarGenerator() {
  const {
    state,
    creditBalance,
    fetchBalance,
    updatePrompt,
    updateStyle,
    generate,
    selectCandidate,
    generateExpressions,
    download,
    updateAvatarName,
    clearSelection,
  } = useAvatarGenerator();

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Generator form — always visible at top */}
      <GeneratorForm
        prompt={state.prompt}
        style={state.style}
        creditBalance={creditBalance}
        isGenerating={state.isGenerating}
        onPromptChange={updatePrompt}
        onStyleChange={updateStyle}
        onGenerate={generate}
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
              onGenerateExpressions={generateExpressions}
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
